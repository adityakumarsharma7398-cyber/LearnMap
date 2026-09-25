import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Course, Material, Concept, ConceptRelationship, MaterialConcept
from app.schemas.schemas import MaterialResponse
from app.services.pdf_service import PDFService
from app.services.ai_service import AIService

router = APIRouter(tags=["Materials"])

@router.post("/courses/{course_id}/materials", response_model=MaterialResponse)
async def upload_material(
    course_id: str,
    title: str = Form(...),
    type: str = Form("PDF"),
    file: UploadFile = File(None),
    text_content: str = Form(None),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    extracted_text = ""
    file_url = None

    if file:
        file_bytes = await file.read()
        extracted_text = PDFService.extract_text(file_bytes, file.filename)
        file_url = f"/uploads/{file.filename}"
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from the uploaded PDF. Please make sure the PDF has selectable text or enter syllabus text manually."
            )
    elif text_content:
        extracted_text = text_content
    else:
        extracted_text = f"Study notes for {title}"

    material = Material(
        course_id=course_id,
        title=title,
        type=type,
        file_url=file_url,
        extracted_text=extracted_text
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    # Automatically trigger processing to build concepts and relationships from extracted text
    if extracted_text and len(extracted_text.strip()) >= 10:
        concepts_data, relationships_data = AIService.extract_concepts_and_relationships(
            extracted_text, course_name=course.name
        )

        existing_concepts = {c.name.lower(): c for c in db.query(Concept).filter(Concept.course_id == course_id).all()}
        concept_map = {c.name: c.id for c in existing_concepts.values()}
        new_concepts = []

        for c_data in concepts_data:
            c_name = c_data["name"]
            if c_name.lower() not in existing_concepts:
                new_c = Concept(
                    course_id=course_id,
                    name=c_name,
                    description=c_data.get("description", ""),
                    status=c_data.get("status", "NOT_STARTED")
                )
                db.add(new_c)
                db.flush()
                concept_map[c_name] = new_c.id
                existing_concepts[c_name.lower()] = new_c
                new_concepts.append(new_c)

            # Map Material to Concept
            target_concept_id = concept_map.get(c_name)
            if target_concept_id:
                mat_concept_exists = db.query(MaterialConcept).filter(
                    MaterialConcept.material_id == material.id,
                    MaterialConcept.concept_id == target_concept_id
                ).first()
                if not mat_concept_exists:
                    db.add(MaterialConcept(material_id=material.id, concept_id=target_concept_id, relevance=1.0))

        for r in relationships_data:
            src_id = concept_map.get(r["source"])
            tgt_id = concept_map.get(r["target"])
            if src_id and tgt_id and src_id != tgt_id:
                existing_rel = db.query(ConceptRelationship).filter(
                    ConceptRelationship.source_concept_id == src_id,
                    ConceptRelationship.target_concept_id == tgt_id
                ).first()
                if not existing_rel:
                    db.add(ConceptRelationship(
                        source_concept_id=src_id,
                        target_concept_id=tgt_id,
                        relationship_type=r.get("type", "PREREQUISITE"),
                        confidence=r.get("confidence", 1.0)
                    ))

        # Pre-seed diagnostic questions for newly created concepts
        from app.models.models import Question
        for c in new_concepts:
            questions_data = AIService.generate_questions(c.name)
            for q in questions_data:
                db.add(Question(
                    concept_id=c.id,
                    question_text=q["question_text"],
                    options=q["options"],
                    correct_answer=q["correct_answer"],
                    difficulty=q.get("difficulty", "MEDIUM"),
                    explanation=q.get("explanation", ""),
                    generated_by_ai=True
                ))

        # Initial recommendation if course has no pending recommendation
        from app.models.models import Recommendation
        rec_exists = db.query(Recommendation).join(Concept).filter(
            Concept.course_id == course_id,
            Recommendation.status == "PENDING"
        ).first()

        if not rec_exists and new_concepts:
            target_c = next((c for c in new_concepts if c.status == "NOT_STARTED"), new_concepts[0])
            db.add(Recommendation(
                user_id=course.user_id,
                concept_id=target_c.id,
                type="LEARN_NEXT",
                reason=f"Start with {target_c.name} to begin your structured progression through {course.name}.",
                based_on=f"Sequential prerequisite path for {course.name}.",
                status="PENDING"
            ))

        db.commit()

    return material

@router.post("/materials/{material_id}/process", response_model=dict)
def process_material(material_id: str, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    course = material.course
    concepts_data, relationships_data = AIService.extract_concepts_and_relationships(
        material.extracted_text or material.title, course_name=course.name if course else ""
    )

    return {
        "status": "success",
        "material_id": material.id,
        "extracted_concepts_count": len(concepts_data),
        "extracted_relationships_count": len(relationships_data)
    }

@router.get("/courses/{course_id}/materials", response_model=List[MaterialResponse])
def get_materials(course_id: str, db: Session = Depends(get_db)):
    return db.query(Material).filter(Material.course_id == course_id).all()

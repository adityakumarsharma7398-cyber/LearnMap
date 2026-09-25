from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Course, Concept, ConceptRelationship
from app.schemas.schemas import CourseCreate, CourseResponse
from app.utils.auth import get_optional_user, get_current_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("", response_model=CourseResponse)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@learnmap.ai").first() or db.query(User).first()
        if not current_user:
            current_user = User(
                name="Demo Student",
                email="demo@learnmap.ai",
                password_hash="demo"
            )
            db.add(current_user)
            db.commit()
            db.refresh(current_user)

    course = Course(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        syllabus_text=payload.syllabus_text
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    # If syllabus is provided, automatically extract concepts & relationships
    if payload.syllabus_text and len(payload.syllabus_text.strip()) > 10:
        concepts_data, relationships_data = AIService.extract_concepts_and_relationships(
            payload.syllabus_text, course_name=payload.name
        )
        
        concept_map = {}
        new_concepts = []
        for c in concepts_data:
            new_concept = Concept(
                course_id=course.id,
                name=c["name"],
                description=c.get("description", ""),
                status=c.get("status", "NOT_STARTED")
            )
            db.add(new_concept)
            db.flush()
            concept_map[c["name"]] = new_concept.id
            new_concepts.append(new_concept)
        
        for r in relationships_data:
            src_id = concept_map.get(r["source"])
            tgt_id = concept_map.get(r["target"])
            if src_id and tgt_id and src_id != tgt_id:
                rel = ConceptRelationship(
                    source_concept_id=src_id,
                    target_concept_id=tgt_id,
                    relationship_type=r.get("type", "PREREQUISITE"),
                    confidence=r.get("confidence", 1.0)
                )
                db.add(rel)

        # Pre-seed diagnostic questions
        from app.models.models import Question, Recommendation
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

        if new_concepts:
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

    concept_count = db.query(Concept).filter(Concept.course_id == course.id).count()
    
    return {
        "id": course.id,
        "user_id": course.user_id,
        "name": course.name,
        "description": course.description,
        "syllabus_text": course.syllabus_text,
        "created_at": course.created_at,
        "concept_count": concept_count
    }

@router.get("", response_model=List[CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    query = db.query(Course)
    if current_user:
        courses = query.filter(Course.user_id == current_user.id).all()
        if not courses:
            courses = query.all()
    else:
        courses = query.all()

    if not courses:
        from app.routers.demo import reset_demo_seed
        reset_demo_seed(db)
        courses = db.query(Course).all()

    result = []
    for c in courses:
        count = db.query(Concept).filter(Concept.course_id == c.id).count()
        result.append({
            "id": c.id,
            "user_id": c.user_id,
            "name": c.name,
            "description": c.description,
            "syllabus_text": c.syllabus_text,
            "created_at": c.created_at,
            "concept_count": count
        })
    return result

@router.get("/{id}", response_model=CourseResponse)
def get_course(id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    count = db.query(Concept).filter(Concept.course_id == course.id).count()
    return {
        "id": course.id,
        "user_id": course.user_id,
        "name": course.name,
        "description": course.description,
        "syllabus_text": course.syllabus_text,
        "created_at": course.created_at,
        "concept_count": count
    }

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Course, Concept, ConceptRelationship, MaterialConcept, Material, LearningProgress, Attempt, Question
from app.schemas.schemas import ConceptResponse, ConceptDetailResponse, LearnMapResponse, MapNode, MapEdge, MapNodeData, MaterialResponse
from app.services.ai_service import AIService

router = APIRouter(tags=["Concepts"])

@router.get("/courses/{course_id}/concepts", response_model=List[ConceptResponse])
def get_course_concepts(course_id: str, db: Session = Depends(get_db)):
    concepts = db.query(Concept).filter(Concept.course_id == course_id).all()
    results = []
    for c in concepts:
        progress = db.query(LearningProgress).filter(LearningProgress.concept_id == c.id).first()
        score = progress.score if progress else 0.0
        attempts_count = progress.attempts_count if progress else 0
        results.append({
            "id": c.id,
            "course_id": c.course_id,
            "name": c.name,
            "description": c.description,
            "status": c.status,
            "score": score,
            "attempts_count": attempts_count,
            "created_at": c.created_at
        })
    return results

@router.get("/concepts/{concept_id}", response_model=ConceptDetailResponse)
def get_concept_detail(concept_id: str, db: Session = Depends(get_db)):
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    # Fetch Prerequisites
    prereq_rels = db.query(ConceptRelationship).filter(
        ConceptRelationship.target_concept_id == concept_id,
        ConceptRelationship.relationship_type == "PREREQUISITE"
    ).all()
    prereq_ids = [r.source_concept_id for r in prereq_rels]
    prerequisites = db.query(Concept).filter(Concept.id.in_(prereq_ids)).all() if prereq_ids else []

    # Fetch Related Concepts
    related_rels = db.query(ConceptRelationship).filter(
        (
            (ConceptRelationship.source_concept_id == concept_id) |
            (ConceptRelationship.target_concept_id == concept_id)
        ),
        ConceptRelationship.relationship_type == "RELATED"
    ).all()
    related_ids = [
        r.target_concept_id if r.source_concept_id == concept_id else r.source_concept_id
        for r in related_rels
    ]
    related_concepts = db.query(Concept).filter(Concept.id.in_(related_ids)).all() if related_ids else []

    # Fetch Linked Materials
    mat_links = db.query(MaterialConcept).filter(MaterialConcept.concept_id == concept_id).all()
    mat_ids = [m.material_id for m in mat_links]
    materials = db.query(Material).filter(Material.id.in_(mat_ids)).all() if mat_ids else []

    # Fetch Practice Stats
    progress = db.query(LearningProgress).filter(LearningProgress.concept_id == concept_id).first()
    accuracy = progress.score if progress else 0.0
    attempts_count = progress.attempts_count if progress else 0

    # Generate or fetch explanation from AI service
    explanation_data = AIService.get_concept_explanation(concept.name)

    return {
        "id": concept.id,
        "course_id": concept.course_id,
        "name": concept.name,
        "description": concept.description,
        "status": concept.status,
        "score": accuracy,
        "attempts_count": attempts_count,
        "created_at": concept.created_at,
        "prerequisites": prerequisites,
        "related_concepts": related_concepts,
        "accuracy": accuracy,
        "recent_attempts": attempts_count,
        "materials": materials,
        "ai_explanation": explanation_data.get("what", "") + "\n\n" + explanation_data.get("how", ""),
        "ai_example": explanation_data.get("example", "")
    }

@router.get("/courses/{course_id}/map", response_model=LearnMapResponse)
def get_learn_map(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    concepts = db.query(Concept).filter(Concept.course_id == course_id).all()
    concept_ids = [c.id for c in concepts]

    relationships = db.query(ConceptRelationship).filter(
        ConceptRelationship.source_concept_id.in_(concept_ids),
        ConceptRelationship.target_concept_id.in_(concept_ids)
    ).all()

    # Pre-calculate stats
    stats = {
        "total": len(concepts),
        "strong": sum(1 for c in concepts if c.status == "STRONG"),
        "learning": sum(1 for c in concepts if c.status == "LEARNING"),
        "needs_attention": sum(1 for c in concepts if c.status == "NEEDS_ATTENTION"),
        "not_started": sum(1 for c in concepts if c.status == "NOT_STARTED"),
    }

    # Build Layout Positions (Structured tree/layered topological layout for aesthetic graph)
    # Default visual positions tailored for standard and custom concepts
    nodes: List[MapNode] = []
    
    # Calculate positions based on concept index / level
    pos_presets = {
        "Arrays": {"x": 350, "y": 50},
        "Linked Lists": {"x": 350, "y": 180},
        "Stacks": {"x": 160, "y": 320},
        "Queues": {"x": 540, "y": 320},
        "Circular Queue": {"x": 540, "y": 470},
        "Recursion": {"x": 160, "y": 470},
        "Trees": {"x": 350, "y": 620},
        "Graphs": {"x": 350, "y": 770},
    }

    # Fallback dynamic grid positioning if custom course
    col_width = 280
    row_height = 150
    for idx, c in enumerate(concepts):
        progress = db.query(LearningProgress).filter(LearningProgress.concept_id == c.id).first()
        accuracy = progress.score if progress else 0.0
        attempts_count = progress.attempts_count if progress else 0

        pos = pos_presets.get(c.name)
        if not pos:
            col = idx % 3
            row = idx // 3
            pos = {"x": 100 + col * col_width, "y": 80 + row * row_height}

        nodes.append(
            MapNode(
                id=c.id,
                type="customConcept",
                position=pos,
                data=MapNodeData(
                    id=c.id,
                    label=c.name,
                    status=c.status,
                    description=c.description,
                    accuracy=accuracy,
                    attempts_count=attempts_count,
                    course_id=course_id
                )
            )
        )

    # Build Edges
    edges: List[MapEdge] = []
    for r in relationships:
        is_prereq = (r.relationship_type == "PREREQUISITE")
        edge_style = {
            "stroke": "#111111",
            "strokeWidth": 2.5 if is_prereq else 1.8,
            "strokeDasharray": "" if is_prereq else "5 5"
        }
        edges.append(
            MapEdge(
                id=f"e-{r.source_concept_id}-{r.target_concept_id}",
                source=r.source_concept_id,
                target=r.target_concept_id,
                label="prereq" if is_prereq else "related",
                animated=is_prereq,
                style=edge_style
            )
        )

    return LearnMapResponse(
        course_id=course.id,
        course_name=course.name,
        nodes=nodes,
        edges=edges,
        stats=stats
    )

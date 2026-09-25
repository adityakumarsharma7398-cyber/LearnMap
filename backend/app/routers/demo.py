from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Course, Concept, ConceptRelationship, Question, Material, MaterialConcept, LearningProgress, Weakness, Recommendation, Attempt
from app.utils.auth import hash_password
from app.services.ai_service import AIService

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/reset-seed")
def reset_demo_seed(db: Session = Depends(get_db)):
    """
    Seeds the standard Data Structures & Algorithms course for the core demo:
    Circular Queue starts as NOT_STARTED so judges can experience the full loop:
    Learn -> Practice -> Make Mistakes -> Map Changes to 🔴 -> Recommendation appears.
    """
    # 1. Ensure Demo User
    user = db.query(User).filter(User.email == "demo@learnmap.ai").first()
    if not user:
        user = User(
            name="Alex Rivera",
            email="demo@learnmap.ai",
            password_hash=hash_password("learnmap2026")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 2. Clean up any existing Demo Course and orphaned records
    existing_courses = db.query(Course).filter(
        (Course.name == "Data Structures & Algorithms") | (Course.user_id == user.id)
    ).all()
    
    for ec in existing_courses:
        concept_ids = [c_id for (c_id,) in db.query(Concept.id).filter(Concept.course_id == ec.id).all()]
        if concept_ids:
            question_ids = [q_id for (q_id,) in db.query(Question.id).filter(Question.concept_id.in_(concept_ids)).all()]
            if question_ids:
                db.query(Attempt).filter(Attempt.question_id.in_(question_ids)).delete(synchronize_session=False)
            db.query(Question).filter(Question.concept_id.in_(concept_ids)).delete(synchronize_session=False)
            db.query(ConceptRelationship).filter(
                (ConceptRelationship.source_concept_id.in_(concept_ids)) |
                (ConceptRelationship.target_concept_id.in_(concept_ids))
            ).delete(synchronize_session=False)
            db.query(MaterialConcept).filter(MaterialConcept.concept_id.in_(concept_ids)).delete(synchronize_session=False)
            db.query(LearningProgress).filter(LearningProgress.concept_id.in_(concept_ids)).delete(synchronize_session=False)
            db.query(Weakness).filter(Weakness.concept_id.in_(concept_ids)).delete(synchronize_session=False)
            db.query(Recommendation).filter(Recommendation.concept_id.in_(concept_ids)).delete(synchronize_session=False)
            db.query(Concept).filter(Concept.course_id == ec.id).delete(synchronize_session=False)
        db.query(Material).filter(Material.course_id == ec.id).delete(synchronize_session=False)
        db.delete(ec)
    db.commit()

    course = Course(
        user_id=user.id,
        name="Data Structures & Algorithms",
        description="Master linear & hierarchical data structures, search algorithms, and memory management with visual concept graphs.",
        syllabus_text="""1. Arrays & Memory Locality
2. Singly and Doubly Linked Lists
3. Stacks & LIFO Applications
4. Queues & FIFO Scheduling
5. Circular Queue & Ring Buffers
6. Recursion & Divide-and-Conquer
7. Binary Trees & Tree Traversals
8. Graphs & Network Representations"""
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    # 3. Create Sample Material
    material = Material(
        course_id=course.id,
        title="DSA_Comprehensive_Lecture_Notes.pdf",
        type="PDF",
        file_url="/uploads/DSA_Comprehensive_Lecture_Notes.pdf",
        extracted_text="Data Structures and Algorithms lecture notes covering Arrays, Linked Lists, Stacks, Linear and Circular Queues, Recursion, Trees, and Graph Traversal algorithms."
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    # 4. Create Concepts
    concepts_spec = [
        {"name": "Arrays", "desc": "Contiguous memory blocks supporting O(1) index lookups.", "status": "STRONG", "score": 92.0, "attempts": 10},
        {"name": "Linked Lists", "desc": "Dynamic nodes connected sequentially by pointers.", "status": "STRONG", "score": 88.0, "attempts": 8},
        {"name": "Stacks", "desc": "LIFO structure with push, pop, and top operations.", "status": "STRONG", "score": 85.0, "attempts": 6},
        {"name": "Queues", "desc": "FIFO structure with enqueue and dequeue operations.", "status": "LEARNING", "score": 65.0, "attempts": 4},
        {"name": "Circular Queue", "desc": "Ring buffer using modulo arithmetic to prevent memory wastage.", "status": "NOT_STARTED", "score": 0.0, "attempts": 0},
        {"name": "Recursion", "desc": "Self-referential function execution with base and recursive cases.", "status": "STRONG", "score": 90.0, "attempts": 7},
        {"name": "Trees", "desc": "Hierarchical node structure with root, parent, and child relations.", "status": "NOT_STARTED", "score": 0.0, "attempts": 0},
        {"name": "Graphs", "desc": "Vertices connected by edges for modeling complex networks.", "status": "NOT_STARTED", "score": 0.0, "attempts": 0},
    ]

    concept_objs = {}
    for spec in concepts_spec:
        c = Concept(
            course_id=course.id,
            name=spec["name"],
            description=spec["desc"],
            status=spec["status"]
        )
        db.add(c)
        db.flush()
        concept_objs[spec["name"]] = c

        # Link material
        db.add(MaterialConcept(material_id=material.id, concept_id=c.id, relevance=1.0))

        # Add initial progress if practiced
        if spec["attempts"] > 0:
            db.add(LearningProgress(
                user_id=user.id,
                concept_id=c.id,
                status=spec["status"],
                score=spec["score"],
                attempts_count=spec["attempts"]
            ))

    # 5. Create Relationships
    relationships_spec = [
        ("Arrays", "Linked Lists", "RELATED"),
        ("Linked Lists", "Stacks", "PREREQUISITE"),
        ("Linked Lists", "Queues", "PREREQUISITE"),
        ("Queues", "Circular Queue", "PREREQUISITE"),
        ("Arrays", "Circular Queue", "RELATED"),
        ("Recursion", "Trees", "PREREQUISITE"),
        ("Stacks", "Trees", "RELATED"),
        ("Trees", "Graphs", "PREREQUISITE"),
    ]

    for src_name, tgt_name, rel_type in relationships_spec:
        src = concept_objs.get(src_name)
        tgt = concept_objs.get(tgt_name)
        if src and tgt:
            db.add(ConceptRelationship(
                source_concept_id=src.id,
                target_concept_id=tgt.id,
                relationship_type=rel_type,
                confidence=0.95
            ))

    # 6. Pre-seed Questions for Circular Queue and Queues
    for c_name in ["Circular Queue", "Queues", "Recursion", "Trees"]:
        c = concept_objs.get(c_name)
        if c:
            questions_data = AIService.generate_questions(c_name)
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

    # Initial recommendation
    rec = Recommendation(
        user_id=user.id,
        concept_id=concept_objs["Circular Queue"].id,
        type="LEARN_NEXT",
        reason="Explore Circular Queue next to continue through your Queue progression path.",
        based_on="Sequential curriculum learning path.",
        status="PENDING"
    )
    db.add(rec)

    db.commit()

    return {
        "status": "success",
        "message": "Demo course seeded successfully",
        "course_id": course.id,
        "course_name": course.name,
        "concepts_count": len(concept_objs),
        "user_email": user.email
    }

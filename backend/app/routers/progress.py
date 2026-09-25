from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Course, Concept, LearningProgress, Weakness, Recommendation, User
from app.schemas.schemas import ProgressSummaryResponse, ConceptResponse, WeaknessResponse, RecommendationResponse
from app.utils.auth import get_optional_user

router = APIRouter(tags=["Progress"])

@router.get("/courses/{course_id}/progress", response_model=ProgressSummaryResponse)
def get_course_progress(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    user_id = current_user.id if current_user else None

    concepts = db.query(Concept).filter(Concept.course_id == course_id).all()
    concept_responses = []
    total_score = 0.0
    scored_count = 0

    for c in concepts:
        progress_query = db.query(LearningProgress).filter(LearningProgress.concept_id == c.id)
        if user_id:
            progress = progress_query.filter(LearningProgress.user_id == user_id).first()
            if not progress:
                progress = progress_query.first()
        else:
            progress = progress_query.first()

        score = progress.score if progress else 0.0
        attempts_count = progress.attempts_count if progress else 0

        if progress and progress.attempts_count:
            total_score += score
            scored_count += 1

        concept_responses.append(
            ConceptResponse(
                id=c.id,
                course_id=c.course_id,
                name=c.name,
                description=c.description,
                status=c.status,
                score=score,
                attempts_count=attempts_count,
                created_at=c.created_at
            )
        )

    # Active Weaknesses
    weakness_query = db.query(Weakness).join(Concept).filter(
        Concept.course_id == course_id,
        Weakness.status == "ACTIVE"
    )
    if user_id:
        active_weaknesses = weakness_query.filter(Weakness.user_id == user_id).all()
        if not active_weaknesses:
            active_weaknesses = weakness_query.all()
    else:
        active_weaknesses = weakness_query.all()

    weakness_responses = [
        WeaknessResponse(
            id=w.id,
            concept_id=w.concept_id,
            concept_name=w.concept.name if w.concept else "",
            severity=w.severity,
            reason=w.reason,
            evidence=w.evidence,
            status=w.status,
            detected_at=w.detected_at
        )
        for w in active_weaknesses
    ]

    # Latest Recommendation
    rec_query = db.query(Recommendation).join(Concept).filter(
        Concept.course_id == course_id,
        Recommendation.status == "PENDING"
    ).order_by(Recommendation.created_at.desc())
    if user_id:
        latest_rec = rec_query.filter(Recommendation.user_id == user_id).first()
        if not latest_rec:
            latest_rec = rec_query.first()
    else:
        latest_rec = rec_query.first()

    rec_response = None
    if latest_rec:
        rec_response = RecommendationResponse(
            id=latest_rec.id,
            concept_id=latest_rec.concept_id,
            concept_name=latest_rec.concept.name if latest_rec.concept else "",
            type=latest_rec.type,
            reason=latest_rec.reason,
            based_on=latest_rec.based_on,
            status=latest_rec.status,
            created_at=latest_rec.created_at
        )

    overall_accuracy = (total_score / max(scored_count, 1)) if scored_count > 0 else 0.0

    return ProgressSummaryResponse(
        course_id=course.id,
        course_name=course.name,
        total_concepts=len(concepts),
        strong_count=sum(1 for c in concepts if c.status == "STRONG"),
        learning_count=sum(1 for c in concepts if c.status == "LEARNING"),
        needs_attention_count=sum(1 for c in concepts if c.status == "NEEDS_ATTENTION"),
        not_started_count=sum(1 for c in concepts if c.status == "NOT_STARTED"),
        overall_accuracy=round(overall_accuracy, 1),
        concepts=concept_responses,
        active_weaknesses=weakness_responses,
        next_recommendation=rec_response
    )

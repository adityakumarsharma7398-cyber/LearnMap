from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Recommendation, Concept, User
from app.schemas.schemas import RecommendationResponse
from app.services.recommendation_service import RecommendationService
from app.utils.auth import get_optional_user

router = APIRouter(tags=["Recommendations"])

@router.get("/courses/{course_id}/recommendations/next", response_model=RecommendationResponse)
def get_next_recommendation(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    demo_user = db.query(User).filter(User.email == "demo@learnmap.ai").first() or db.query(User).first()
    user_id = current_user.id if current_user else (demo_user.id if demo_user else "demo-user")

    rec = RecommendationService.generate_next_recommendation(
        db=db,
        user_id=user_id,
        course_id=course_id
    )

    if not rec:
        raise HTTPException(status_code=404, detail="No active recommendation found for this course")

    return RecommendationResponse(
        id=rec.id,
        concept_id=rec.concept_id,
        concept_name=rec.concept.name if rec.concept else "",
        type=rec.type,
        reason=rec.reason,
        based_on=rec.based_on,
        status=rec.status,
        created_at=rec.created_at
    )

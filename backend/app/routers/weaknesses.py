from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Weakness, Concept, User
from app.schemas.schemas import WeaknessResponse
from app.utils.auth import get_optional_user

router = APIRouter(tags=["Weaknesses"])

@router.get("/courses/{course_id}/weaknesses", response_model=List[WeaknessResponse])
def get_course_weaknesses(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    user_id = current_user.id if current_user else None

    query = db.query(Weakness).join(Concept).filter(Concept.course_id == course_id)
    if user_id:
        user_weaknesses = query.filter(Weakness.user_id == user_id).order_by(Weakness.detected_at.desc()).all()
        if user_weaknesses:
            weaknesses = user_weaknesses
        else:
            weaknesses = query.order_by(Weakness.detected_at.desc()).all()
    else:
        weaknesses = query.order_by(Weakness.detected_at.desc()).all()
    
    return [
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
        for w in weaknesses
    ]

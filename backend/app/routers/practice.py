from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Concept, Question, Attempt, User
from app.schemas.schemas import QuestionResponse, QuestionPublicResponse, PracticeSubmissionRequest, PracticeResultResponse, AttemptDetail
from app.services.ai_service import AIService
from app.services.weakness_service import WeaknessService
from app.services.recommendation_service import RecommendationService
from app.utils.auth import get_optional_user

router = APIRouter(tags=["Practice"])

@router.get("/concepts/{concept_id}/questions", response_model=List[QuestionResponse])
def get_concept_questions(concept_id: str, db: Session = Depends(get_db)):
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    questions = db.query(Question).filter(Question.concept_id == concept_id).all()
    if not questions:
        # Generate questions via AIService
        generated_questions = AIService.generate_questions(concept.name)
        questions = []
        for q_data in generated_questions:
            q = Question(
                concept_id=concept_id,
                question_text=q_data["question_text"],
                options=q_data["options"],
                correct_answer=q_data["correct_answer"],
                difficulty=q_data.get("difficulty", "MEDIUM"),
                explanation=q_data.get("explanation", ""),
                generated_by_ai=True
            )
            db.add(q)
            questions.append(q)
        db.commit()
        for q in questions:
            db.refresh(q)

    return questions

@router.post("/concepts/{concept_id}/practice", response_model=PracticeResultResponse)
def submit_practice(
    concept_id: str,
    payload: PracticeSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")

    if not current_user:
        current_user = db.query(User).first()
        if not current_user:
            current_user = User(name="Demo Student", email="demo@learnmap.ai", password_hash="demo")
            db.add(current_user)
            db.commit()
            db.refresh(current_user)

    attempt_records = []
    details: List[AttemptDetail] = []

    for item in payload.answers:
        question = db.query(Question).filter(Question.id == item.question_id).first()
        if not question:
            continue
        
        is_correct = (item.selected_answer.strip().lower() == question.correct_answer.strip().lower())
        attempt = Attempt(
            user_id=current_user.id,
            question_id=question.id,
            selected_answer=item.selected_answer,
            is_correct=is_correct
        )
        db.add(attempt)
        attempt_records.append(attempt)

        details.append(
            AttemptDetail(
                question_id=question.id,
                question_text=question.question_text,
                selected_answer=item.selected_answer,
                correct_answer=question.correct_answer,
                is_correct=is_correct,
                explanation=question.explanation
            )
        )

    db.commit()

    # Trigger Weakness and Progress Evaluation
    evaluation = WeaknessService.evaluate_and_update_progress(
        db=db,
        user_id=current_user.id,
        concept_id=concept.id,
        attempts=attempt_records
    )

    # Trigger Recommendation Engine
    rec = RecommendationService.generate_next_recommendation(
        db=db,
        user_id=current_user.id,
        course_id=concept.course_id
    )

    return PracticeResultResponse(
        concept_id=concept.id,
        concept_name=concept.name,
        total_questions=evaluation.get("total_questions", len(payload.answers)),
        correct_count=evaluation.get("correct_count", 0),
        incorrect_count=evaluation.get("incorrect_count", 0),
        accuracy=evaluation.get("accuracy", 0.0),
        previous_status=evaluation.get("previous_status", "NOT_STARTED"),
        new_status=evaluation.get("new_status", "NOT_STARTED"),
        map_changed=evaluation.get("map_changed", False),
        weakness_detected=evaluation.get("weakness_detected", False),
        weakness_reason=evaluation.get("weakness_reason"),
        weakness_evidence=evaluation.get("weakness_evidence"),
        recommendation=rec.reason if rec else None,
        recommendation_reason=rec.based_on if rec else None,
        details=details
    )

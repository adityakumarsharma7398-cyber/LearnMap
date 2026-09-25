from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import Concept, LearningProgress, Attempt, Weakness, Question
from app.services.ai_service import AIService

class WeaknessService:
    @staticmethod
    def evaluate_and_update_progress(
        db: Session,
        user_id: str,
        concept_id: str,
        attempts: list
    ) -> dict:
        """
        Evaluates submitted attempts, updates learning progress, 
        detects weaknesses, and updates concept status.
        """
        total_questions = len(attempts)
        correct_count = sum(1 for a in attempts if a.is_correct)
        incorrect_count = total_questions - correct_count
        accuracy = (correct_count / max(total_questions, 1)) * 100.0

        concept = db.query(Concept).filter(Concept.id == concept_id).first()
        if not concept:
            return {}

        previous_status = concept.status

        # Deterministic Status Calculation
        if accuracy >= 80.0:
            new_status = "STRONG"
        elif accuracy >= 50.0:
            new_status = "LEARNING"
        else:
            new_status = "NEEDS_ATTENTION"

        # Update Concept Status
        concept.status = new_status

        # Update or Create LearningProgress
        progress = db.query(LearningProgress).filter(
            LearningProgress.user_id == user_id,
            LearningProgress.concept_id == concept_id
        ).first()

        now = datetime.now(timezone.utc)

        if not progress:
            progress = LearningProgress(
                user_id=user_id,
                concept_id=concept_id,
                status=new_status,
                score=accuracy,
                attempts_count=total_questions,
                last_practiced_at=now
            )
            db.add(progress)
        else:
            progress.status = new_status
            progress.score = accuracy
            progress.attempts_count = (progress.attempts_count or 0) + total_questions
            progress.last_practiced_at = now

        # Weakness Detection
        weakness_detected = False
        weakness_record = None
        weakness_analysis = None

        if new_status == "NEEDS_ATTENTION" or incorrect_count >= 2:
            weakness_detected = True
            weakness_analysis = AIService.analyze_mistakes(
                concept_name=concept.name,
                incorrect_count=incorrect_count,
                total_count=total_questions
            )

            existing_weakness = db.query(Weakness).filter(
                Weakness.user_id == user_id,
                Weakness.concept_id == concept_id,
                Weakness.status == "ACTIVE"
            ).first()

            if not existing_weakness:
                weakness_record = Weakness(
                    user_id=user_id,
                    concept_id=concept_id,
                    severity=weakness_analysis["severity"],
                    reason=weakness_analysis["reason"],
                    evidence=weakness_analysis["evidence"],
                    status="ACTIVE",
                    detected_at=now
                )
                db.add(weakness_record)
            else:
                existing_weakness.severity = weakness_analysis["severity"]
                existing_weakness.reason = weakness_analysis["reason"]
                existing_weakness.evidence = weakness_analysis["evidence"]
                existing_weakness.detected_at = now
                weakness_record = existing_weakness
        elif new_status == "STRONG":
            # Resolve existing weakness if mastered
            existing_weakness = db.query(Weakness).filter(
                Weakness.user_id == user_id,
                Weakness.concept_id == concept_id,
                Weakness.status == "ACTIVE"
            ).first()
            if existing_weakness:
                existing_weakness.status = "RESOLVED"

        db.commit()

        map_changed = (previous_status != new_status)

        return {
            "concept_id": concept.id,
            "concept_name": concept.name,
            "total_questions": total_questions,
            "correct_count": correct_count,
            "incorrect_count": incorrect_count,
            "accuracy": round(accuracy, 1),
            "previous_status": previous_status,
            "new_status": new_status,
            "map_changed": map_changed,
            "weakness_detected": weakness_detected,
            "weakness_reason": weakness_analysis["reason"] if weakness_analysis else None,
            "weakness_evidence": weakness_analysis["evidence"] if weakness_analysis else None,
        }

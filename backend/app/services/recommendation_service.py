from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import Concept, ConceptRelationship, LearningProgress, Weakness, Recommendation

class RecommendationService:
    @staticmethod
    def generate_next_recommendation(db: Session, user_id: str, course_id: str) -> Recommendation | None:
        """
        Calculates ONE clear explainable next step based on:
        Student Progress + Weaknesses + Prerequisite Relationships + Recent Attempts
        """
        # 1. Check for Active Weaknesses with HIGH or MEDIUM severity in this course
        active_weakness = (
            db.query(Weakness)
            .join(Concept, Weakness.concept_id == Concept.id)
            .filter(
                Weakness.user_id == user_id,
                Weakness.status == "ACTIVE",
                Concept.course_id == course_id
            )
            .order_by(Weakness.detected_at.desc())
            .first()
        )

        now = datetime.now(timezone.utc)

        if active_weakness and active_weakness.concept:
            concept = active_weakness.concept
            
            # Check prerequisites of this weak concept to provide rich context
            prereqs = (
                db.query(Concept)
                .join(ConceptRelationship, ConceptRelationship.source_concept_id == Concept.id)
                .filter(ConceptRelationship.target_concept_id == concept.id)
                .all()
            )
            prereq_names = [p.name for p in prereqs]
            prereq_str = f" (prerequisites: {', '.join(prereq_names)})" if prereq_names else ""

            reason = f"Review {concept.name} next because you made recent mistakes ({active_weakness.reason}){prereq_str}."
            based_on = f"Active weakness detected on {concept.name} with {active_weakness.severity} severity."

            # Update or create recommendation
            rec = db.query(Recommendation).filter(
                Recommendation.user_id == user_id,
                Recommendation.concept_id == concept.id,
                Recommendation.status == "PENDING"
            ).first()

            if not rec:
                rec = Recommendation(
                    user_id=user_id,
                    concept_id=concept.id,
                    type="REVISE",
                    reason=reason,
                    based_on=based_on,
                    status="PENDING",
                    created_at=now
                )
                db.add(rec)
            else:
                rec.reason = reason
                rec.based_on = based_on
            
            db.commit()
            db.refresh(rec)
            return rec

        # 2. Check for Concepts in LEARNING state
        learning_concept = (
            db.query(Concept)
            .filter(Concept.course_id == course_id, Concept.status == "LEARNING")
            .first()
        )

        if learning_concept:
            reason = f"Continue mastering {learning_concept.name} to solidify your conceptual accuracy and turn it Strong."
            based_on = f"{learning_concept.name} is currently in progress."

            rec = Recommendation(
                user_id=user_id,
                concept_id=learning_concept.id,
                type="PRACTICE",
                reason=reason,
                based_on=based_on,
                status="PENDING",
                created_at=now
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)
            return rec

        # 3. Find Next UNSTARTED concept whose prerequisites are satisfied
        all_concepts = db.query(Concept).filter(Concept.course_id == course_id).all()
        strong_concept_ids = {c.id for c in all_concepts if c.status in ["STRONG", "LEARNING"]}

        for concept in all_concepts:
            if concept.status == "NOT_STARTED":
                # Check prerequisites
                prereqs = (
                    db.query(ConceptRelationship)
                    .filter(
                        ConceptRelationship.target_concept_id == concept.id,
                        ConceptRelationship.relationship_type == "PREREQUISITE"
                    )
                    .all()
                )
                
                # If all prerequisites are completed or no prerequisites
                all_prereqs_met = all(p.source_concept_id in strong_concept_ids for p in prereqs)
                if all_prereqs_met:
                    reason = f"Ready to learn {concept.name}. You have completed all foundational prerequisites."
                    based_on = f"Sequential learning progression through the course graph."

                    rec = Recommendation(
                        user_id=user_id,
                        concept_id=concept.id,
                        type="LEARN_NEXT",
                        reason=reason,
                        based_on=based_on,
                        status="PENDING",
                        created_at=now
                    )
                    db.add(rec)
                    db.commit()
                    db.refresh(rec)
                    return rec

        # 4. Fallback to first available concept
        first_concept = db.query(Concept).filter(Concept.course_id == course_id).first()
        if first_concept:
            rec = Recommendation(
                user_id=user_id,
                concept_id=first_concept.id,
                type="LEARN_NEXT",
                reason=f"Explore and practice {first_concept.name} to advance your map.",
                based_on="Course onboarding path.",
                status="PENDING",
                created_at=now
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)
            return rec

        return None

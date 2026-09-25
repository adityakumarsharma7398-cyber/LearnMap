import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Integer, Float, Boolean, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")
    weaknesses = relationship("Weakness", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    syllabus_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="courses")
    materials = relationship("Material", back_populates="course", cascade="all, delete-orphan")
    concepts = relationship("Concept", back_populates="course", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    type = Column(String(50), default="PDF")  # PDF, NOTES, TEXT
    file_url = Column(String(500), nullable=True)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    course = relationship("Course", back_populates="materials")
    material_concepts = relationship("MaterialConcept", back_populates="material", cascade="all, delete-orphan")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="NOT_STARTED")  # NOT_STARTED, LEARNING, STRONG, NEEDS_ATTENTION
    created_at = Column(DateTime, default=utc_now)

    course = relationship("Course", back_populates="concepts")
    questions = relationship("Question", back_populates="concept", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="concept", cascade="all, delete-orphan")
    weaknesses = relationship("Weakness", back_populates="concept", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="concept", cascade="all, delete-orphan")
    material_concepts = relationship("MaterialConcept", back_populates="concept", cascade="all, delete-orphan")


class ConceptRelationship(Base):
    __tablename__ = "concept_relationships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False)
    target_concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), default="PREREQUISITE")  # PREREQUISITE, RELATED
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=utc_now)

    source_concept = relationship("Concept", foreign_keys=[source_concept_id])
    target_concept = relationship("Concept", foreign_keys=[target_concept_id])


class MaterialConcept(Base):
    __tablename__ = "material_concepts"

    material_id = Column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), primary_key=True)
    concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), primary_key=True)
    relevance = Column(Float, default=1.0)

    material = relationship("Material", back_populates="material_concepts")
    concept = relationship("Concept", back_populates="material_concepts")


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    concept_id = Column(String(36), ForeignKey("concepts.id"), nullable=False)
    status = Column(String(50), default="NOT_STARTED")  # NOT_STARTED, LEARNING, STRONG, NEEDS_ATTENTION
    score = Column(Float, default=0.0)
    attempts_count = Column(Integer, default=0)
    last_practiced_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="learning_progress")
    concept = relationship("Concept", back_populates="learning_progress")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    concept_id = Column(String(36), ForeignKey("concepts.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of string options e.g. ["A", "B", "C", "D"]
    correct_answer = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="MEDIUM")  # EASY, MEDIUM, HARD
    explanation = Column(Text, nullable=True)
    generated_by_ai = Column(Boolean, default=True)

    concept = relationship("Concept", back_populates="questions")
    attempts = relationship("Attempt", back_populates="question", cascade="all, delete-orphan")


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String(255), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    attempted_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")


class Weakness(Base):
    __tablename__ = "weaknesses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    concept_id = Column(String(36), ForeignKey("concepts.id"), nullable=False)
    severity = Column(String(50), default="MEDIUM")  # LOW, MEDIUM, HIGH
    reason = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, RESOLVED
    detected_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="weaknesses")
    concept = relationship("Concept", back_populates="weaknesses")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    concept_id = Column(String(36), ForeignKey("concepts.id"), nullable=False)
    type = Column(String(50), default="REVISE")  # REVISE, LEARN_NEXT, PRACTICE
    reason = Column(Text, nullable=False)
    based_on = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING")  # PENDING, COMPLETED, DISMISSED
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="recommendations")
    concept = relationship("Concept", back_populates="recommendations")

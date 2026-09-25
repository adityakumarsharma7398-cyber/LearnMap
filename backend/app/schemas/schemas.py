from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- Course Schemas -----------------
class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    syllabus_text: Optional[str] = None

class CourseResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    syllabus_text: Optional[str] = None
    created_at: datetime
    concept_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ----------------- Material Schemas -----------------
class MaterialCreate(BaseModel):
    title: str
    type: Optional[str] = "PDF"
    extracted_text: Optional[str] = None

class MaterialResponse(BaseModel):
    id: str
    course_id: str
    title: str
    type: str
    file_url: Optional[str] = None
    extracted_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Concept & Relationship Schemas -----------------
class ConceptResponse(BaseModel):
    id: str
    course_id: str
    name: str
    description: Optional[str] = None
    status: str
    score: Optional[float] = 0.0
    attempts_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class ConceptDetailResponse(ConceptResponse):
    prerequisites: List[ConceptResponse] = []
    related_concepts: List[ConceptResponse] = []
    accuracy: Optional[float] = 0.0
    recent_attempts: Optional[int] = 0
    materials: List[MaterialResponse] = []
    ai_explanation: Optional[str] = None
    ai_example: Optional[str] = None

class ConceptRelationshipResponse(BaseModel):
    id: str
    source_concept_id: str
    target_concept_id: str
    relationship_type: str
    confidence: float

    class Config:
        from_attributes = True


# ----------------- React Flow LearnMap Schemas -----------------
class MapNodeData(BaseModel):
    id: str
    label: str
    status: str  # NOT_STARTED, LEARNING, STRONG, NEEDS_ATTENTION
    description: Optional[str] = None
    accuracy: float = 0.0
    attempts_count: int = 0
    course_id: str

class MapNode(BaseModel):
    id: str
    type: str = "customConcept"
    position: Dict[str, float]
    data: MapNodeData

class MapEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = False
    style: Optional[Dict[str, Any]] = None

class LearnMapResponse(BaseModel):
    course_id: str
    course_name: str
    nodes: List[MapNode]
    edges: List[MapEdge]
    stats: Dict[str, int]  # total, strong, learning, needs_attention, not_started


# ----------------- Practice & Question Schemas -----------------
class QuestionResponse(BaseModel):
    id: str
    concept_id: str
    question_text: str
    options: List[str]
    correct_answer: Optional[str] = None
    difficulty: str
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class QuestionPublicResponse(BaseModel):
    id: str
    concept_id: str
    question_text: str
    options: List[str]
    difficulty: str

    class Config:
        from_attributes = True

class AttemptSubmission(BaseModel):
    question_id: str
    selected_answer: str

class PracticeSubmissionRequest(BaseModel):
    concept_id: str
    answers: List[AttemptSubmission]

class AttemptDetail(BaseModel):
    question_id: str
    question_text: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    explanation: Optional[str] = None

class PracticeResultResponse(BaseModel):
    concept_id: str
    concept_name: str
    total_questions: int
    correct_count: int
    incorrect_count: int
    accuracy: float
    previous_status: str
    new_status: str
    map_changed: bool
    weakness_detected: bool
    weakness_reason: Optional[str] = None
    weakness_evidence: Optional[str] = None
    recommendation: Optional[str] = None
    recommendation_reason: Optional[str] = None
    details: List[AttemptDetail] = []


# ----------------- Weakness & Recommendation Schemas -----------------
class WeaknessResponse(BaseModel):
    id: str
    concept_id: str
    concept_name: Optional[str] = None
    severity: str
    reason: str
    evidence: Optional[str] = None
    status: str
    detected_at: datetime

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: str
    concept_id: str
    concept_name: Optional[str] = None
    type: str  # REVISE, LEARN_NEXT, PRACTICE
    reason: str
    based_on: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProgressSummaryResponse(BaseModel):
    course_id: str
    course_name: str
    total_concepts: int
    strong_count: int
    learning_count: int
    needs_attention_count: int
    not_started_count: int
    overall_accuracy: float
    concepts: List[ConceptResponse]
    active_weaknesses: List[WeaknessResponse]
    next_recommendation: Optional[RecommendationResponse] = None

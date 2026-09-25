# LearnMap — Step 4: Technical Architecture

## Goal

Define how the LearnMap frontend, backend, database, AI services, knowledge graph, and recommendation engine work together.

The architecture should remain **hackathon-MVP focused** and avoid unnecessary infrastructure.

---

# 1. Overall Architecture

```text
                    ┌─────────────────────┐
                    │      FRONTEND       │
                    │ React + Tailwind    │
                    │                     │
                    │ • Dashboard         │
                    │ • LearnMap           │
                    │ • Concept View      │
                    │ • Practice          │
                    │ • Recommendations   │
                    └──────────┬──────────┘
                               │
                         REST API / JSON
                               │
                    ┌──────────▼──────────┐
                    │       BACKEND       │
                    │      FastAPI        │
                    │                     │
                    │ • Auth              │
                    │ • Courses           │
                    │ • Materials         │
                    │ • Concepts          │
                    │ • Practice          │
                    │ • Progress          │
                    │ • Recommendations   │
                    └───────┬─────┬──────┘
                            │     │
              ┌─────────────┘     └──────────────┐
              ▼                                  ▼
    ┌───────────────────┐              ┌──────────────────┐
    │     DATABASE      │              │    AI SERVICE    │
    │    PostgreSQL     │              │                  │
    │                   │              │ LLM + Embeddings │
    │ Users             │              │                  │
    │ Courses           │              │ • Extraction     │
    │ Materials         │              │ • Explanation    │
    │ Concepts          │              │ • Questions      │
    │ Relationships     │              │ • Mistake        │
    │ Progress          │              │   Analysis       │
    │ Attempts          │              │ • Recommendation │
    └───────────────────┘              └────────┬─────────┘
                                                │
                                      ┌─────────▼─────────┐
                                      │  KNOWLEDGE GRAPH  │
                                      │                   │
                                      │ Concepts          │
                                      │ Prerequisites     │
                                      │ Relationships     │
                                      └─────────┬─────────┘
                                                │
                                      ┌─────────▼─────────┐
                                      │ RECOMMENDATION    │
                                      │ ENGINE            │
                                      │                   │
                                      │ Weakness          │
                                      │ + Prerequisites   │
                                      │ + Progress        │
                                      │ → Next Step       │
                                      └───────────────────┘
```

---

# 2. Frontend

## Suggested Stack

- React
- Tailwind CSS
- React Flow or similar graph visualization library
- Axios / Fetch for API communication

## Main Screens

```text
Login / Signup
      ↓
Dashboard
      ↓
Course
      ↓
LearnMap
 ┌────┼──────────┐
 ↓    ↓          ↓
Concept  Practice  Progress
 View
      ↓
Recommendation
```

## Most Important Frontend Component

### LearnMap

The map should visually show concepts and the student's current state.

```text
Arrays 🟢
   ↓
Linked Lists 🟢
   ↓
Stacks 🟢 ─── Queue 🟡
                  ↓
             Circular Queue 🔴
                  ↓
               Trees ⚪
```

### Status Meaning

- 🟢 Strong
- 🟡 Learning
- 🔴 Needs Attention
- ⚪ Not Started

---

# 3. Backend

Use **FastAPI** as the central application layer.

The frontend should not directly communicate with the database or AI model.

```text
Frontend
   ↓
FastAPI
   ↓
Database / AI / Graph / Recommendation Engine
```

## Main Backend Modules

```text
backend/
│
├── auth/
├── courses/
├── materials/
├── concepts/
├── learning/
├── practice/
├── weaknesses/
├── recommendations/
└── ai/
```

## Example APIs

```text
POST   /auth/register
POST   /auth/login

POST   /courses
GET    /courses/{id}

POST   /materials/upload
POST   /materials/{id}/process

GET    /courses/{id}/map
GET    /concepts/{id}

POST   /concepts/{id}/practice
POST   /attempts

GET    /progress
GET    /weaknesses
GET    /recommendations/next
```

The exact API structure can be finalized during implementation.

---

# 4. Database

Use **PostgreSQL** as the primary application database.

It stores:

```text
Users
Courses
Materials
Concepts
Concept Relationships
Material-Concept mappings
Learning Progress
Questions
Attempts
Weaknesses
Recommendations
```

The database is the **source of truth for the student's state**.

Example:

```text
Circular Queue
      ↓
Learning Progress = NEEDS_ATTENTION
      ↓
Attempts = 3 recent incorrect
      ↓
Weakness = HIGH
```

---

# 5. AI / ML Layer

Do not build a complicated ML system for the MVP.

Use AI where language understanding is useful.

## AI Responsibilities

### 5.1 Material Understanding

```text
PDF / Notes
     ↓
LLM
     ↓
Concepts + Relationships + Prerequisites
```

### 5.2 Concept Explanation

```text
Concept + Relevant Material
          ↓
         LLM
          ↓
Simple explanation + example
```

### 5.3 Question Generation

```text
Concept
   ↓
LLM
   ↓
3–5 MCQs
```

### 5.4 Mistake Analysis

```text
Question
+
Student Answer
+
Correct Answer
       ↓
      LLM
       ↓
Possible misconception / weak concept
```

### 5.5 Recommendation Reasoning

```text
Progress
+
Weakness
+
Concept Relationships
       ↓
Recommendation Logic
       ↓
Next Learning Step
```

---

# 6. LLM

The LLM is mainly responsible for understanding and generating educational content.

Example:

```text
Input:

"Here is a section of notes about recursion..."

LLM
 ↓
Concept extraction
 ↓
Relationship extraction
 ↓
Explanation
 ↓
Question generation
 ↓
Mistake analysis
```

## Important Architecture Principle

Do not let the LLM control the entire application.

The backend and database should control deterministic information such as:

- User progress
- Attempt counts
- Correctness
- Concept relationships
- Status updates
- Recommendation rules

The LLM assists with:

- Understanding
- Explanation
- Generation
- Mistake interpretation

---

# 7. Embeddings

Embeddings can help LearnMap connect semantically similar content.

## Example: Relevant Material

```text
Material A:
"Binary search works on sorted arrays."

Material B:
"Binary search repeatedly divides the search space."

        ↓
    Embeddings
        ↓
Semantic similarity
```

This can help when the student opens a concept and LearnMap needs to find relevant sections of uploaded material.

```text
Student opens:
Binary Search

        ↓

Embedding search

        ↓

Relevant sections of uploaded material
```

## Similar Mistakes

Embeddings can also support similar-error detection.

```text
Mistake 1:
"Didn't understand when to move left pointer."

Mistake 2:
"Incorrectly updated the low/high boundary."

        ↓
    Embeddings
        ↓
Potentially related error patterns
```

For the MVP, embeddings should support the learning experience rather than become the main product.

---

# 8. Knowledge Graph

The Knowledge Graph represents how concepts are connected.

Example:

```text
Arrays
   │
   ├── PREREQUISITE → Binary Search
   │
   └── RELATED → Searching
                    │
                    ↓
                  Trees
                    │
                    ↓
                  Graphs
```

The graph helps answer:

- What concepts come before this one?
- What concepts depend on this concept?
- Which concept should I review before learning this?

## Graph Structure

```text
Concept
   │
   ├── PREREQUISITE
   └── RELATED
```

For the hackathon MVP, **PostgreSQL can store the relationships directly**.

A separate graph database such as FalkorDB is optional rather than mandatory.

This keeps the MVP simpler.

---

# 9. Recommendation Engine

This is where LearnMap's core product loop comes together.

The recommendation engine combines:

```text
Student Progress
       +
Recent Attempts
       +
Weaknesses
       +
Concept Relationships
       +
Prerequisites
       ↓
Recommendation Engine
       ↓
ONE Next Learning Step
```

## Example

Student state:

```text
Arrays          🟢
Linked Lists    🟢
Stacks          🟢
Queues          🟡
Circular Queue  🔴
Trees           ⚪
```

The engine checks:

```text
Circular Queue = weak
       ↓
Recent mistakes = 3
       ↓
Prerequisite relationship = Queue
       ↓
Recommendation:
Review Circular Queue
```

The system should also explain why.

> **Review Circular Queue next because you made 3 recent mistakes on this concept.**

---

# 10. Complete LearnMap Data Flow

This is the main technical flow of the application.

```text
                STUDENT
                   │
                   ▼
          Upload Syllabus/PDF
                   │
                   ▼
              FRONTEND
                   │
                   ▼
               FASTAPI
                   │
                   ▼
             AI PROCESSING
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   LLM Extraction        Embeddings
        │                     │
        └──────────┬──────────┘
                   ▼
              CONCEPTS
                   │
                   ▼
         KNOWLEDGE RELATIONSHIPS
                   │
                   ▼
             LEARNMAP
                   │
                   ▼
             STUDENT LEARNS
                   │
                   ▼
               PRACTICE
                   │
                   ▼
              ATTEMPTS
                   │
                   ▼
          WEAKNESS DETECTION
                   │
                   ▼
           PROGRESS UPDATED
                   │
                   ▼
            MAP CHANGES
                   │
                   ▼
       RECOMMENDATION ENGINE
                   │
                   ▼
          "LEARN THIS NEXT"
```

---

# 11. Core Architecture Loop

The entire product can be represented as:

```text
       KNOWLEDGE
          ↓
        LEARN
          ↓
       PRACTICE
          ↓
       MEASURE
          ↓
     FIND WEAKNESS
          ↓
      UPDATE MAP
          ↓
   RECOMMEND NEXT STEP
          ↓
        LEARN
          ↺
```

This loop is the technical representation of LearnMap's core USP.

---

# 12. Final Architecture Statement

> **LearnMap uses React for the learning interface, FastAPI as the application layer, PostgreSQL as the source of truth, LLMs and embeddings for educational understanding, a concept relationship graph for prerequisites, and a recommendation engine that combines student performance with the graph to determine the next learning step.**

---

# 13. MVP Architecture Decision

Do not build a complicated infrastructure stack just to make the architecture look impressive.

Avoid:

```text
PostgreSQL
+
FalkorDB
+
Separate Vector DB
+
Complex ML Model
+
Multiple AI Agents
```

unless the implementation actually requires them.

## Recommended MVP Stack

```text
React
   ↓
FastAPI
   ↓
PostgreSQL + pgvector
   ↓
LLM
   ↓
Recommendation Logic
   ↓
React Flow
```

This is enough to demonstrate the complete LearnMap loop:

> **Upload → Map → Learn → Practice → Weakness → Map Changes → Next Step**

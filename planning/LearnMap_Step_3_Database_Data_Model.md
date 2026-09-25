# LearnMap — Step 3: Database & Data Model

## Goal

Design a simple, hackathon-ready database for LearnMap without overengineering.

The core data flow is:

> **Users → Courses → Materials → Concepts → Relationships → Learning Progress → Questions → Attempts → Weaknesses → Recommendations**

---

## 1. Core Design Principle

LearnMap's database is divided into two layers:

### Static Knowledge Layer

Stores the structure of the subject:

- Courses / Syllabus
- Materials
- Concepts
- Concept Relationships
- Material–Concept mapping

### Dynamic Student Layer

Stores how the student is learning:

- Learning Progress
- Questions
- Attempts
- Weaknesses
- Recommendations

The AI layer works between these two layers.

---

# 2. Core Tables

## 2.1 Users

Stores student accounts.

### Fields

- `id`
- `name`
- `email`
- `password_hash`
- `created_at`

Keep this minimal for the MVP.

---

## 2.2 Courses

A user can have multiple subjects/courses.

### Fields

- `id`
- `user_id`
- `name`
- `description`
- `syllabus_text`
- `created_at`

For the MVP, the syllabus can remain part of the course instead of creating a separate syllabus table.

### Relationship

One user → many courses.

---

## 2.3 Materials

Stores study material belonging to a course.

Examples:

- PDF
- Notes
- Uploaded document
- Other supported study resources

### Fields

- `id`
- `course_id`
- `title`
- `type`
- `file_url`
- `extracted_text`
- `created_at`

### Relationship

One course → many materials.

---

## 2.4 Concepts

This is one of the most important tables in LearnMap.

A concept represents an actual learning concept rather than an entire chapter or PDF.

Examples:

- Arrays
- Linked Lists
- Stack
- Queue
- Circular Queue
- Binary Search
- Trees
- Graphs

### Fields

- `id`
- `course_id`
- `name`
- `description`
- `status`
- `created_at`

A single material can contain many concepts, and the same concept can appear in multiple materials.

---

## 2.5 Concept Relationships

This table creates the actual LearnMap.

It connects concepts to each other.

### Fields

- `id`
- `source_concept_id`
- `target_concept_id`
- `relationship_type`
- `confidence`
- `created_at`

### MVP Relationship Types

- `PREREQUISITE`
- `RELATED`

Avoid creating too many relationship types in the MVP.

### Example

```text
Arrays
   ↓
Linked Lists
   ↓
Stacks / Queues
   ↓
Trees
   ↓
Graphs
```

---

## 2.6 Material Concepts

A many-to-many mapping between materials and concepts.

### Fields

- `material_id`
- `concept_id`
- `relevance` (optional)

This lets LearnMap answer:

> "Where can I study this concept?"

For example:

```text
Binary Search
   ├── DSA Notes.pdf
   ├── Searching Algorithms.pdf
   └── Lecture 12 Notes
```

---

## 2.7 Learning Progress

Stores the student's current state for each concept.

### Fields

- `id`
- `user_id`
- `concept_id`
- `status`
- `score` (optional)
- `attempts_count`
- `last_practiced_at`
- `updated_at`

### MVP Statuses

- `NOT_STARTED`
- `LEARNING`
- `STRONG`
- `NEEDS_ATTENTION`

### Example

```text
Arrays          → STRONG
Linked Lists    → STRONG
Stacks          → LEARNING
Queues          → NEEDS_ATTENTION
Trees           → NOT_STARTED
```

---

## 2.8 Questions

Stores practice questions associated with concepts.

For the MVP, MCQs are enough.

### Fields

- `id`
- `concept_id`
- `question_text`
- `options`
- `correct_answer`
- `difficulty`
- `explanation`
- `generated_by_ai`

### Example

```text
Concept: Circular Queue

Question:
What happens when the rear reaches the end of the array
in a circular queue?

Options:
A. Queue becomes invalid
B. Rear wraps around
C. Queue is deleted
D. Front moves automatically
```

---

## 2.9 Attempts

This is critical to LearnMap's main USP because mistakes change the learning map.

### Fields

- `id`
- `user_id`
- `question_id`
- `selected_answer`
- `is_correct`
- `time_taken` (optional)
- `attempted_at`

Attempts allow the system to calculate:

- Concept accuracy
- Repeated mistakes
- Recent performance
- Number of attempts
- Weak concepts

---

## 2.10 Weaknesses

Stores detected learning weaknesses.

### Fields

- `id`
- `user_id`
- `concept_id`
- `severity`
- `reason`
- `evidence`
- `status`
- `detected_at`

### Example

```text
Concept: Circular Queue
Severity: HIGH
Reason: 3 incorrect recent attempts
Evidence: Repeated errors in queue wrapping and boundary conditions
Status: ACTIVE
```

The purpose of this table is to preserve recurring weaknesses rather than reconstruct them every time from raw attempts.

---

## 2.11 Recommendations

Stores the next learning action suggested to the student.

### Fields

- `id`
- `user_id`
- `concept_id`
- `type`
- `reason`
- `based_on`
- `status`
- `created_at`

### Example

```text
Concept: Recursion
Type: REVISE

Reason:
Repeatedly struggled with recursion questions.

Based on:
Recent attempts + prerequisite relationship with Trees.

Status:
PENDING
```

Possible statuses:

- `PENDING`
- `COMPLETED`
- `DISMISSED`

---

# 3. Main Database Relationships

```text
USER
 │
 └── COURSES
       │
       ├── MATERIALS
       │      │
       │      └── MATERIAL_CONCEPTS
       │                    │
       └──────────────→ CONCEPTS
                          │
                          ├── CONCEPT_RELATIONSHIPS
                          │
                          └── LEARNING_PROGRESS
                                   │
                                   ↓
                              QUESTIONS
                                   │
                                   ↓
                                ATTEMPTS
                                   │
                                   ↓
                              WEAKNESSES
                                   │
                                   ↓
                            RECOMMENDATIONS
```

---

# 4. How AI Interacts With the Database

## 4.1 Material Processing

Input:

```text
Syllabus + Material Text
```

AI processing:

```text
Extract Concepts
      ↓
Identify Relationships
      ↓
Identify Prerequisites
```

Output:

```text
Concepts + Concept Relationships
```

These are stored in the database.

---

## 4.2 Question Generation

Input:

```text
Concept + Relevant Material Context
```

AI output:

```text
Practice Questions
```

Questions are stored in the `questions` table.

---

## 4.3 Mistake Analysis

Input:

```text
Concept
+
Question
+
Student Answer
+
Expected Answer
+
Previous Attempts
```

Output:

```text
Possible Weak Concept / Mistake Pattern
```

The result can update:

- `learning_progress`
- `weaknesses`

---

## 4.4 Next-Step Recommendation

Input:

```text
Student Progress
+
Weak Concepts
+
Concept Relationships
+
Recent Attempts
```

Processing:

```text
Identify Weak Area
       ↓
Check Prerequisites
       ↓
Choose Next Learning Action
       ↓
Explain Why
```

Output:

```text
Recommendation
```

---

# 5. Example of the LearnMap USP

The database should make it possible for the map to change based on student performance.

## Before Practice

```text
Queues          🟢
Circular Queue  ⚪
Trees           ⚪
```

The student starts practicing Circular Queue.

---

## Student Makes 3 Mistakes

The system records:

```text
Attempts
   ↓
Question → Circular Queue
   ↓
Repeated Incorrect Answers
   ↓
Weakness Detected
   ↓
Learning Progress Updated
   ↓
Recommendation Created
```

The map can now show:

```text
Queues          🟢
Circular Queue  🔴
Trees           ⚪
```

And the student receives:

> **Review Circular Queue next.**

With an explanation such as:

> You made 3 recent mistakes related to Circular Queue.

This demonstrates the core LearnMap idea:

> **The map is not static. The student's mistakes change the map, and the changed map helps determine the next learning step.**

---

# 6. MVP Data Flow

```text
Upload Material
       ↓
Extract Text
       ↓
AI Identifies Concepts
       ↓
Build Concept Relationships
       ↓
Create LearnMap
       ↓
Student Learns
       ↓
Student Practices
       ↓
Attempts Stored
       ↓
Weakness Detected
       ↓
Learning Progress Updated
       ↓
Map Changes
       ↓
Recommendation Generated
       ↓
Student Gets One Clear Next Step
```

---

# 7. What NOT to Store in the MVP

Avoid unnecessary startup-scale complexity.

Do not add:

- Social profiles
- Friends / Followers
- Leaderboards
- Certificates
- Teacher marketplace
- Payments
- Subscriptions
- Organization management
- Complex notification systems
- Large analytics warehouses
- Complex gamification systems

The database should support the core hackathon demo.

---

# 8. Final Schema Concept

The conceptual schema is:

```text
Users
  ↓
Courses
  ↓
Materials ────────┐
                  ↓
               Concepts
                  ↓
        Concept Relationships
                  ↓
          Learning Progress
                  ↓
              Questions
                  ↓
               Attempts
                  ↓
              Weaknesses
                  ↓
            Recommendations
```

The key principle is:

> **Users own courses; courses contain materials and concepts; concepts are connected through relationships; students build progress through practice; attempts reveal weaknesses; weaknesses drive recommendations.**

---

# 9. Step 3 — Schema Lock

For the hackathon MVP, the core database consists of:

1. `users`
2. `courses`
3. `materials`
4. `concepts`
5. `concept_relationships`
6. `material_concepts`
7. `learning_progress`
8. `questions`
9. `attempts`
10. `weaknesses`
11. `recommendations`

This is enough to support the complete LearnMap loop:

> **Upload → Map → Learn → Practice → Discover Weakness → Map Changes → Get Next Step**

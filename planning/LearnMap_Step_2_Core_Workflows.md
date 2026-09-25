# LearnMap — Step 2: Core Workflows

## MVP Direction

LearnMap is a **hackathon MVP**, not a full EdTech startup. The focus is the core idea, the USP, and one strong "wow" feature.

The central object of LearnMap is:

> **The student's LearnMap**

Everything else exists to make that map smarter.

### Core loop

```text
Study Material
      ↓
  LearnMap
      ↓
Student learns
      ↓
   Practice
      ↓
Mistake / success
      ↓
Map updates student's state
      ↓
"Learn this next"
```

The key idea is that the system **learns about the learner while the learner is learning the subject**.

---

# 1. 📚 Study Material → Knowledge Map

### Goal

Turn a student's syllabus and study material into a **structured map of concepts**, rather than simply summarizing the documents.

### Workflow

```text
Upload syllabus / PDF / notes
             ↓
       AI extracts topics
             ↓
     Identify key concepts
             ↓
 Identify relationships between concepts
             ↓
 Identify likely prerequisites
             ↓
       Build LearnMap
```

### Example

A student uploads a **Data Structures syllabus + notes**.

LearnMap can create:

```text
              Arrays
                ↓
          Linked Lists
             ↙    ↘
        Stacks    Queues
                ↓
              Trees
                ↓
              Graphs
```

Each node represents a real concept.

Opening a concept can show:

- Short explanation
- Relevant source material
- Related concepts
- Prerequisites
- Practice

### MVP decision

We do not need a scientifically perfect knowledge graph.

For the hackathon:

> **AI creates a useful concept map that the student can understand and navigate.**

---

# 2. 🧠 Concept Learning Workflow

Once the map exists, the student chooses a concept.

### Example

The student clicks:

**Binary Search**

LearnMap displays:

```text
Binary Search

Prerequisite:
✓ Sorted Arrays

Related:
→ Divide & Conquer
→ Searching Algorithms

Your status:
⚪ Not Started
```

The student can then:

- Read an AI explanation
- View relevant source material
- Ask a question
- See an example
- Start practice

The learning experience stays simple. The map remains the center of the product.

---

# 3. 📝 Practice / Assessment Workflow

After learning a concept:

```text
Concept
   ↓
5 short questions
   ↓
Student answers
   ↓
Evaluate
   ↓
Update concept understanding
```

Example:

**Binary Search**

- Q1 ✓
- Q2 ✓
- Q3 ✗
- Q4 ✗
- Q5 ✗

LearnMap should not only show:

> Score: 40%

It should associate questions with concepts and use mistakes as signals about where the student may be struggling.

---

# 4. 🔍 Weak-Concept Detection

The MVP can use simple signals:

- Wrong answers
- Repeated mistakes
- Number of attempts
- Question difficulty
- Recent performance

Example:

```text
Binary Search

Attempt 1 → 40%
Attempt 2 → 50%
Attempt 3 → 45%
```

LearnMap marks:

> 🔴 **Needs Attention**

But the system should also look at the concepts around Binary Search.

For example:

```text
Sorted Arrays
      ↓
Binary Search
      ↓
Search Space
      ↓
Advanced Searching
```

The goal is to determine whether the student is struggling with the main concept or with a related prerequisite.

---

# 5. 🔗 Prerequisite / Dependency Workflow

Prerequisites quietly power the recommendation system.

Example:

```text
Arrays
  ↓
Recursion
  ↓
Trees
  ↓
Graphs
```

If the student struggles with **Trees**, LearnMap checks relevant prerequisites.

Example:

```text
Arrays       ✓
Recursion    🔴 Weak
Trees        🔴 Weak
```

LearnMap can recommend:

> **You may want to review Recursion first.**

Why?

> Recursion is a prerequisite for understanding several tree concepts in the current learning map.

The prerequisite graph therefore helps the system identify possible underlying gaps instead of simply telling the student to repeat the same topic.

---

# 6. 🎯 "What Should I Learn Next?"

This is the heart of LearnMap.

After every meaningful learning or practice session, LearnMap answers:

# **What should I do next?**

Instead of giving the student a long list of recommendations, the MVP should provide **one clear next action**.

Example:

```text
Arrays        🟢
Linked List   🟢
Stack         🟢
Queue         🟡
Trees         🔴
Graphs        ⚪
```

LearnMap recommends:

> ### 🎯 Learn Trees next

**Why?**

> Your performance shows that Trees is currently your biggest gap among the next connected concepts.

Or:

> ### 🔄 Review Recursion first

**Why?**

> You struggled with recursion questions, and Recursion is connected to the Tree concepts you are trying to learn next.

The recommendation should always have a clear reason.

---

# 7. 🔥 The Mind-Blowing Feature

## The LearnMap changes when you make mistakes.

This is the main "wow moment" we should build the demo around.

### Before practice

```text
              Arrays 🟢
                 ↓
           Linked Lists 🟢
              ↙      ↘
        Stacks 🟢    Queues 🟢
                    ↓
                  Trees ⚪
```

The student takes a quiz and makes repeated mistakes related to:

**Queue → Circular Queue**

LearnMap updates:

```text
              Arrays 🟢
                 ↓
           Linked Lists 🟢
              ↙      ↘
        Stacks 🟢    Queues 🟡
                       ↓
               Circular Queue 🔴
                       ↓
                   Trees ⚪
```

Then the system says:

> ### **Your next step: Review Circular Queue**
>
> You made 3 mistakes related to queue wrapping and boundary conditions.
>
> **Why this matters:** Circular Queue is part of the path toward the upcoming topics in your map.
>
> **[ Review Now ]**

The map is therefore not just showing the curriculum.

> **It shows the student's relationship with the curriculum.**

---

# 8. 🔄 Learning Map Update Workflow

The update process should be automatic:

```text
Student learns
      ↓
Student practices
      ↓
Performance collected
      ↓
Concept state updated
      ↓
Map visually changes
      ↓
Recommendation changes
```

Use simple concept states for the MVP:

### 🟢 Strong
Consistently performing well.

### 🟡 Learning
Some understanding, but inconsistent.

### 🔴 Needs Attention
Repeated difficulty.

### ⚪ Not Started
No meaningful evidence yet.

We do not need complicated mastery scores in the MVP. The visual state is easier for students and judges to understand.

---

# 9. 🤖 AI Decision Loop

All the workflows connect through one simple AI/logic loop.

```text
              STUDENT DATA
                   ↓
       ┌─────────────────────┐
       │                     │
       ↓                     ↓
Concept relationships    Practice results
       │                     │
       └──────────┬──────────┘
                  ↓
          AI / Logic Layer
                  ↓
        Identify learning gap
                  ↓
       Check prerequisites
                  ↓
       Select next best step
                  ↓
          Explain WHY
                  ↓
           Update LearnMap
```

The important point is that AI should not simply say:

> "Study Recursion."

It should say:

> **"Review Recursion because your recent mistakes suggest a gap there, and Recursion is connected to the concept you're trying to learn next."**

The recommendation is therefore explainable.

---

# 10. What AI Actually Does

Keep the AI architecture realistic for a hackathon.

## AI #1 — Material Understanding

**Input:** PDF / syllabus / notes

**Output:** Concepts + relationships + prerequisites

Example:

```text
PDF
 ↓
AI
 ↓
Arrays, Linked Lists, Stacks, Queues, Trees
```

## AI #2 — Explanation

**Input:** Concept + relevant material

**Output:** Simple explanation

## AI #3 — Question Generation

**Input:** Concept

**Output:** 3–5 practice questions

## AI #4 — Mistake Analysis

**Input:** Question + student's answer + expected answer

**Output:** Relevant concept / possible weak area

## AI #5 — Next-Step Recommendation

**Input:** Map + concept states + recent mistakes

**Output:** One next action + reason

We do not need five separate AI agents. These can be implemented as logical modules using the same AI service/model where appropriate.

---

# 11. What We Should NOT Build

To keep the MVP focused, avoid:

- Social learning
- Teacher marketplace
- Certificates
- Leaderboards
- AI voice tutor
- AI avatar
- Chatbot as the homepage
- Complex gamification
- Huge resource marketplace
- Full LMS
- Advanced predictive ML model
- Separate mobile app

These do not strengthen the central LearnMap demo enough.

---

# 12. Final LearnMap MVP Workflow

After reviewing all the workflows, they should work together as **one continuous workflow**, rather than feeling like eight unrelated features.

```text
              1. UPLOAD
        Syllabus + Study Material
                  ↓
              2. BUILD
            Concept Map
                  ↓
        Concepts + Relationships
                  ↓
              3. LEARN
         Open a concept
                  ↓
        AI Explanation + Sources
                  ↓
              4. PRACTICE
           3–5 Questions
                  ↓
              5. ANALYZE
        Correct / Incorrect
                  ↓
        Identify Weak Concept
                  ↓
       Check Related/Prerequisite
                  ↓
              6. UPDATE
        Student's LearnMap
                  ↓
          🔴 Weak concept
          🟡 Learning
          🟢 Strong
                  ↓
          7. RECOMMEND
         "Learn This Next"
                  ↓
             Explain WHY
                  ↓
              8. LEARN
                  ↓
                 ↺
```

### In one sentence:

> **Upload → Map → Learn → Practice → Discover Weakness → Map Changes → Get Next Step**

---

# LearnMap USP

The USP should not be:

> "AI-powered knowledge graph."

Instead:

## **LearnMap is a learning map that changes with you.**

> **It doesn't just show what concepts exist—it shows what you understand, where you're struggling, and what you should learn next.**

The strongest hackathon demo should make this visible in under a minute:

**Upload → Map appears → Take 3 questions → Make mistakes → Map changes → "Review this next" appears.**

---

# Important MVP Scope Decision

We should **not claim that the MVP is doing full "knowledge tracing."** Knowledge tracing is a larger research area with sophisticated models.

For the hackathon, we can honestly implement:

> **Concept-level progress tracking using practice performance + prerequisite relationships + explainable recommendations.**

The research validates this direction, but we don't need to pretend that we are building a state-of-the-art knowledge-tracing model.

---

# Final Step 2 Decision

### 🔒 Core idea

> **The map is not static. The student's mistakes change the map, and the changed map determines the next learning step.**

This should be the feature we build, demo, and pitch.

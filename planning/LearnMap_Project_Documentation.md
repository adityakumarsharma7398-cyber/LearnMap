# LearnMap — Project Documentation

## 1. Core Problem

Students today have access to a huge amount of study material such as **PDFs, notes, videos, websites, and online courses**. However, having more resources does not necessarily make learning easier.

The main problems are:

- Study material is **scattered across different sources**.
- Students often don't know **what to study first or what to study next**.
- The relationship between different concepts is not always clear.
- Students find it difficult to identify **which concepts they actually understand and where they are weak**.
- During revision, students often revise entire topics instead of focusing on their **actual learning gaps**.

### In simple words

> **Students have plenty of content, but they lack a clear map of their learning.**

---

## 2. Our Solution — LearnMap

**LearnMap** converts a student's syllabus and study material into a **visual map of connected concepts**.

Instead of treating every chapter or resource separately, LearnMap shows students how concepts are related and helps them navigate through the subject.

### How it works

**1. Add syllabus and study material**

The student provides their syllabus, PDFs, notes, or other learning resources.

**2. Build the LearnMap**

The system identifies important concepts and their relationships and creates a visual learning map.

**3. Learn through the map**

Students can open a concept to understand it, access relevant material, and practice it.

**4. Track understanding**

Through practice and learning activity, LearnMap identifies concepts where the student is struggling.

**5. Recommend the next step**

LearnMap uses this information to guide the student toward the concept they should **learn or revise next**.

### Core learning loop

> **Study → Practice → Identify Weakness → Improve → Learn Next**

---

## 3. How LearnMap is Beneficial

### Clear learning direction
Students don't have to constantly decide what to study next. LearnMap provides a structured path through the subject.

### Better conceptual understanding
The visual map helps students see **how concepts connect**, rather than studying every topic in isolation.

### Identifies learning gaps
Instead of simply showing whether an answer is right or wrong, LearnMap focuses on **which concept needs improvement**.

### More efficient revision
Students can focus their revision on weak concepts instead of repeatedly going through everything.

### Saves time
Students spend less time searching for resources and organizing what to study.

### Personalized learning
Two students studying the same subject may have different weaknesses. LearnMap can guide them toward different concepts based on their progress.

---

## 4. How LearnMap is Different from Existing Solutions

LearnMap is **not trying to replace existing AI tutors, search engines, or learning platforms**.

Many existing solutions are good at providing:

- Explanations
- Summaries
- Questions and quizzes
- Flashcards
- Study material
- AI tutoring

The difference is that LearnMap makes the **student's learning map the center of the experience**.

### Existing approach

> **Content → Student**

The platform provides content and the student decides what to do with it.

### LearnMap

> **Content → Concept Map → Student Progress → Learning Gap → Next Step**

LearnMap connects:

**Concept relationships + study material + student progress + weaknesses + next learning step**

The goal is not simply to give students **more content**, but to help them understand:

> **What do I need to learn? → How is it connected? → Where am I weak? → What should I learn next?**

### Important distinction

We should **not claim that visual concept maps or AI personalization are completely new**. Existing products already provide some of these capabilities. Our differentiation is in combining them into a **student-specific, evolving learning map that uses learning performance to guide the next step**.

---

## 5. How AI is Integrated

AI is an important part of LearnMap, but **AI is not the entire product**.

### 1. Understanding study material

AI processes uploaded PDFs, notes, and other learning resources to identify important concepts and topics.

**Example:**

> PDF → AI identifies → Arrays, Linked Lists, Stacks, Queues, Trees...

### 2. Finding concept relationships

AI helps identify relationships between concepts.

For example:

> Arrays → Linked Lists → Stacks → Queues

It can also identify prerequisite relationships, such as:

> Recursion → Trees → Backtracking

These relationships help build the LearnMap.

### 3. Generating explanations

When a student opens a concept, AI can provide an explanation based on the student's learning context and available material.

For example:

> **Concept: Recursion**  
> Simple explanation + example + related concepts.

### 4. Generating practice

AI can create questions based on the concepts the student is learning.

This allows LearnMap to check whether the student actually understands a concept.

### 5. Identifying weak concepts

The system analyzes the student's practice performance.

For example:

> Recursion: 85%  
> Arrays: 92%  
> Binary Search: 45%

LearnMap can identify **Binary Search as an area that needs attention**.

### 6. Recommending what to learn next

This is where AI becomes especially useful.

Instead of simply saying:

> "You got 5 questions wrong."

LearnMap can use the concept relationships and learning performance to suggest:

> **"Review Binary Search before moving to the next topic because you are struggling with this concept and it is connected to upcoming topics."**

The recommendation should be based on **student data + the concept map**, rather than letting an AI model arbitrarily decide everything.

---

## 6. Complete LearnMap Concept

```text
             SYLLABUS + MATERIAL
                     ↓
              AI UNDERSTANDS IT
                     ↓
              CONCEPT MAP
                     ↓
                   STUDY
                     ↓
                  PRACTICE
                     ↓
             FIND WEAK CONCEPTS
                     ↓
          UPDATE STUDENT'S MAP
                     ↓
          RECOMMEND NEXT STEP
                     ↓
                   LEARN
                     ↺
```

## One-line Explanation

> **LearnMap turns scattered study material into a living map of connected concepts and uses the student's learning progress to identify gaps and guide what they should learn next.**

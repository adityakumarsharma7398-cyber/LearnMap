# LearnMap — Step 5: Prototype / UI & UX

## Goal

Translate the LearnMap architecture into a clear, memorable student experience.

The prototype should communicate one core story:

> **A student uploads study material → LearnMap builds a living learning map → the student learns and practices → mistakes change the map → LearnMap tells the student what to do next.**

The UI should not feel like a generic AI chatbot or LMS.

> **The LearnMap itself should be the center of the product.**

---

# 1. Visual Design Direction

The visual direction is inspired by the provided reference image.

### Overall Style

**Playful + modern + clean educational SaaS**

Key characteristics:

- Soft pastel backgrounds
- White rounded containers
- Bold black typography
- Thick black borders
- Large rounded cards
- Bright accent colors
- Editorial / illustrative feel
- Plenty of whitespace
- Simple navigation
- Visual sections instead of dense dashboards

For LearnMap, combine this visual language with a modern AI/product dashboard.

---

# 2. Color Palette

## Main Background

**Soft Pink**

`#F9DDEB`

Use for landing page background and large hero sections.

## Primary Blue

`#3346C8`

Use for primary CTA buttons, active states, important actions, and links.

## Lavender / Purple

`#C9B8F5`

Use for concept cards, AI-related elements, and secondary highlights.

## Yellow

`#F8E54B`

Use for learning states, attention highlights, and important insights.

## Mint Green

`#7DD6BF`

Use for strong concepts, progress, and success states.

## Pink

`#E9A7C8`

Use for secondary cards and learning-related sections.

## White

`#FFFFFF`

Primary content/card background.

## Black

`#111111`

Use for headings, borders, and main text.

---

# 3. Border Style

One of the strongest characteristics of the reference is the bold outline.

Use:

`2px–3px solid #111111`

for important containers.

Avoid the generic SaaS style of subtle gray borders everywhere.

LearnMap should have a more distinctive visual identity.

---

# 4. Border Radius

Use large rounded corners.

- Cards: `16px–24px`
- Hero: `28px–32px`
- Buttons: `10px–14px`
- Upload area: `20px`

This keeps the interface friendly and educational rather than corporate.

---

# 5. Typography

Use a clean modern sans-serif.

Recommended:

- Inter
- Manrope
- Plus Jakarta Sans

### Hierarchy

```text
Hero
48–64px / Bold

Page Heading
32–40px / Bold

Section Heading
24–28px / Bold

Card Heading
18–20px / Bold

Body
14–16px

Small Information
12–14px
```

Headings should be bold and black.

---

# 6. Landing Page

The landing page should adapt the structure of the reference while making LearnMap's purpose clear.

## Header

```text
┌────────────────────────────────────────────────────────────┐
│ LearnMap       Home   How It Works   LearnMap   About      │
│                                                    Login   │
└────────────────────────────────────────────────────────────┘
```

Logo:

> **LearnMap**

Optionally add a small connected-node icon.

---

# 7. Hero Section

## Headline

> **See What You Know. Discover What to Learn Next.**

## Subheading

> Turn your syllabus and study materials into a living map of connected concepts that evolves with your learning.

## Primary CTA

**Build My LearnMap →**

## Hero Visual

Show a large visual LearnMap on the right.

```text
             Arrays 🟢
                 ↓
          Linked Lists 🟢
             ↙       ↘
       Stacks 🟢    Queues 🟡
                       ↓
                Circular Queue 🔴
                       ↓
                    Trees ⚪
```

The map itself becomes the hero illustration.

---

# 8. Feature Cards

Use the reference's colorful card language for LearnMap's core capabilities.

### 01 — Understand

> See how concepts connect.

### 02 — Practice

> Test what you actually understand.

### 03 — Detect

> Find the concepts where you're struggling.

### 04 — Improve

> Get one clear next step.

Use different pastel accent backgrounds for the four cards.

---

# 9. LearnMap Dashboard

This is the main product screen.

```text
┌─────────────────────────────────────────────────────────────┐
│ LearnMap                         Search 🔍       Profile ○   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Data Structures & Algorithms                               │
│  Your learning map                                          │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐      │
│  │ 7       │ │ 2       │ │ 1       │ │ 2            │      │
│  │ Strong  │ │Learning │ │Attention│ │Not Started   │      │
│  └─────────┘ └─────────┘ └─────────┘ └──────────────┘      │
│                                                             │
│                    LEARNMAP                                  │
│                                                             │
│                       Arrays 🟢                              │
│                           │                                  │
│                           ▼                                  │
│                    Linked Lists 🟢                           │
│                      ↙          ↘                            │
│                 Stacks 🟢     Queues 🟡                     │
│                                  │                           │
│                                  ▼                           │
│                         Circular Queue 🔴                    │
│                                  │                           │
│                                  ▼                           │
│                              Trees ⚪                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 10. LearnMap Controls

```text
[ All ] [ Strong ] [ Learning ] [ Needs Attention ]
```

Additional controls:

```text
Search concepts 🔍
Zoom +
Zoom -
Reset Map
```

Clicking a concept opens its Concept View.

---

# 11. Concept View

When a student clicks:

**Circular Queue 🔴**

show:

```text
Circular Queue

🔴 Needs Attention

Prerequisite
Queue

Related Concepts
Arrays

Your Accuracy
40%

Recent Attempts
5

Main Difficulty
Circular indexing
```

Actions:

```text
[ Learn ]

[ Practice ]

[ Study Material ]
```

---

# 12. Concept Learning View

Keep the learning screen simple.

```text
Circular Queue

What is it?

[AI-generated explanation]

How does it work?

[Simple explanation]

Example

[Visual / example]

Prerequisite:
Queue

Related:
Arrays
```

At the bottom:

> **Ready to test your understanding?**

**[ Start Practice ]**

---

# 13. Practice UI

For the MVP, use MCQs.

```text
┌──────────────────────────────────────┐
│ Circular Queue              2 / 5    │
│                                      │
│ What happens when the rear reaches   │
│ the end of the array?                │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ○ Queue becomes invalid          │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ○ Rear wraps around              │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ○ Front is deleted               │ │
│ └──────────────────────────────────┘ │
│                                      │
│              [ Submit ]              │
└──────────────────────────────────────┘
```

Use pastel answer cards instead of a conventional generic quiz interface.

---

# 14. Practice Result

After 3–5 questions:

```text
Practice Complete

       2 / 5

Circular Queue
Needs Attention
```

Show:

```text
Correct       2
Incorrect     3
Accuracy      40%
```

Do not stop at the score.

The next screen should show what the result means for the student's LearnMap.

---

# 15. Weakness Detection

## We found a learning gap

```text
Circular Queue 🔴

You struggled with:
• Circular indexing
• Queue boundary conditions
• Rear/front movement
```

Then:

> These mistakes suggest that Circular Queue needs another review before moving forward.

Action:

**[ Review Circular Queue ]**

---

# 16. The "Map Changed" Moment

This is the main demo moment.

## Before Practice

```text
Queues 🟡
   │
   ▼
Circular Queue ⚪
   │
   ▼
Trees ⚪
```

After several mistakes:

```text
Queues 🟡
   │
   ▼
Circular Queue 🔴
   │
   ▼
Trees ⚪
```

Then display:

```text
┌──────────────────────────────────────────────┐
│                                              │
│        Your LearnMap just changed.           │
│                                              │
│           Circular Queue 🔴                  │
│                                              │
│   You struggled with this concept during     │
│   your recent practice.                      │
│                                              │
│   3 incorrect attempts                       │
│   40% accuracy                                │
│                                              │
│       [ Review Circular Queue → ]            │
│                                              │
└──────────────────────────────────────────────┘
```

Use a pink/lavender card with a thick black border.

This should become the visual "wow" moment of the demo.

---

# 17. Next-Step Recommendation

The recommendation screen should not overwhelm the student with many tasks.

## Your Next Step

> **Review Circular Queue**

### Why?

```text
Recent mistakes
      +
Low accuracy
      +
Concept dependency
```

Example:

> You made 3 recent mistakes and this concept is connected to the next part of your learning path.

Actions:

**[ Review Now → ]**

**[ Practice Again ]**

---

# 18. Progress Page

Use colorful blocks rather than relying on charts everywhere.

```text
YOUR PROGRESS

┌─────────────┐
│  7          │
│  STRONG     │
│ 🟢          │
└─────────────┘

┌─────────────┐
│  2          │
│  LEARNING   │
│ 🟡          │
└─────────────┘

┌─────────────┐
│  1          │
│  ATTENTION  │
│ 🔴          │
└─────────────┘
```

Then show the concept journey underneath.

---

# 19. Navigation

Keep the main navigation simple.

```text
┌────────────────────────────────────────────┐
│ LearnMap     Dashboard  LearnMap  Progress │
│                              Profile       │
└────────────────────────────────────────────┘
```

Inside a course:

```text
Dashboard
LearnMap
Materials
Practice
Weaknesses
Progress
```

Do not create dozens of pages.

---

# 20. MVP Screens

## Must Build

1. Landing Page
2. Login / Basic Onboarding
3. Course Creation
4. Material Upload
5. LearnMap
6. Concept View
7. Practice
8. Practice Result
9. Weakness Detection
10. Next-Step Recommendation
11. Progress

## Can Be Simplified

- Authentication
- Profile
- Settings
- Material management

## Do Not Build

- Social feed
- Leaderboards
- Chatbot homepage
- AI avatar
- Voice tutor
- Teacher marketplace
- Certificates
- Complex gamification
- Mobile app

---

# 21. Core UX Principle

The UI should communicate:

> **The student is not navigating a library. They are navigating their own learning state.**

### Normal Study App

```text
Material → Read → Quiz → Score
```

### LearnMap

```text
Material
   ↓
Concept Map
   ↓
Learn
   ↓
Practice
   ↓
Mistakes
   ↓
Map Changes
   ↓
Weakness
   ↓
Next Step
```

That distinction should be visible throughout the prototype.

---

# 22. Complete Prototype Flow

```text
┌─────────────┐
│   Landing   │
└──────┬──────┘
       ↓
┌─────────────┐
│ Onboarding  │
└──────┬──────┘
       ↓
┌─────────────┐
│   Upload    │
│  Materials  │
└──────┬──────┘
       ↓
┌─────────────┐
│  LearnMap   │◄──────────────────┐
└──────┬──────┘                   │
       ↓                          │
┌─────────────┐                   │
│   Concept   │                   │
│    View     │                   │
└──────┬──────┘                   │
       ↓                          │
┌─────────────┐                   │
│  Practice   │                   │
└──────┬──────┘                   │
       ↓                          │
┌─────────────┐                   │
│  Weakness   │                   │
└──────┬──────┘                   │
       ↓                          │
┌─────────────┐                   │
│    Next     │                   │
│    Step     │                   │
└──────┬──────┘                   │
       ↓                          │
┌─────────────┐                   │
│  Progress   │───────────────────┘
└─────────────┘
```

---

# 23. Final LearnMap Design Language

> **Playful educational SaaS + bold editorial cards + AI dashboard + visual knowledge graph**

### Design Keywords

- Pastel
- Bold
- Rounded
- Illustrative
- Minimal
- Black outlines
- Large typography
- Color-coded learning states
- Lots of whitespace
- Interactive concept map

Most importantly:

> **The LearnMap should always remain the visual hero of the product.**

---

# 24. Color Usage Rule

Do not make every component colorful.

Maintain a balance:

```text
70% White / Neutral
20% Pastel Backgrounds
10% Strong Accent Colors
```

This keeps the interface modern and polished rather than visually noisy.

---

# 25. Final Prototype Principle

> **Don't design 20 impressive screens. Design one impressive learning loop.**

The hackathon demo should make the judges experience:

**Upload → Map Appears → Learn → Make Mistakes → Map Changes → LearnMap Tells You Exactly What To Do Next.**

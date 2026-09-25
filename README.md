# LearnMap 🧭 — AI-Powered Dynamic Concept Map & Learning Diagnostics

> **See What You Know. Discover What to Learn Next.**  
> Turn your syllabus and study materials into a living map of connected concepts that evolves with your learning performance.

---

## 🌟 The Core Idea & Hackathon USP

Existing tools either summarize long texts or offer isolated quizzes without conceptual context.  
**LearnMap is a learning map that changes with you:**

```text
Upload Syllabus / PDF → Visual Concept Graph → Learn Concept → Practice MCQs → Detect Weakness → Map Visually Changes (🔴) → Get ONE Explainable Next Step
```

### 🎯 The "Wow" Demo Moment:
1. Student opens **Data Structures & Algorithms**.
2. **Circular Queue** starts as `⚪ Not Started`.
3. Student practices Circular Queue questions and makes mistakes on modulo wrapping arithmetic.
4. The system detects the learning gap and updates the concept to **🔴 Needs Attention**.
5. The LearnMap node flashes and triggers: **"Your LearnMap just changed."**
6. LearnMap analyzes prerequisite paths and prescribes **ONE** clear next action:
   > *"Review Circular Queue next because you made 3 recent mistakes on queue wrapping, which is needed for upcoming tree & graph buffers."*

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Custom Neo-Editorial / Neo-Brutalist Design System)
- **Graph Visualization:** React Flow (`@xyflow/react`)
- **Icons:** Lucide React
- **Routing & Networking:** React Router DOM v6, Axios

### Backend
- **API Framework:** FastAPI (Python 3.10+)
- **Database ORM:** SQLAlchemy (Supports PostgreSQL & SQLite out-of-the-box)
- **Data Schemas:** Pydantic v2
- **Authentication:** JWT (PyJWT + Bcrypt)
- **Document Ingestion:** PyPDF for syllabus & notes text extraction
- **AI / Diagnostic Layer:** Clean modular service for concept extraction, relationship graph building, explanation generation, MCQ generation, and misconception diagnostics (with deterministic fallback mode).

---

## 📂 Project Structure

```text
LearnMap/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   └── models.py
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── courses.py
│   │   │   ├── materials.py
│   │   │   ├── concepts.py
│   │   │   ├── practice.py
│   │   │   ├── progress.py
│   │   │   ├── weaknesses.py
│   │   │   ├── recommendations.py
│   │   │   └── demo.py
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── pdf_service.py
│   │   │   ├── weakness_service.py
│   │   │   └── recommendation_service.py
│   │   └── utils/
│   │       └── auth.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ConceptNode.jsx
│   │   │   ├── ConceptModal.jsx
│   │   │   ├── MapChangedModal.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   └── CourseModal.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LearnMapPage.jsx
│   │   │   ├── PracticePage.jsx
│   │   │   └── ProgressPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── planning/
│   └── (Architecture, Schema, & UI/UX Design Specs)
├── README.md
└── .gitignore
```

---

## 🚀 Quickstart & Setup Guide

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
Backend API docs will be available at: **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend application will be live at: **http://localhost:5173**

---

## 🎬 Step-by-Step Demo Guide for Judges

1. **Launch App**: Open `http://localhost:5173`.
2. **Landing Page**: View the interactive hero graph and click **"Build My LearnMap"** or **"Try DSA Demo"**.
3. **Explore Live Graph**:
   - Navigate to the **LearnMap** tab.
   - Notice **Arrays**, **Linked Lists**, and **Stacks** are 🟢 *Strong*, **Queues** is 🟡 *Learning*, and **Circular Queue** is ⚪ *Not Started*.
4. **Trigger Practice**:
   - Click the **Circular Queue** node to open the concept modal.
   - Click **"Test Understanding (Practice)"**.
5. **Simulate Mistakes**:
   - Answer the MCQs incorrectly (or click the convenient **"⚡ Demo 3 Mistakes"** button).
   - Click **"Submit Practice"**.
6. **Experience the "Wow" Moment**:
   - The **"Your LearnMap just changed!"** modal instantly pops up.
   - Circular Queue is now **🔴 Needs Attention**.
   - An explainable diagnosis explains the exact misconception (modulo arithmetic & boundary conditions).
   - ONE clear recommendation: **"Review Circular Queue next"**.
7. **Verify Dashboard & Progress**:
   - Check the **Dashboard** and **Progress** tabs to see updated mastery gauges and weakness records.

---

## 🛡️ Environment Variables

### Backend (`backend/.env`):
```ini
DATABASE_URL=sqlite:///./learnmap.db
# Or PostgreSQL: postgresql://postgres:postgres@localhost:5432/learnmap
JWT_SECRET=supersecretjwtkeyforlearnmaphackathon2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
LLM_API_KEY=
LLM_PROVIDER=mock
PORT=8000
```

### Frontend (`frontend/.env`):
```ini
VITE_API_URL=http://localhost:8000
```

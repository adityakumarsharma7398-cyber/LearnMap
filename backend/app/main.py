import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import engine, Base, SessionLocal
from app.routers import auth, courses, materials, concepts, practice, progress, weaknesses, recommendations, demo
from app.routers.demo import reset_demo_seed

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize all database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed demo course if no courses exist
    db = SessionLocal()
    try:
        from app.models.models import Course
        count = db.query(Course).count()
        if count == 0:
            reset_demo_seed(db)
    except Exception as e:
        print(f"Auto-seed exception: {e}")
    finally:
        db.close()

    yield

app = FastAPI(
    title="LearnMap API",
    description="Backend service for LearnMap — AI-powered visual concept maps and adaptive learning recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(materials.router)
app.include_router(concepts.router)
app.include_router(practice.router)
app.include_router(progress.router)
app.include_router(weaknesses.router)
app.include_router(recommendations.router)
app.include_router(demo.router)

@app.get("/")
def root():
    return {
        "app": "LearnMap API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main.py:app", host="0.0.0.0", port=port, reload=True)

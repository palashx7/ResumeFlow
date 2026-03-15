import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import Base
from app.database import engine
from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.api.jobs import router as jobs_router
from app.api.candidates import router as candidates_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create upload directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="Resume Processing Pipeline",
    description="Distributed Resume Processing Pipeline with Job Queue System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Render frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(resumes_router)
app.include_router(jobs_router)
app.include_router(candidates_router)


@app.get("/")
def root():
    return {
        "message": "Resume Processing Pipeline API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}

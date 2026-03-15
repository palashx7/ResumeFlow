import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.api.deps import get_current_user
from app.config import settings
from celery_worker import celery_app

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload")
def upload_resumes(
    resumes: List[UploadFile] = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload multiple resumes and create processing jobs."""
    # Ensure upload directory exists
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)

    jobs_created = 0
    job_ids_to_dispatch = []

    for resume_file in resumes:
        # Validate PDF
        if not resume_file.filename.lower().endswith(".pdf"):
            continue  # Skip non-PDF files

        # Save file to disk
        file_id = str(uuid.uuid4())
        file_path = os.path.join(upload_dir, f"{file_id}.pdf")

        with open(file_path, "wb") as f:
            content = resume_file.file.read()
            f.write(content)

        # Create Resume record
        resume = Resume(
            user_id=current_user.id,
            file_path=file_path
        )
        db.add(resume)
        db.flush()  # Get the resume ID

        # Create Job record
        job = Job(
            resume_id=resume.id,
            user_id=current_user.id,
            job_description=job_description,
            status="pending"
        )
        db.add(job)
        db.flush()  # Get the job ID

        # Store job ID to dispatch after commit
        job_ids_to_dispatch.append(str(job.id))
        jobs_created += 1

    db.commit()

    # Dispatch Celery tasks AFTER creating them in the database
    for job_id in job_ids_to_dispatch:
        celery_app.send_task(
            "app.workers.resume_processor.process_resume",
            args=[job_id],
            countdown=2  # Delay execution to ensure DB commit is fully propagated
        )

    if jobs_created == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid PDF files were uploaded"
        )

    return {
        "message": "Upload successful",
        "jobs_created": jobs_created
    }

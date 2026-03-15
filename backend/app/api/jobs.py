from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.api.deps import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("")
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all jobs for the current user."""
    jobs = db.query(Job).filter(Job.user_id == current_user.id).order_by(Job.created_at.desc()).all()

    return [
        {
            "job_id": str(job.id),
            "resume_id": str(job.resume_id),
            "status": job.status,
            "job_description": job.job_description,
            "error_message": job.error_message,
            "retry_count": job.retry_count,
            "created_at": str(job.created_at),
            "completed_at": str(job.completed_at) if job.completed_at else None
        }
        for job in jobs
    ]


@router.get("/stats")
def get_job_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get job statistics for the current user."""
    total = db.query(Job).filter(Job.user_id == current_user.id).count()
    pending = db.query(Job).filter(Job.user_id == current_user.id, Job.status == "pending").count()
    processing = db.query(Job).filter(Job.user_id == current_user.id, Job.status == "processing").count()
    completed = db.query(Job).filter(Job.user_id == current_user.id, Job.status == "completed").count()
    failed = db.query(Job).filter(Job.user_id == current_user.id, Job.status == "failed").count()

    return {
        "total": total,
        "pending": pending,
        "processing": processing,
        "completed": completed,
        "failed": failed
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.job import Job
from app.api.deps import get_current_user

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/ranking")
def get_candidate_ranking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get candidates ranked by match score for the current user."""
    candidates = (
        db.query(Candidate)
        .join(Job, Candidate.job_id == Job.id)
        .filter(Job.user_id == current_user.id)
        .order_by(Candidate.match_score.desc())
        .all()
    )

    return [
        {
            "id": str(candidate.id),
            "name": candidate.candidate_name or "Unknown",
            "match_score": round(candidate.match_score, 4),
            "skills": candidate.skills or [],
            "resume_id": str(candidate.resume_id),
            "job_id": str(candidate.job_id),
            "processed_at": str(candidate.processed_at)
        }
        for candidate in candidates
    ]

import logging
from datetime import datetime
from celery import Task
from celery_worker import celery_app
from app.database import SessionLocal
from app.models.job import Job
from app.models.candidate import Candidate
from app.services.pdf_parser import extract_pdf_text
from app.services.text_cleaner import clean_text
from app.services.skill_extractor import extract_skills
from app.services.embedding_service import generate_embedding
from app.services.matching_service import compute_match_score

logger = logging.getLogger(__name__)

MAX_RETRIES = 3


def extract_candidate_name(text: str) -> str:
    """Heuristic: the candidate name is usually in the first line of the resume."""
    lines = text.strip().split("\n")
    for line in lines:
        line = line.strip()
        # Skip empty lines and lines that look like headers/titles
        if line and len(line) < 60 and not line.startswith("http"):
            return line
    return "Unknown"


@celery_app.task(
    bind=True,
    name="app.workers.resume_processor.process_resume",
    max_retries=MAX_RETRIES,
    default_retry_delay=10
)
def process_resume(self: Task, job_id: str):
    """
    Main resume processing pipeline.

    Steps:
    1. Load job from database
    2. Parse PDF to extract text
    3. Clean the extracted text
    4. Extract technical skills
    5. Generate embeddings for resume and job description
    6. Compute match score
    7. Save candidate results
    8. Update job status
    """
    db = SessionLocal()

    try:
        # Step 1: Load job
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            logger.error(f"Job {job_id} not found")
            return {"error": f"Job {job_id} not found"}

        # Update status to processing
        job.status = "processing"
        db.commit()

        logger.info(f"Processing job {job_id} - Resume: {job.resume.file_path}")

        # Step 2: Parse PDF
        try:
            raw_text = extract_pdf_text(job.resume.file_path)
        except Exception as pdf_exc:
            raise ValueError(f"Permanent Error: Could not read PDF - {str(pdf_exc)}")
            
        logger.info(f"Job {job_id}: Extracted {len(raw_text)} chars from PDF")

        # Step 3: Clean text
        cleaned_text = clean_text(raw_text)
        logger.info(f"Job {job_id}: Cleaned text to {len(cleaned_text)} chars")

        # Step 4: Extract skills
        skills = extract_skills(cleaned_text)
        logger.info(f"Job {job_id}: Found {len(skills)} skills: {skills}")

        # Step 5: Generate embeddings
        resume_embedding = generate_embedding(cleaned_text)
        job_embedding = generate_embedding(job.job_description)
        logger.info(f"Job {job_id}: Generated embeddings")

        # Step 6: Compute match score
        match_score = compute_match_score(resume_embedding, job_embedding)
        logger.info(f"Job {job_id}: Match score = {match_score:.4f}")

        # Step 7: Extract candidate name
        candidate_name = extract_candidate_name(raw_text)

        # Step 8: Save candidate results
        candidate = Candidate(
            resume_id=job.resume_id,
            job_id=job.id,
            candidate_name=candidate_name,
            skills=skills,
            match_score=match_score
        )
        db.add(candidate)

        # Step 9: Update job status to completed
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        db.commit()

        logger.info(f"Job {job_id}: Processing complete. Candidate: {candidate_name}, Score: {match_score:.4f}")

        return {
            "job_id": job_id,
            "candidate_name": candidate_name,
            "match_score": match_score,
            "skills": skills
        }

    except ValueError as exc:
        db.rollback()
        logger.error(f"Job {job_id}: Permanent Error - {str(exc)}")
        try:
            job = db.query(Job).filter(Job.id == job_id).first()
            if job:
                job.status = "failed"
                job.error_message = str(exc)
                job.completed_at = datetime.utcnow()
                db.commit()
        except:
            pass
        return {"error": str(exc), "status": "failed"}

    except Exception as exc:
        db.rollback()
        logger.error(f"Job {job_id}: Error - {str(exc)}")

        # Update retry count and status
        try:
            job = db.query(Job).filter(Job.id == job_id).first()
            if job:
                job.retry_count = (job.retry_count or 0) + 1
                job.error_message = str(exc)

                if job.retry_count >= MAX_RETRIES:
                    job.status = "failed"
                    job.completed_at = datetime.utcnow()
                    db.commit()
                    logger.error(f"Job {job_id}: Max retries exceeded. Marking as failed.")
                    return {"error": str(exc), "status": "failed"}
                else:
                    job.status = "pending"
                    db.commit()
                    # Retry with exponential backoff
                    raise self.retry(exc=exc, countdown=10 * (2 ** job.retry_count))
        except Exception as retry_exc:
            if isinstance(retry_exc, self.MaxRetriesExceededError):
                logger.error(f"Job {job_id}: Celery max retries exceeded")
            raise

    finally:
        db.close()

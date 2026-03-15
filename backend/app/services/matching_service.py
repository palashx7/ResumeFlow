import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def compute_match_score(resume_embedding: np.ndarray, job_embedding: np.ndarray) -> float:
    """Compute cosine similarity between resume and job description embeddings."""
    # Reshape to 2D arrays for sklearn
    resume_vec = resume_embedding.reshape(1, -1)
    job_vec = job_embedding.reshape(1, -1)

    similarity = cosine_similarity(resume_vec, job_vec)[0][0]

    # Clamp to [0, 1]
    return float(max(0.0, min(1.0, similarity)))

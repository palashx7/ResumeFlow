import numpy as np
from sentence_transformers import SentenceTransformer
from functools import lru_cache

# Lazy-loaded model instance
_model = None


def _get_model():
    """Lazy-load the sentence transformer model."""
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


@lru_cache(maxsize=100)
def generate_embedding(text: str) -> np.ndarray:
    """Generate embedding vector for the given text."""
    model = _get_model()
    embedding = model.encode(text, show_progress_bar=False)
    return embedding

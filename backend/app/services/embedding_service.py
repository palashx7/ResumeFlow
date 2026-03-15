import numpy as np
import gc
import torch
from sentence_transformers import SentenceTransformer
from functools import lru_cache

# Lazy-loaded model instance
_model = None


def _get_model():
    """Lazy-load the sentence transformer model with strict RAM limits."""
    global _model
    if _model is None:
        # Use a 3-layer MiniLM instead of 6-layer to save ~30MB of RAM
        _model = SentenceTransformer("paraphrase-MiniLM-L3-v2", device="cpu")
        
        # Disable dropout layers and evaluation mode
        _model.eval()
        
        # Prevent PyTorch from storing massive tensors for training
        torch.set_grad_enabled(False)
        
    return _model


@lru_cache(maxsize=10) # Reduced cache from 100 to 10 to save memory
def generate_embedding(text: str) -> np.ndarray:
    """Generate embedding vector for the given text."""
    model = _get_model()
    # Convert directly to numpy to drop the PyTorch tensor memory footprint
    embedding = model.encode(text, show_progress_bar=False, convert_to_numpy=True)
    
    # Aggressively force Python to garbage collect stray string allocations
    gc.collect()
    
    return embedding

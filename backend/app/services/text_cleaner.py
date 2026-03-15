import re


def clean_text(text: str) -> str:
    """Clean extracted text by removing extra spaces, special characters, and artifacts."""
    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', text)

    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)

    # Remove email addresses (preserve them separately if needed)
    text = re.sub(r'\S+@\S+\.\S+', '', text)

    # Remove multiple spaces
    text = re.sub(r'[ \t]+', ' ', text)

    # Remove multiple newlines
    text = re.sub(r'\n\s*\n', '\n', text)

    # Strip leading and trailing whitespace
    text = text.strip()

    return text

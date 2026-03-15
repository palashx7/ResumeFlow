import pdfplumber


def extract_pdf_text(file_path: str) -> str:
    """Extract raw text from a PDF file using pdfplumber."""
    text_parts = []

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

    full_text = "\n".join(text_parts)

    if not full_text.strip():
        raise ValueError("No text could be extracted from the PDF")

    return full_text

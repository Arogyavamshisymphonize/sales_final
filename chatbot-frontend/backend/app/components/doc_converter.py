import io
import re
from fastapi import UploadFile, HTTPException
from pypdf import PdfReader

async def process_document(file: UploadFile) -> str:
    """
    Accepts an uploaded file (PDF or Text), extracts content, 
    and returns a clean string ready for an LLM.
    """
    filename = file.filename.lower()
    
    # 1. Handle PDF Files
    if filename.endswith(".pdf") or file.content_type == "application/pdf":
        return await _extract_from_pdf(file)
    
    # 2. Handle Text/Markdown Files
    elif filename.endswith((".txt", ".md")):
        content = await file.read()
        return content.decode("utf-8")
    
    else:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {filename}. Only PDF, TXT, and MD are supported."
        )

async def _extract_from_pdf(file: UploadFile) -> str:
    try:
        # Read file into memory
        content = await file.read()
        stream = io.BytesIO(content)
        
        # Parse PDF
        reader = PdfReader(stream)
        text_content = []
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)
        
        full_text = "\n".join(text_content)
        
        # Check if PDF was image-based (empty text)
        if not full_text.strip():
             raise HTTPException(
                status_code=400, 
                detail="The PDF appears to be empty or contains only images (OCR required)."
            )
            
        return _clean_text_for_llm(full_text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

def _clean_text_for_llm(text: str) -> str:
    """
    Cleans raw text to reduce token usage and noise for the LLM.
    """
    # Replace multiple newlines with a single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    # Remove null bytes or non-printable characters if necessary
    text = text.replace('\x00', '')
    
    return text.strip()
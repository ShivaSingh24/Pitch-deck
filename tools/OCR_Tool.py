import fitz  # PyMuPDF
import cv2
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
from typing import Any, Dict, Type
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field
from starlette.staticfiles import StaticFiles



class OCRInput(BaseModel):
    """Input schema for the OCR Tool."""
    file_path: str = Field(..., description="Path to the PDF or image file.")

class OCRTool(BaseTool):
    """Tool for extracting text from PDFs and images."""

    name: str = "ocr_reader"
    description: str = (
        "Extracts raw text from a PDF or image file using OCR and direct text extraction methods."
    )
    args_schema: Type[BaseModel] = OCRInput

    def _run(self, file_path: str) -> Dict[str, Any]:
        """Extract text from the given PDF or image file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if file_path.endswith(".pdf"):
            extracted_text = self.extract_text_from_pdf(file_path)
        elif file_path.lower().endswith((".png", ".jpg", ".jpeg")):
            extracted_text = self.extract_text_from_image(file_path)
        else:
            raise ValueError("Unsupported file format. Please provide a PDF or image file.")
        
        return {"extracted_text": extracted_text.strip()}

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF using PyMuPDF; fallback to OCR if needed."""
        doc = fitz.open(pdf_path)
        text = "".join(page.get_text("text") for page in doc)
        return text if text.strip() else self.ocr_pdf(pdf_path)

    def ocr_pdf(self, pdf_path: str) -> str:
        """Fallback OCR extraction from a scanned PDF."""
        images = convert_from_path(pdf_path)
        return "\n".join(pytesseract.image_to_string(img) for img in images)

    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from an image using Tesseract OCR."""
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return pytesseract.image_to_string(Image.fromarray(gray))

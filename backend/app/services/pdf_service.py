import io
from pypdf import PdfReader

class PDFService:
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str = "") -> str:
        text = ""
        try:
            if filename.lower().endswith(".pdf") or file_bytes.startswith(b"%PDF"):
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
            else:
                text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"[PDFService] Error extracting text: {e}")
            return ""
        
        return text.strip()

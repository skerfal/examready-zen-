import os
import re

def extract_solution_blocks_from_pdf(pdf_path: str) -> dict:
    """
    Extracts text from a solution/correction PDF page-by-page.
    Splits it into raw answer blocks based on standard question/exercise indicators.
    Returns a dict with status, extracted answer blocks, and warnings.
    """
    if not os.path.exists(pdf_path):
        return {
            "status": "error",
            "blocks": [],
            "warnings": [f"Le fichier de correction '{pdf_path}' n'existe pas."]
        }

    pages = []
    # 1. Extract text page-by-page
    try:
        import fitz
        doc = fitz.open(pdf_path)
        for page_num, page in enumerate(doc, 1):
            pages.append((page_num, page.get_text() or ""))
    except Exception:
        try:
            import PyPDF2
            with open(pdf_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page_num, page in enumerate(reader.pages, 1):
                    pages.append((page_num, page.extract_text() or ""))
        except Exception:
            pass

    # 2. Text density check (if scanned/no selectable text)
    total_text = "".join(text for _, text in pages).strip()
    if len(total_text) < 100:
        return {
            "status": "scanned_solution_needs_ocr",
            "blocks": [],
            "warnings": ["Le document de correction semble être un scan (OCR non disponible ou insuffisant)."]
        }

    # 3. Parse answer blocks
    blocks = []
    
    # We want to match answer labels: Q1, Question 1, Correction 2, Exercice 3, 4) etc.
    # Pattern includes lookbehinds/lookaheads or boundary matches at start of line
    pattern = r"(?:Question|Q|Correction|Corr|Exercice|Ex|Réponse|R)\s*(\d+)[:\-\.\)]|(?:\n\s*|\A\s*)(\d+)[:\-\.\)]\s"
    
    block_counter = 1
    for page_num, page_text in pages:
        matches = list(re.finditer(pattern, page_text, re.IGNORECASE))
        if not matches:
            # Fallback: if no clear markers are found, but there is text, keep the page text as a single block
            # or split by paragraphs. Let's do a soft paragraph check.
            if page_text.strip():
                blocks.append({
                    "proposed_number": block_counter,
                    "text": re.sub(r"\s+", " ", page_text.strip()),
                    "source_page": page_num,
                    "label": f"Page {page_num}"
                })
                block_counter += 1
            continue

        for i, match in enumerate(matches):
            num_str = match.group(1) or match.group(2)
            try:
                detected_num = int(num_str)
            except ValueError:
                detected_num = block_counter

            start_idx = match.end()
            end_idx = matches[i+1].start() if i + 1 < len(matches) else len(page_text)
            block_text = page_text[start_idx:end_idx].strip()
            
            # Clean spaces
            block_text = re.sub(r"\s+", " ", block_text)
            if not block_text:
                continue

            # Limit text size for expected answer strings to prevent huge texts
            # expected_answer should ideally be a short string (e.g. 5/24 or 295 or a short sentence)
            # but we keep a snippet of it
            snippet = block_text
            if len(snippet) > 300:
                snippet = snippet[:300] + "..."

            blocks.append({
                "proposed_number": detected_num,
                "text": snippet,
                "source_page": page_num,
                "label": match.group(0).strip(" :.-)")
            })
            block_counter += 1

    return {
        "status": "solution_extracted",
        "blocks": blocks,
        "warnings": []
    }

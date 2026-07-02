import os
import json
import shutil
import pytest
from fastapi.testclient import TestClient
from app.health_api import app
from app.exam_registry import load_registry, save_registry

client = TestClient(app)

def test_ocr_run_endpoint_and_extraction_workflow(tmp_path):
    registry = load_registry()
    original_registry = dict(registry)
    
    exam_id = "test_ocr_api_exam"
    pdf_filename = "mock_ocr_scanned.pdf"
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    uploads_dir = os.path.join(base_dir, "data", "uploads", "exams")
    os.makedirs(uploads_dir, exist_ok=True)
    pdf_path = os.path.join(uploads_dir, pdf_filename)
    
    with open(pdf_path, "w") as f:
        f.write("%PDF-1.4 mock scanned PDF")
        
    registry[exam_id] = {
        "region": "TestRegion",
        "year": 2026,
        "subject": "math",
        "grade": "6AEP",
        "source_file": pdf_filename,
        "status": "scanned_pdf_needs_review",
        "needs_manual_verification": True,
        "imported_at": "2026-06-24T12:00:00Z"
    }
    save_registry(registry)
    
    try:
        # 1. Trigger POST /run-ocr
        resp = client.post(f"/exam-bank/{exam_id}/run-ocr", json={"pages": "all"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["exam_id"] == exam_id
        assert "ocr_status" in data
        assert "ocr_engine" in data
        
        # 2. Mock a saved OCR file on disk to test OCR fallback extraction
        ocr_dir = os.path.join(base_dir, "data", "ocr", exam_id)
        os.makedirs(ocr_dir, exist_ok=True)
        
        ocr_text = "Question 1: Calcule la somme de 1.25 et 2.50. Exercice 2: Convertis 12 decilitres."
        with open(os.path.join(ocr_dir, "page_001.txt"), "w", encoding="utf-8") as f:
            f.write(ocr_text)
            
        summary_mock = {
            "exam_id": exam_id,
            "ocr_status": "success",
            "pages_processed": [1],
            "ocr_engine": "tesseract",
            "warnings": [],
            "draft_text_by_page": {"1": ocr_text},
            "draft_questions_detected": 2
        }
        with open(os.path.join(ocr_dir, "ocr_summary.json"), "w", encoding="utf-8") as f:
            json.dump(summary_mock, f, indent=2, ensure_ascii=False)
            
        # 3. Call extract-questions API
        resp_ext = client.post(f"/exam-bank/{exam_id}/extract-questions")
        assert resp_ext.status_code == 200
        data_ext = resp_ext.json()
        
        assert data_ext["questions_detected"] == 2
        assert "extraction_quality_summary" in data_ext
        assert data_ext["extraction_quality_summary"]["suspected_scanned_pdf"] is True
        assert data_ext["extraction_quality_summary"]["extraction_confidence"] == "ocr_needs_review"
        
        draft_qs = data_ext["draft_questions"]
        assert len(draft_qs) == 2
        for q in draft_qs:
            assert q["status"] == "needs_review"
            assert q["needs_manual_verification"] is True
            assert q["extraction_confidence"] == "ocr_needs_review"
            assert "ocr_derived" in q["extraction_warnings"]
            
        # 4. Check GET /exam-bank/{exam_id} includes ocr_summary
        resp_detail = client.get(f"/exam-bank/{exam_id}")
        assert resp_detail.status_code == 200
        data_detail = resp_detail.json()
        assert "ocr_summary" in data_detail
        assert data_detail["ocr_summary"] is not None
        assert data_detail["ocr_summary"]["ocr_engine"] == "tesseract"
        
    finally:
        save_registry(original_registry)
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        shutil.rmtree(os.path.join(base_dir, "data", "ocr", exam_id), ignore_errors=True)

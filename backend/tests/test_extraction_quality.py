import os
import shutil
import pytest
from fastapi.testclient import TestClient
from app.health_api import app
from app.question_extractor import extract_questions_from_pdf
from app.pdf_preview import generate_pdf_previews

client = TestClient(app)

def test_question_extractor_quality_metrics(tmp_path):
    # 1. Scanned PDF mock (very low text density)
    import fitz
    scanned_pdf_path = os.path.join(tmp_path, "scanned_mock.pdf")
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "Short.") # 6 chars
    doc.save(scanned_pdf_path)
    doc.close()
    
    res = extract_questions_from_pdf(scanned_pdf_path, "test_scanned")
    assert res["status"] == "scanned_needs_ocr"
    assert res["extraction_quality_summary"]["suspected_scanned_pdf"] is True
    assert res["extraction_quality_summary"]["extraction_confidence"] == "scanned_needs_ocr"
    
    # 2. Selectable PDF with layout issues (no question blocks detected)
    layout_pdf_path = os.path.join(tmp_path, "layout_mock.pdf")
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "This is some standard prose text. No question starters are present in this text. It should trigger layout issue.")
    doc.save(layout_pdf_path)
    doc.close()
    
    res2 = extract_questions_from_pdf(layout_pdf_path, "test_layout")
    assert res2["status"] == "text_extracted"
    assert res2["extraction_quality_summary"]["suspected_layout_issue"] is True
    assert res2["extraction_quality_summary"]["extraction_confidence"] == "low"
    assert "suspected_layout_issue_no_questions" in res2["extraction_quality_summary"]["extraction_warnings"]

    # 3. High quality selectable PDF
    good_pdf_path = os.path.join(tmp_path, "good_mock.pdf")
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "Question 1: Calculez la somme de 12 et 15. Exercice 2: Convertis 5kg en grammes. Additional padding text to exceed the 100 character threshold easily.")
    doc.save(good_pdf_path)
    doc.close()
    
    res3 = extract_questions_from_pdf(good_pdf_path, "test_good")
    assert res3["status"] == "text_extracted"
    assert len(res3["questions"]) == 2
    
    # Assert enriched question fields
    q1 = res3["questions"][0]
    assert q1["source_page"] == 1
    assert "source_text_snippet" in q1
    assert q1["extraction_confidence"] in ["high", "medium", "low"]
    assert q1["needs_manual_verification"] is True

def test_api_preview_endpoints(tmp_path):
    from app.exam_registry import load_registry, save_registry
    registry = load_registry()
    
    exam_id = "api_test_exam"
    
    import fitz
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    uploads_dir = os.path.join(base_dir, "data", "uploads", "exams")
    os.makedirs(uploads_dir, exist_ok=True)
    pdf_filename = "api_test_exam.pdf"
    pdf_path = os.path.join(uploads_dir, pdf_filename)
    
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "Question 1: Pose et effectue 124 + 456.")
    doc.save(pdf_path)
    doc.close()
    
    original_registry = dict(registry)
    registry[exam_id] = {
        "region": "TestRegion",
        "year": 2026,
        "subject": "math",
        "grade": "6AEP",
        "source_file": pdf_filename,
        "status": "imported_draft",
        "needs_manual_verification": True,
        "imported_at": "2026-06-24T12:00:00Z"
    }
    save_registry(registry)
    
    try:
        # 1. Post to generate-previews
        resp_gen = client.post(f"/exam-bank/{exam_id}/generate-previews")
        assert resp_gen.status_code == 200
        data_gen = resp_gen.json()
        assert data_gen["success"] is True
        assert data_gen["pages_rendered"] == 1
        
        # 2. Get list of previews
        resp_list = client.get(f"/exam-bank/{exam_id}/previews")
        assert resp_list.status_code == 200
        data_list = resp_list.json()
        assert len(data_list) == 1
        assert data_list[0]["page_number"] == 1
        assert data_list[0]["url"] == f"/exam-bank/{exam_id}/previews/1"
        
        # 3. Get single preview image
        resp_img = client.get(f"/exam-bank/{exam_id}/previews/1")
        assert resp_img.status_code == 200
        assert resp_img.headers["content-type"] == "image/png"
        
        # 4. Get previews for non-existent exam
        resp_bad = client.get("/exam-bank/non_existent_exam/previews")
        assert resp_bad.status_code == 404
        
        # 5. Extract questions and check enriched response
        resp_ext = client.post(f"/exam-bank/{exam_id}/extract-questions")
        assert resp_ext.status_code == 200
        data_ext = resp_ext.json()
        assert "extraction_quality_summary" in data_ext
        assert "page_quality" in data_ext
        assert "needs_manual_verification_count" in data_ext
        
        # 6. GET /exam-bank/{exam_id} contains extraction_quality_summary
        resp_detail = client.get(f"/exam-bank/{exam_id}")
        assert resp_detail.status_code == 200
        data_detail = resp_detail.json()
        assert "extraction_quality_summary" in data_detail
        assert data_detail["extraction_quality_summary"] is not None
        
    finally:
        save_registry(original_registry)
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        preview_dir = os.path.join(base_dir, "data", "previews", exam_id)
        shutil.rmtree(preview_dir, ignore_errors=True)

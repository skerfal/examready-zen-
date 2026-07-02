import os
import shutil
import pytest
from app.pdf_preview import generate_pdf_previews, get_preview_file_path

def test_pdf_preview_generation(tmp_path):
    import fitz
    mock_pdf_path = os.path.join(tmp_path, "mock_test.pdf")
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((50, 50), "Question 1: Solve 2 + 2.")
    page2 = doc.new_page()
    page2.insert_text((50, 50), "Q2: Draw a square.")
    doc.save(mock_pdf_path)
    doc.close()
    
    exam_id = "test_exam_123"
    result = generate_pdf_previews(mock_pdf_path, exam_id)
    
    assert result["success"] is True
    assert result["pages_rendered"] == 2
    assert len(result["preview_paths"]) == 2
    assert len(result["warnings"]) == 0
    
    # Assert preview directory contains page PNG files
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    preview_dir = os.path.join(base_dir, "data", "previews", exam_id)
    assert os.path.exists(preview_dir)
    assert os.path.exists(os.path.join(preview_dir, "page_001.png"))
    assert os.path.exists(os.path.join(preview_dir, "page_002.png"))
    
    # Test getting file path
    path1 = get_preview_file_path(exam_id, 1)
    assert path1 is not None
    assert path1.endswith("page_001.png")
    
    # Clean up previews
    shutil.rmtree(preview_dir, ignore_errors=True)

def test_pdf_preview_safety():
    invalid_ids = ["../traversal", "exam/id", "exam_id;rm -rf", "exam$id"]
    for eid in invalid_ids:
        res = generate_pdf_previews("dummy.pdf", eid)
        assert res["success"] is False
        assert "ID d'examen invalide." in res["warnings"]
        
        path = get_preview_file_path(eid, 1)
        assert path is None
        
    assert get_preview_file_path("test_exam_123", -1) is None
    assert get_preview_file_path("test_exam_123", 0) is None

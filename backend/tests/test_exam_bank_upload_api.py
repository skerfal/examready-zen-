import io
import pytest
from fastapi.testclient import TestClient
from app.health_api import app
from app.exam_registry import load_registry, save_registry

client = TestClient(app)

@pytest.fixture
def clean_registry():
    # Save original registry, restore it after test
    registry = load_registry()
    original = registry.copy()
    yield
    save_registry(original)

def test_upload_reject_unsupported_extension():
    # Attempt to upload a text file
    file_data = {"file": ("test.txt", io.BytesIO(b"dummy text content"), "text/plain")}
    response = client.post("/exam-bank/upload", files=file_data)
    assert response.status_code == 400
    assert "Only .pdf and .zip files are allowed." in response.json()["detail"]

def test_upload_reject_empty_file():
    # Attempt to upload an empty pdf
    file_data = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    response = client.post("/exam-bank/upload", files=file_data)
    assert response.status_code == 400
    assert "Uploaded file is empty" in response.json()["detail"]

def test_upload_valid_mock_pdf_registers_as_draft(clean_registry):
    # Prepare a mock PDF structure
    # We name it math_anfa_2026.pdf so that it gets parsed as Region: Anfa, Year: 2026, Subject: math.
    pdf_content = b"%PDF-1.4 mock content with some dummy data for text parsing..." + b" " * 150
    file_data = {"file": ("math_anfa_2026.pdf", io.BytesIO(pdf_content), "application/pdf")}
    
    response = client.post("/exam-bank/upload", files=file_data)
    assert response.status_code == 200
    data = response.json()
    
    assert data["filename"].startswith("math_anfa_2026")
    assert "saved_path" in data
    
    # Check that status is imported_draft or scanned_pdf_needs_review
    registry = load_registry()
    exam_id = "math_anfa_2026"
    assert exam_id in registry
    rec = registry[exam_id]
    
    assert rec["status"] in ["imported_draft", "scanned_pdf_needs_review"]
    assert rec["needs_manual_verification"] is True
    
    # Confirm this draft is excluded from listed exams
    response_list = client.get("/historical-exams")
    assert response_list.status_code == 200
    exams = response_list.json()
    assert not any(e["exam_id"] == exam_id for e in exams)
    
    # Confirm draft is excluded from diagnostic selection
    response_session = client.post("/diagnostic/start", json={"student_alias": "test_alias", "source": f"historical_{exam_id}"})
    assert response_session.status_code == 200
    session_data = response_session.json()
    assert len(session_data["questions"]) == 5
    assert all(q["question_id"].startswith("Q-MATH") for q in session_data["questions"])

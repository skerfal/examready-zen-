import os
import sys
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.topic_map import list_topics
from app.revision_notes import list_revision_notes, get_revision_note
from app.health_api import app

client = TestClient(app)

def test_every_topic_has_revision_note():
    topics = [t["topic_id"] for t in list_topics()]
    notes = [n["topic_id"] for n in list_revision_notes()]
    
    # Assert 1-to-1 matching
    for t in topics:
        assert t in notes, f"Topic '{t}' is missing its corresponding revision note."

def test_revision_note_fields_exist():
    notes = list_revision_notes()
    for note in notes:
        # Check all core pedagogical fields
        assert "topic_id" in note
        assert "title_for_student" in note
        assert "very_easy_explanation" in note
        assert "all_rules_to_remember" in note
        assert "worked_examples" in note
        assert "common_traps" in note
        assert "mini_practice_questions" in note
        assert "answer_key" in note
        assert "remediation_hint" in note
        assert "visual_description" in note
        assert "when_to_upload_photo" in note

def test_revision_notes_api_endpoint():
    response = client.get("/revision-notes/decimal_subtraction")
    assert response.status_code == 200
    data = response.json()
    assert data["topic_id"] == "decimal_subtraction"
    assert "Soustraire" in data["title_for_student"]

def test_invalid_revision_notes_api_endpoint():
    response = client.get("/revision-notes/non_existent_note")
    assert response.status_code == 404

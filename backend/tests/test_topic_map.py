import os
import sys
from fastapi.testclient import TestClient

# Prepend project root to path for imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.topic_map import list_topics, get_topic, get_topics_requiring_photo_answer
from app.health_api import app

client = TestClient(app)

def test_topic_map_count():
    topics = list_topics()
    assert isinstance(topics, list)
    assert len(topics) >= 25  # Assert at least 25 topics
    assert len(topics) == 38  # Matches complete list of 38 topics

def test_topic_map_details():
    topic = get_topic("decimal_subtraction")
    assert topic is not None
    assert topic["domain"] == "numbers_calculation"
    assert "Soustraction décimale" in topic["display_name_fr"]
    assert topic["priority_for_diagnostic"] == "high"

def test_geometry_photo_markers():
    photo_topics = [t["topic_id"] for t in get_topics_requiring_photo_answer()]
    assert "angle_construction" in photo_topics
    assert "triangle_construction" in photo_topics
    assert "reflection_symmetry" in photo_topics
    assert "enlargement_scale" in photo_topics
    # Ensure addition does not require photo
    assert "decimal_addition" not in photo_topics

def test_topics_endpoint():
    response = client.get("/topics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 25
    
    # Specific topic detail endpoint
    response_detail = client.get("/topics/decimal_subtraction")
    assert response_detail.status_code == 200
    assert response_detail.json()["topic_id"] == "decimal_subtraction"

def test_invalid_topic_endpoint():
    response = client.get("/topics/non_existent_topic")
    assert response.status_code == 404

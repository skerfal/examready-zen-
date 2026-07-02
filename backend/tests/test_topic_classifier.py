import pytest
from app.topic_classifier import classify_question

def test_classify_decimal_operations():
    # Test decimal addition
    res = classify_question("Calcule la somme de 25.4 et 12.35")
    assert res["topic_id"] == "decimal_addition"
    assert res["confidence"] == "high"

    # Test decimal subtraction
    res = classify_question("Trouve la différence entre 45.8 et 3.4")
    assert res["topic_id"] == "decimal_subtraction"

    # Test decimal multiplication
    res = classify_question("Pose et effectue : 23.4 * 5.6")
    assert res["topic_id"] == "decimal_multiplication"

    # Test decimal division
    res = classify_question("Effectue la division suivante : 18.9 / 4.5")
    assert res["topic_id"] == "decimal_division"

def test_classify_fractions_and_powers():
    # Test fractions operations
    res = classify_question("Calcule et simplifie la fraction suivante : 3/4 + 1/2")
    assert res["topic_id"] == "fractions_operations"

    # Test powers
    res = classify_question("Écris sous forme de puissances 2 et 3 le nombre 36 * 125")
    assert res["topic_id"] == "powers"

def test_classify_geometry():
    # Test angle construction
    res = classify_question("Construis un angle de 110 degrés et sa bissectrice au compas")
    assert res["topic_id"] == "angle_construction"

    # Test reflection symmetry
    res = classify_question("Trace le symétrique de la figure par rapport à l'axe (L)")
    assert res["topic_id"] == "reflection_symmetry"

def test_classify_time_and_speed():
    # Test time duration
    res = classify_question("Calcule la durée du trajet sachant qu'il part à 3h 45min et arrive à 5h")
    assert res["topic_id"] == "time_duration"

    # Test average speed
    res = classify_question("Un train roule à une vitesse moyenne de 90 km/h")
    assert res["topic_id"] == "average_speed"

def test_classify_unknown_fallback():
    # Test text that doesn't match any math curriculum keywords
    res = classify_question("Quelle est la capitale du Maroc ?")
    assert res["topic_id"] == "needs_manual_classification"
    assert res["confidence"] == "low"
    assert "Incertitude" in res["reason"]

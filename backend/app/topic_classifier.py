import re
import unicodedata
from app.topic_map import load_topic_map

def normalize_text(text: str) -> str:
    if not text:
        return ""
    # Convert to lowercase
    text = text.lower()
    # Normalize accents/diacritics
    text = "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )
    # Replace multiple spaces with one
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# Keyword rules mapping topic_id -> list of keywords or regex patterns
# Sorted by priority if needed
KEYWORD_RULES = {
    "parentheses_priority": [
        r"\bparentheses?\b", r"\bpriorites?\b", r"\bcombines?\b",
        # Pattern matching parentheses with numbers and math operations
        r"\(\s*\d+[^)]*[\+\-\*\/]"
    ],
    "fractions_operations": [
        r"\bfractions?\b", r"\bdenominateurs?\b", r"\bnumerateurs?\b",
        r"\bsimplifie\b", r"\d+/\d+"
    ],
    "powers": [
        r"\bpuissances?\b", r"\bcarres?\b", r"\bcubes?\b", r"\bexposants?\b",
        r"\b\d+²\b", r"\b\d+³\b", r"\b²\b", r"\b³\b", r"\b6²\b"
    ],
    "ordering_numbers": [
        r"\bordre\b", r"\bcroissant\b", r"\bdecroissant\b", r"\brange\b",
        r"\bsymbole\b", r"\btrier\b", r"\bcompares\b"
    ],
    "time_duration": [
        r"\bheures?\b", r"\bminutes?\b", r"\bsecondes?\b", r"\bdurees?\b",
        r"\bsexagesim\b", r"\b\d+h\b", r"\b\d+min\b", r"\b\d+s\b"
    ],
    "average_speed": [
        r"\bvitesse\b", r"\bvitesse moyenne\b", r"\bkm/h\b", r"\btrajet\b"
    ],
    "length_conversion": [
        r"\b\d+(?:\.\d+)?\s*(?:m|km|hm|dam|dm|cm|mm)\b",
        r"\bmetres?\b", r"\bkilometres?\b",
        r"\bconvertis\b.*\b(longueur|distance|metres)\b"
    ],
    "mass_conversion": [
        r"\b\d+(?:\.\d+)?\s*(?:g|kg|t|q|hg|dag|dg|cg|mg)\b",
        r"\bmasse\b", r"\bpoids\b", r"\btonnes?\b", r"\bquintaux\b", r"\bquintal\b",
        r"\bkilogrammes?\b", r"\bgrammes?\b"
    ],
    "area_conversion": [
        r"\b\d+(?:\.\d+)?\s*(?:m²|km²|hm²|dam²|dm²|cm²|mm²|ha|a|ca)\b",
        r"\bsurface\b", r"\baire\b.*convertis", r"\bhectares?\b", r"\bares?\b", r"\bcentiares?\b"
    ],
    "volume_capacity_conversion": [
        r"\b\d+(?:\.\d+)?\s*(?:m³|dm³|cm³|mm³|l|dl|cl|ml)\b",
        r"\bvolume\b.*convertis", r"\blitres?\b", r"\bmetres\s+cubes\b"
    ],
    "circle_perimeter": [
        r"\bcirconference\b", r"\bcercle\b", r"\bdiametre\b", r"\brayon\b",
        r"\bpiste circulaire\b", r"\bpi\b"
    ],
    "volume_rectangular_prism": [
        r"\bpave droit\b", r"\breservoir\b", r"\bpiscine\b", r"\bcylindre\b",
        r"\bprisme\b", r"\bvolume\b"
    ],
    "angle_construction": [
        r"\bbissectrice\b", r"\bcompas\b", r"\brapporteur\b",
        r"\bangle\b.*\bdegr\b", r"\bconstruis.*angle\b", r"\btrace.*angle\b"
    ],
    "angle_measurement": [
        r"\bmesure.*angle\b", r"\bmesurer.*angle\b"
    ],
    "perpendicular_parallel_lines": [
        r"\bparalleles?\b", r"\bperpendiculaires?\b", r"\bequerres?\b"
    ],
    "triangle_construction": [
        r"\btriangle rectangle\b", r"\bconstruis.*triangle\b", r"\btriangle abc\b"
    ],
    "rectangle_square_properties": [
        r"\bproprietes?\b", r"\bquadrilateres?\b", r"\bparallelogrammes?\b", r"\blosanges?\b"
    ],
    "symmetry_axis": [
        r"\baxe de symetrie\b"
    ],
    "reflection_symmetry": [
        r"\bsymetriques?\b", r"\baxe \(l\)\b", r"\bquadrillages?\b", r"\bmiroirs?\b"
    ],
    "enlargement_scale": [
        r"\bagrandissements?\b", r"\breductions?\b", r"\bfacteurs?\b", r"\bgrilles?\b",
        r"\bdoublant.*dimensions?\b"
    ],
    "grid_drawing": [
        r"\btrace.*quadrillage\b", r"\breseaux?\b"
    ],
    "geometric_reasoning": [
        r"\bcalculer l'angle\b", r"\bsomme des angles\b"
    ],
    "proportional_reasoning": [
        r"\bpourcentage\b", r"\bechelle\b", r"\bregle de trois\b",
        r"\bproportionnalite\b", r"\binteret\b", r"\bcapital\b"
    ],
    "multi_step_word_problem": [
        r"\bprobleme financier\b", r"\bachat\b", r"\bprix\b", r"\bbenefice\b",
        r"\bremise\b"
    ],
    "circle_area": [
        r"\baire.*cercle\b", r"\bsurface.*cercle\b"
    ],
    "area_composite_shape": [
        r"\bfigure composee\b", r"\baire composee\b", r"\bsurface composee\b"
    ],
    "area_rectangle": [
        r"\baire\b", r"\bsurface\b", r"\brectangle\b", r"\bcarre\b"
    ],
    "perimeter": [
        r"\bperimetre\b", r"\bpolygone\b"
    ],
    "bar_chart_reading": [
        r"\bdiagramme\b", r"\bgraphique\b", r"\bpopulaire\b"
    ],
    "data_interpretation": [
        r"\btableau\b", r"\bdonnee\b"
    ],
    "decimal_division": [
        r"\bdivision\b", r"\bdivise\b", r"\bquotient\b", r"/"
    ],
    "decimal_multiplication": [
        r"\bmultiplication\b", r"\bproduit\b", r"\bmultiplie\b", r"\*", r"×"
    ],
    "decimal_subtraction": [
        r"\bsoustraction\b", r"\bsoustrais\b", r"\bdifference\b"
    ],
    "decimal_addition": [
        r"\baddition\b", r"\badditionne\b", r"\bsomme\b"
    ],
    "whole_number_operations": [
        r"\bentier\b"
    ]
}

def classify_question(question_text: str) -> dict:
    normalized = normalize_text(question_text)
    
    # Load topic map to get student friendly titles
    topics = load_topic_map()
    topic_dict = {t["topic_id"]: t for t in topics}
    
    matched_topic_id = None
    matched_reason = "Aucun mot-clé identifié"
    matched_confidence = "low"
    
    # Iterate rules in order to find matches
    for topic_id, patterns in KEYWORD_RULES.items():
        if topic_id not in topic_dict:
            continue
            
        for pattern in patterns:
            # Compile regex to support both boundary checks and raw patterns
            try:
                rx = re.compile(pattern, re.IGNORECASE)
                if rx.search(normalized):
                    matched_topic_id = topic_id
                    matched_reason = f"Correspondance détectée avec le mot-clé/motif : '{pattern}'"
                    matched_confidence = "high"
                    break
            except Exception:
                # Fallback to simple substring check if regex error
                if pattern in normalized:
                    matched_topic_id = topic_id
                    matched_reason = f"Correspondance directe détectée avec : '{pattern}'"
                    matched_confidence = "medium"
                    break
        if matched_topic_id:
            break
            
    if not matched_topic_id:
        return {
            "topic_id": "needs_manual_classification",
            "topic_title": "À classer manuellement",
            "confidence": "low",
            "reason": "Incertitude : aucun mot-clé déterministe du programme 6AEP n'a été repéré."
        }
        
    topic_info = topic_dict[matched_topic_id]
    topic_title = topic_info.get("student_friendly_title") or topic_info.get("display_name_fr") or matched_topic_id
    
    return {
        "topic_id": matched_topic_id,
        "topic_title": topic_title,
        "confidence": matched_confidence,
        "reason": matched_reason
    }

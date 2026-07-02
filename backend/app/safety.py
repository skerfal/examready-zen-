import re

def detect_prompt_injection(text: str) -> bool:
    injection_keywords = [
        "ignore previous instructions",
        "bypass rules",
        "reveal answers",
        "give me the solution directly",
        "override system"
    ]
    if not text:
        return False
    normalized = text.lower()
    for kw in injection_keywords:
        if kw in normalized:
            return True
    return False

def redact_pii(text: str) -> str:
    if not text:
        return ""
    # Email pattern
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    # Phone pattern (simple 10 digit or international format)
    phone_pattern = r"\b\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b"
    
    redacted = re.sub(email_pattern, "[REDACTED_EMAIL]", text)
    redacted = re.sub(phone_pattern, "[REDACTED_PHONE]", redacted)
    return redacted

def safety_screen(payload: dict) -> dict:
    has_injection = False
    screened_payload = {}
    
    for k, v in payload.items():
        if isinstance(v, str):
            if detect_prompt_injection(v):
                has_injection = True
            screened_payload[k] = redact_pii(v)
        else:
            screened_payload[k] = v
            
    if has_injection:
        return {
            "safe": False,
            "status": "blocked_security_risk",
            "message": "Prompt injection detected.",
            "payload": screened_payload
        }
        
    return {
        "safe": True,
        "status": "passed",
        "message": "Payload passed safety screen.",
        "payload": screened_payload
    }

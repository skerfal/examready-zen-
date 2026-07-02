test:
	python -m pytest tests/

serve:
	python -m uvicorn app.health_api:app --host 127.0.0.1 --port 8030 --reload

readiness:
	python -c "from app.readiness_checks import run_all_readiness_checks; import json; print(json.dumps(run_all_readiness_checks(), indent=2, ensure_ascii=False))"

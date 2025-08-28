#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"

if [[ "$MODE" == "dev" ]]; then
	python3 app.py
elif [[ "$MODE" == "gunicorn" ]]; then
	exec gunicorn -b 0.0.0.0:8000 app:app
elif [[ "$MODE" == "docker" ]]; then
	docker build -t portfolio:latest .
	docker run --rm -p 8000:8000 portfolio:latest
else
	echo "Usage: ./run.sh [dev|gunicorn|docker]" >&2
	exit 1
fi


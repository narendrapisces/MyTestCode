import json
from pathlib import Path
from typing import List, Dict, Any

from flask import Flask, render_template


BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"


def load_projects() -> List[Dict[str, Any]]:
	projects_file = DATA_DIR / "projects.json"
	if not projects_file.exists():
		return []
	with projects_file.open("r", encoding="utf-8") as f:
		return json.load(f)


def create_app() -> Flask:
	app = Flask(
		__name__,
		template_folder=str(BASE_DIR / "templates"),
		static_folder=str(BASE_DIR / "static"),
	)

	@app.route("/")
	def index():
		projects = load_projects()
		return render_template("index.html", projects=projects)

	return app


app = create_app()


if __name__ == "__main__":
	# Bind to all interfaces so the preview can reach it; use a stable port
	app.run(host="0.0.0.0", port=8000, debug=True)


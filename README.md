# Personal Projects Site (Flask)

A minimal personal website to showcase projects, built with Flask and Jinja templates.

## Quickstart

```bash
# From /workspace
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

Visit http://127.0.0.1:8000

## Structure

- `app.py`: Flask app and routes
- `templates/`: Jinja templates
- `static/css/styles.css`: Site styles
- `data/projects.json`: Projects data

## Editing projects

Update `data/projects.json`. Each project supports the following fields:

```json
{
  "title": "Project Title",
  "slug": "project-title",
  "description": "One or two sentences.",
  "year": 2025,
  "tags": ["python", "flask"],
  "links": [{ "label": "Website", "url": "https://example.com" }]
}
```

Restart the server after changes if needed.

## License

MIT

## Alternative run methods

Docker (no local Python needed):

```bash
docker build -t portfolio:latest .
docker run --rm -p 8000:8000 portfolio:latest
```

Or use the helper script:

```bash
./run.sh dev        # Flask dev server
./run.sh gunicorn   # Production server
./run.sh docker     # Build and run with Docker
```

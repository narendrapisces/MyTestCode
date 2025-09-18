# Image Upload Website (Flask)

Simple image uploader with gallery, built using Python and Flask.

## Features
- Upload images (png, jpg, jpeg, gif, webp), max 16 MB
- Auto-renamed with UUID to avoid collisions
- Thumbnail grid gallery and full-size view on click

## Quickstart

```bash
# Python 3.10+
cd /workspace
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run
python app.py
# or
export FLASK_APP=app:app
flask run --host=0.0.0.0 --port=8000
```

Visit http://localhost:8000

## Config
- FLASK_SECRET_KEY: Secret key for session/CSRF. Defaults to a dev value.
- MAX_CONTENT_LENGTH is set to 16MB in code. Adjust MAX_CONTENT_LENGTH_BYTES in app.py.

## Project structure
```
app.py
requirements.txt
static/
  styles.css
templates/
  index.html
uploads/
```

## Notes
- Uploaded files are saved to uploads/. This directory is git-ignored.
- For production, place behind a reverse proxy, enforce HTTPS, and scan/transform images as needed.


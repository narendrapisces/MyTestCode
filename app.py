import os
import uuid
from typing import List

from flask import Flask, render_template, request, redirect, url_for, send_from_directory, abort
from werkzeug.utils import secure_filename


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_CONTENT_LENGTH_BYTES = 16 * 1024 * 1024  # 16 MB


def create_app() -> Flask:
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )

    project_root = os.path.dirname(os.path.abspath(__file__))
    upload_folder = os.path.join(project_root, "uploads")

    # Basic configuration
    app.config["UPLOAD_FOLDER"] = upload_folder
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH_BYTES
    app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")

    # Ensure uploads directory exists
    os.makedirs(upload_folder, exist_ok=True)

    def is_allowed_file(filename: str) -> bool:
        if "." not in filename:
            return False
        extension = filename.rsplit(".", 1)[1].lower()
        return extension in ALLOWED_EXTENSIONS

    def list_uploaded_images() -> List[str]:
        try:
            all_files = os.listdir(upload_folder)
        except FileNotFoundError:
            return []
        images = [
            f for f in all_files
            if os.path.isfile(os.path.join(upload_folder, f))
            and f.rsplit(".", 1)[-1].lower() in ALLOWED_EXTENSIONS
        ]
        images.sort()
        return images

    @app.get("/")
    def index():
        images = list_uploaded_images()
        return render_template("index.html", images=images)

    @app.post("/upload")
    def upload():
        if "image" not in request.files:
            abort(400, description="No file part named 'image'.")
        file = request.files["image"]
        if file.filename == "":
            abort(400, description="No selected file.")

        original_filename = secure_filename(file.filename)
        if not is_allowed_file(original_filename):
            abort(400, description="Unsupported file type.")

        extension = original_filename.rsplit(".", 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{extension}"
        destination_path = os.path.join(upload_folder, unique_name)
        file.save(destination_path)

        return redirect(url_for("index"))

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename: str):
        return send_from_directory(upload_folder, filename)

    @app.errorhandler(413)
    def handle_too_large(error):
        return (
            render_template(
                "index.html",
                images=list_uploaded_images(),
                error_message="File too large. Max 16MB.",
            ),
            413,
        )

    @app.errorhandler(400)
    def handle_bad_request(error):
        return (
            render_template(
                "index.html",
                images=list_uploaded_images(),
                error_message=str(error.description) if hasattr(error, "description") else "Bad request.",
            ),
            400,
        )

    return app


app = create_app()


if __name__ == "__main__":
    # Bind to all interfaces so it's reachable in remote/dev containers
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=True)


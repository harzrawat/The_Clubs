import uuid
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from app.decorators import role_required
from app.extensions import db
from app.models import Event, GalleryImage, utcnow
from app.serializers import gallery_to_dict

bp = Blueprint("gallery", __name__, url_prefix="/api/gallery")


def _upload_dir() -> Path:
    p = Path(current_app.instance_path) / "uploads"
    p.mkdir(parents=True, exist_ok=True)
    return p


@bp.route("", methods=["GET"])
def list_gallery():
    rows = GalleryImage.query.order_by(GalleryImage.uploaded_at.desc()).all()
    return jsonify([gallery_to_dict(g) for g in rows]), 200


@bp.route("/upload", methods=["POST"])
@jwt_required()
@role_required("admin", "club_head")
def upload():
    event_id = request.form.get("eventId") or request.form.get("event_id")
    file = request.files.get("file") or request.files.get("image")
    if not event_id or not file or not file.filename:
        return jsonify({"message": "eventId and file required"}), 400

    ev = db.session.get(Event, event_id)
    if not ev:
        return jsonify({"message": "Event not found"}), 404

    ext = Path(secure_filename(file.filename)).suffix.lower() or ".bin"
    if ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bin"}:
        ext = ".jpg"

    name = f"{uuid.uuid4().hex}{ext}"
    path = _upload_dir() / name
    file.save(path)

    gid = f"img-{uuid.uuid4().hex[:12]}"
    url = f"/api/uploads/{name}"
    g = GalleryImage(
        id=gid,
        event_id=event_id,
        url=url,
        uploaded_at=utcnow().isoformat(),
    )
    db.session.add(g)
    db.session.commit()
    return jsonify(gallery_to_dict(g)), 201


def register_upload_route(app):
    upload_root = Path(app.instance_path) / "uploads"
    upload_root.mkdir(parents=True, exist_ok=True)

    @app.route("/api/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(upload_root, filename)

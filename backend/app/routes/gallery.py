import uuid
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, send_from_directory
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request
from werkzeug.utils import secure_filename

from app.decorators import role_required
from app.extensions import db
from app.models import Club, ClubMember, Event, GalleryImage, User, utcnow
from app.serializers import gallery_to_dict

bp = Blueprint("gallery", __name__, url_prefix="/api/gallery")


def _upload_dir() -> Path:
    p = Path(current_app.instance_path) / "uploads"
    p.mkdir(parents=True, exist_ok=True)
    return p


@bp.route("", methods=["GET"])
def list_gallery():
    """
    Role-based gallery listing:
      - admin      → all images
      - club_head  → only images from their club's events
      - student    → only images from clubs they are enrolled in
      - guest      → empty list
    """
    uid = None
    role = None
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
    except Exception:
        pass

    if uid:
        user = db.session.get(User, uid)
        role = user.role if user else None

    if not uid or not role:
        # Guest: return empty
        return jsonify([]), 200

    if role == "admin":
        rows = GalleryImage.query.order_by(GalleryImage.uploaded_at.desc()).all()

    elif role == "club_head":
        user = db.session.get(User, uid)
        club_id = user.club_id if user else None
        if not club_id:
            return jsonify([]), 200
        # Images whose event belongs to the head's club
        event_ids = [
            e.id for e in Event.query.filter_by(club_id=club_id).all()
        ]
        rows = (
            GalleryImage.query
            .filter(GalleryImage.event_id.in_(event_ids))
            .order_by(GalleryImage.uploaded_at.desc())
            .all()
        )

    elif role == "student":
        # Clubs the student is enrolled in
        memberships = ClubMember.query.filter_by(user_id=uid).all()
        club_ids = [m.club_id for m in memberships]
        if not club_ids:
            return jsonify([]), 200
        event_ids = [
            e.id for e in Event.query.filter(Event.club_id.in_(club_ids)).all()
        ]
        rows = (
            GalleryImage.query
            .filter(GalleryImage.event_id.in_(event_ids))
            .order_by(GalleryImage.uploaded_at.desc())
            .all()
        )

    else:
        return jsonify([]), 200

    return jsonify([gallery_to_dict(g) for g in rows]), 200


@bp.route("/upload", methods=["POST"])
@jwt_required()
@role_required("admin", "club_head")
def upload():
    uid = get_jwt_identity()
    user = db.session.get(User, uid)

    event_id = request.form.get("eventId") or request.form.get("event_id")
    file = request.files.get("file") or request.files.get("image")
    if not event_id or not file or not file.filename:
        return jsonify({"message": "eventId and file required"}), 400

    ev = db.session.get(Event, event_id)
    if not ev:
        return jsonify({"message": "Event not found"}), 404

    # Club head can only upload to their own club's events
    if user.role == "club_head":
        if not user.club_id or ev.club_id != user.club_id:
            return jsonify({"message": "You can only upload images for your own club's events"}), 403

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


@bp.route("/<gid>", methods=["DELETE"])
@jwt_required()
@role_required("admin", "club_head")
def delete_image(gid):
    uid = get_jwt_identity()
    user = db.session.get(User, uid)

    g = db.session.get(GalleryImage, gid)
    if not g:
        return jsonify({"message": "Image not found"}), 404

    # Club head can only delete images from their own club
    if user.role == "club_head":
        ev = db.session.get(Event, g.event_id)
        if not ev or ev.club_id != user.club_id:
            return jsonify({"message": "You can only delete images from your own club"}), 403

    # Optionally remove the file from disk
    try:
        filename = g.url.split("/api/uploads/")[-1]
        file_path = _upload_dir() / filename
        if file_path.exists():
            file_path.unlink()
    except Exception:
        pass

    db.session.delete(g)
    db.session.commit()
    return "", 204


def register_upload_route(app):
    upload_root = Path(app.instance_path) / "uploads"
    upload_root.mkdir(parents=True, exist_ok=True)

    @app.route("/api/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(upload_root, filename)

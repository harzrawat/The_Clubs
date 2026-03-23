import uuid
from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.decorators import role_required
from app.extensions import db
from app.models import Club, User
from app.serializers import club_to_dict

bp = Blueprint("clubs", __name__, url_prefix="/api/clubs")


def _resolve_head_id(raw: str | None) -> str:
    if not raw or raw == "admin":
        admin = User.query.filter_by(role="admin").first()
        return admin.id if admin else ""
    return raw


@bp.route("", methods=["GET"])
def list_clubs():
    clubs = Club.query.order_by(Club.name).all()
    return jsonify([club_to_dict(c) for c in clubs]), 200


@bp.route("/my", methods=["GET"])
@jwt_required()
def list_my_clubs():
    from flask_jwt_extended import get_jwt_identity
    from app.models import ClubMember
    uid = get_jwt_identity()
    memberships = ClubMember.query.filter_by(user_id=uid).all()
    club_ids = [m.club_id for m in memberships]
    clubs = Club.query.filter(Club.id.in_(club_ids)).all() if club_ids else []
    return jsonify([club_to_dict(c) for c in clubs]), 200


@bp.route("/<cid>/join", methods=["POST"])
@jwt_required()
def join_club(cid):
    from flask_jwt_extended import get_jwt_identity
    from app.models import ClubMember
    uid = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    
    club = db.session.get(Club, cid)
    if not club:
        return jsonify({"message": "Club not found"}), 404
    
    existing = ClubMember.query.filter_by(user_id=uid, club_id=cid).first()
    if existing:
        return jsonify({"message": "Already a member"}), 400
    
    db.session.add(ClubMember(user_id=uid, club_id=cid))
    club.member_count = (club.member_count or 0) + 1
    db.session.commit()
    
    return jsonify({"message": "Joined successfully"}), 200



@bp.route("/<cid>", methods=["GET"])
def get_club(cid):
    c = db.session.get(Club, cid)
    if not c:
        return jsonify({"message": "Not found"}), 404
    return jsonify(club_to_dict(c)), 200


@bp.route("", methods=["POST"])
@jwt_required()
@role_required("admin")
def create_club():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"message": "Name required"}), 400

    head_id = _resolve_head_id(data.get("headId") or data.get("head_id"))
    if not head_id:
        return jsonify({"message": "Could not resolve club head"}), 400

    cid = f"club-{uuid.uuid4().hex[:12]}"
    today = date.today().isoformat()
    club = Club(
        id=cid,
        name=name,
        description=data.get("description") or "",
        category=data.get("category") or "",
        points=0,
        member_count=0,
        head_id=head_id,
        created_at=today,
        logo=data.get("logo"),
    )
    db.session.add(club)
    db.session.commit()
    return jsonify(club_to_dict(club)), 201


@bp.route("/<cid>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_club(cid):
    c = db.session.get(Club, cid)
    if not c:
        return jsonify({"message": "Not found"}), 404
    data = request.get_json(silent=True) or {}
    if "name" in data:
        c.name = data["name"]
    if "description" in data:
        c.description = data["description"] or ""
    if "category" in data:
        c.category = data["category"] or ""
    if "points" in data and data["points"] is not None:
        c.points = int(data["points"])
    if "headId" in data or "head_id" in data:
        hid = data.get("headId") or data.get("head_id")
        c.head_id = _resolve_head_id(hid) or c.head_id
    if "logo" in data:
        c.logo = data.get("logo")
    db.session.commit()
    return jsonify(club_to_dict(c)), 200


@bp.route("/<cid>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_club(cid):
    from app.models import ClubMember, Event, GalleryImage, User

    c = db.session.get(Club, cid)
    if not c:
        return jsonify({"message": "Not found"}), 404

    ClubMember.query.filter_by(club_id=cid).delete()
    User.query.filter_by(club_id=cid).update({"club_id": None})
    for ev in Event.query.filter_by(club_id=cid).all():
        GalleryImage.query.filter_by(event_id=ev.id).delete()
    Event.query.filter_by(club_id=cid).delete()
    db.session.delete(c)
    db.session.commit()
    return "", 204

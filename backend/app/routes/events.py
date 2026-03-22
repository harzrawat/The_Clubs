import uuid

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.decorators import role_required
from app.extensions import db
from app.models import Club, Event, User
from app.serializers import event_to_dict

bp = Blueprint("events", __name__, url_prefix="/api/events")


def _can_manage_event(user: User, club_id: str) -> bool:
    if user.role == "admin":
        return True
    return user.club_id == club_id


@bp.route("", methods=["GET"])
def list_events():
    events = Event.query.order_by(Event.date.desc()).all()
    return jsonify([event_to_dict(e) for e in events]), 200


@bp.route("/<eid>", methods=["GET"])
def get_event(eid):
    ev = db.session.get(Event, eid)
    if not ev:
        return jsonify({"message": "Not found"}), 404
    return jsonify(event_to_dict(ev)), 200


@bp.route("", methods=["POST"])
@jwt_required()
def create_event():
    uid = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    club_id = data.get("clubId") or data.get("club_id")
    if not club_id:
        return jsonify({"message": "clubId required"}), 400
    if not _can_manage_event(user, club_id):
        return jsonify({"message": "Forbidden"}), 403

    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"message": "Title required"}), 400

    eid = f"event-{uuid.uuid4().hex[:12]}"
    created_by = data.get("createdBy") or data.get("created_by") or uid
    ev = Event(
        id=eid,
        title=title,
        description=data.get("description") or "",
        date=data.get("date") or "",
        time=data.get("time") or "",
        location=data.get("location") or "",
        club_id=club_id,
        status="pending",
        created_by=created_by,
        attendance_count=data.get("attendanceCount"),
    )
    db.session.add(ev)
    db.session.commit()
    return jsonify(event_to_dict(ev)), 201


@bp.route("/<eid>", methods=["PUT"])
@jwt_required()
def update_event(eid):
    uid = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"message": "Unauthorized"}), 401

    ev = db.session.get(Event, eid)
    if not ev:
        return jsonify({"message": "Not found"}), 404
    if user.role != "admin" and user.club_id != ev.club_id:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json(silent=True) or {}
    for field, key in [
        ("title", "title"),
        ("description", "description"),
        ("date", "date"),
        ("time", "time"),
        ("location", "location"),
    ]:
        if key in data:
            setattr(ev, field, data[key] or "")
    if "status" in data and user.role == "admin":
        ev.status = data["status"]
    if "attendanceCount" in data:
        ev.attendance_count = data["attendanceCount"]
    db.session.commit()
    return jsonify(event_to_dict(ev)), 200


@bp.route("/<eid>/approve", methods=["POST"])
@jwt_required()
@role_required("admin")
def approve_event(eid):
    ev = db.session.get(Event, eid)
    if not ev:
        return jsonify({"message": "Not found"}), 404
    ev.status = "approved"
    db.session.commit()
    return jsonify(event_to_dict(ev)), 200


@bp.route("/<eid>/reject", methods=["POST"])
@jwt_required()
@role_required("admin")
def reject_event(eid):
    ev = db.session.get(Event, eid)
    if not ev:
        return jsonify({"message": "Not found"}), 404
    ev.status = "rejected"
    db.session.commit()
    return jsonify(event_to_dict(ev)), 200

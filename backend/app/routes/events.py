import uuid

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request

from app.decorators import role_required
from app.extensions import db
from app.models import Club, ClubMember, Event, Notification, User, utcnow
from app.serializers import event_to_dict

bp = Blueprint("events", __name__, url_prefix="/api/events")


def _can_manage_event(user: User, club_id: str) -> bool:
    if user.role == "admin":
        return True
    return user.club_id == club_id


@bp.route("", methods=["GET"])
def list_events():
    """
    Role-specific event display:
    - admin: all events
    - club_head: only their club's events
    - student: all events from clubs in which the student is enrolled
    - guest: approved events only (fallback)
    """
    uid = None
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
    except Exception:
        pass

    if not uid:
        # Guest: approved events only
        events = Event.query.filter_by(status="approved").all()
        return jsonify([event_to_dict(e) for e in events]), 200

    user = db.session.get(User, uid)
    if not user:
        events = Event.query.filter_by(status="approved").all()
        return jsonify([event_to_dict(e) for e in events]), 200

    if user.role == "admin":
        events = Event.query.order_by(Event.date.desc()).all()
    elif user.role == "club_head":
        events = Event.query.filter_by(club_id=user.club_id).order_by(Event.date.desc()).all()
    elif user.role == "student":
        memberships = ClubMember.query.filter_by(user_id=uid).all()
        club_ids = [m.club_id for m in memberships]
        # Students see all approved events OR any events from clubs they've joined
        events = Event.query.filter(
            db.or_(
                Event.status == "approved",
                Event.club_id.in_(club_ids) if club_ids else False
            )
        ).order_by(Event.date.desc()).all()
    else:
        events = Event.query.filter_by(status="approved").all()

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
    
    event_status = "approved" if user.role == "admin" else "pending"

    ev = Event(
        id=eid,
        title=title,
        description=data.get("description") or "",
        date=data.get("date") or "",
        time=data.get("time") or "",
        location=data.get("location") or "",
        club_id=club_id,
        status=event_status,
        created_by=created_by,
        attendance_count=data.get("attendanceCount"),
    )
    db.session.add(ev)

    if event_status == "pending":
        n = Notification(
            id=f"notif-{uuid.uuid4().hex[:12]}",
            type="event_approval",
            title="Event Approval Request",
            message=f"New event '{title}' submitted for approval.",
            club_id=club_id,
            created_at=utcnow().isoformat(),
        )
        db.session.add(n)
    elif event_status == "approved" and user.role == "admin":
        n = Notification(
            id=f"notif-{uuid.uuid4().hex[:12]}",
            type="announcement",
            title=f"New Event: {title}",
            message=f"An admin has scheduled a new event: '{title}'.",
            club_id=club_id,
            created_at=utcnow().isoformat(),
        )
        db.session.add(n)

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
        if ev.status != data["status"]:
            ev.status = data["status"]
            n = Notification(
                id=f"notif-{uuid.uuid4().hex[:12]}",
                type="event_approval" if ev.status == "rejected" else "announcement",
                title="Event Status Changed",
                message=f"The event '{ev.title}' is now {ev.status}.",
                club_id=ev.club_id,
                created_at=utcnow().isoformat(),
            )
            db.session.add(n)

    if "attendanceCount" in data:
        ev.attendance_count = data["attendanceCount"]
    db.session.commit()
    return jsonify(event_to_dict(ev)), 200


@bp.route("/<eid>", methods=["DELETE"])
@jwt_required()
@role_required("admin", "club_head")
def delete_event(eid):
    uid = get_jwt_identity()
    user = db.session.get(User, uid)

    ev = db.session.get(Event, eid)
    if not ev:
        return jsonify({"message": "Not found"}), 404

    if not _can_manage_event(user, ev.club_id):
        return jsonify({"message": "Forbidden"}), 403

    # Send Notification to club head and enrolled students before deleting
    club = db.session.get(Club, ev.club_id)
    club_name = club.name if club else "Unknown Club"

    notif_id = f"notif-{uuid.uuid4().hex[:12]}"
    n = Notification(
        id=notif_id,
        type="announcement",
        title=f"Event Cancelled: {ev.title}",
        message=f"The event '{ev.title}' from {club_name} has been cancelled by {user.role}.",
        club_id=ev.club_id,
        created_at=utcnow().isoformat(),
    )
    db.session.add(n)

    from app.models import GalleryImage
    GalleryImage.query.filter_by(event_id=ev.id).delete(synchronize_session=False)

    db.session.delete(ev)
    db.session.commit()
    return "", 204


@bp.route("/<eid>/approve", methods=["POST"])
@jwt_required()
@role_required("admin")
def approve_event(eid):
    ev = db.session.get(Event, eid)
    if not ev:
        return jsonify({"message": "Not found"}), 404
    ev.status = "approved"

    n_head = Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        type="event_approval",
        title="Event Approved",
        message=f"Your event '{ev.title}' has been approved.",
        club_id=ev.club_id,
        created_at=utcnow().isoformat(),
    )
    db.session.add(n_head)

    n_students = Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        type="announcement",
        title=f"New Event: {ev.title}",
        message=f"A new event '{ev.title}' has been scheduled.",
        club_id=ev.club_id,
        created_at=utcnow().isoformat(),
    )
    db.session.add(n_students)

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

    n = Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        type="event_approval",
        title="Event Rejected",
        message=f"Your event '{ev.title}' has been rejected.",
        club_id=ev.club_id,
        created_at=utcnow().isoformat(),
    )
    db.session.add(n)

    db.session.commit()
    return jsonify(event_to_dict(ev)), 200

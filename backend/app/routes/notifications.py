from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Notification, NotificationRead, User
from app.serializers import notification_to_dict

bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

ALLOWED_BY_ROLE = {
    "admin": {"event_approval", "announcement"},
    "club_head": {"event_approval", "event_reminder", "announcement"},
    "student": {"event_reminder", "announcement"},
}


@bp.route("", methods=["GET"])
@jwt_required(optional=True)
def list_notifications():
    uid = get_jwt_identity()
    if not uid:
        return jsonify([]), 200

    user = db.session.get(User, uid)
    if not user or not user.role:
        return jsonify([]), 200

    allowed = ALLOWED_BY_ROLE.get(user.role, set())
    if not allowed:
        return jsonify([]), 200

    rows = Notification.query.order_by(Notification.created_at.desc()).all()
    
    # Pre-fetch user's club memberships for efficient filtering
    user_club_ids = {user.club_id} if user.club_id else set()
    if user.role == "student":
        user_club_ids.update(m.club_id for m in user.memberships)

    out = []
    for n in rows:
        if n.type not in allowed:
            continue
            
        # Club-specific filtering
        if n.club_id and user.role != "admin":
            if n.club_id not in user_club_ids:
                continue

        nr = NotificationRead.query.filter_by(
            user_id=uid, notification_id=n.id
        ).first()
        read = nr.read if nr else False
        out.append(notification_to_dict(n, read))
    return jsonify(out), 200


@bp.route("/<nid>/read", methods=["PUT"])
@jwt_required()
def mark_read(nid):
    uid = get_jwt_identity()
    n = db.session.get(Notification, nid)
    if not n:
        return jsonify({"message": "Not found"}), 404

    nr = NotificationRead.query.filter_by(
        user_id=uid, notification_id=nid
    ).first()
    if not nr:
        nr = NotificationRead(user_id=uid, notification_id=nid, read=True)
        db.session.add(nr)
    else:
        nr.read = True
    db.session.commit()
    return "", 204

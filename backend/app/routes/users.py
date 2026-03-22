from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.decorators import role_required
from app.extensions import db
from app.models import User
from app.serializers import user_to_dict

bp = Blueprint("users", __name__, url_prefix="/api/users")


@bp.route("", methods=["GET"])
@jwt_required()
@role_required("admin")
def list_users():
    users = User.query.order_by(User.email).all()
    return jsonify([user_to_dict(u) for u in users]), 200


@bp.route("/<uid>/role", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_role(uid):
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"message": "Not found"}), 404
    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if role not in ("admin", "club_head", "student"):
        return jsonify({"message": "Invalid role"}), 400
    user.role = role
    db.session.commit()
    return jsonify(user_to_dict(user)), 200

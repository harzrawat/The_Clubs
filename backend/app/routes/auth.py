import os
import uuid

import bcrypt
from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import Club, ClubMember, User
from app.serializers import user_to_dict

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _check_password(pw: str, pw_hash: str) -> bool:
    if not pw_hash:
        return False
    return bcrypt.checkpw(pw.encode("utf-8"), pw_hash.encode("utf-8"))


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not _check_password(password, user.password_hash or ""):
        return jsonify({"message": "Invalid credentials"}), 401

    from flask_jwt_extended import create_access_token

    token = create_access_token(identity=user.id)
    return jsonify({"user": user_to_dict(user), "token": token}), 200


@bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    club_id = data.get("clubId") or data.get("club_id") or None
    if club_id == "":
        club_id = None

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    uid = f"user-{uuid.uuid4().hex[:12]}"
    user = User(
        id=uid,
        email=email,
        name=name,
        role="student",
        password_hash=_hash_password(password),
        club_id=club_id if club_id else None,
    )
    db.session.add(user)

    if club_id:
        club = db.session.get(Club, club_id)
        if club:
            existing = ClubMember.query.filter_by(user_id=uid, club_id=club_id).first()
            if not existing:
                db.session.add(ClubMember(user_id=uid, club_id=club_id))
            club.member_count = (club.member_count or 0) + 1

    db.session.commit()

    from flask_jwt_extended import create_access_token

    token = create_access_token(identity=user.id)
    return jsonify({"user": user_to_dict(user), "token": token}), 201

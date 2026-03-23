from __future__ import annotations

from datetime import datetime, timezone

from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.String(64), primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(32), nullable=False)  # admin | club_head | student
    # Logical club membership (avoid circular FK with Club.head_id at create time)
    club_id = db.Column(db.String(64), nullable=True)

    memberships = db.relationship(
        "ClubMember",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Club(db.Model):
    __tablename__ = "club"

    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, default="")
    category = db.Column(db.String(128), default="")
    points = db.Column(db.Integer, default=0)
    member_count = db.Column(db.Integer, default=0)
    logo = db.Column(db.String(512), nullable=True)
    head_id = db.Column(db.String(64), db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.String(32), nullable=False)

    members = db.relationship(
        "ClubMember",
        back_populates="club",
        cascade="all, delete-orphan",
    )


class ClubMember(db.Model):
    __tablename__ = "club_member"

    user_id = db.Column(db.String(64), db.ForeignKey("user.id"), primary_key=True)
    club_id = db.Column(db.String(64), db.ForeignKey("club.id"), primary_key=True)

    user = db.relationship("User", back_populates="memberships")
    club = db.relationship("Club", back_populates="members")


class Event(db.Model):
    __tablename__ = "event"

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(512), nullable=False)
    description = db.Column(db.Text, default="")
    date = db.Column(db.String(32), nullable=False)
    time = db.Column(db.String(64), nullable=False)
    location = db.Column(db.String(512), nullable=False)
    club_id = db.Column(db.String(64), db.ForeignKey("club.id"), nullable=False)
    status = db.Column(db.String(32), nullable=False)  # pending | approved | rejected
    created_by = db.Column(db.String(64), db.ForeignKey("user.id"), nullable=False)
    attendance_count = db.Column(db.Integer, nullable=True)


class Notification(db.Model):
    __tablename__ = "notification"

    id = db.Column(db.String(64), primary_key=True)
    type = db.Column(db.String(64), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    club_id = db.Column(db.String(64), db.ForeignKey("club.id"), nullable=True) # Targeting!
    created_at = db.Column(db.String(64), nullable=False)



class NotificationRead(db.Model):
    __tablename__ = "notification_read"

    user_id = db.Column(db.String(64), db.ForeignKey("user.id"), primary_key=True)
    notification_id = db.Column(
        db.String(64), db.ForeignKey("notification.id"), primary_key=True
    )
    read = db.Column(db.Boolean, default=False)


class GalleryImage(db.Model):
    __tablename__ = "gallery_image"

    id = db.Column(db.String(64), primary_key=True)
    event_id = db.Column(db.String(64), db.ForeignKey("event.id"), nullable=False)
    url = db.Column(db.String(1024), nullable=False)
    uploaded_at = db.Column(db.String(64), nullable=False)

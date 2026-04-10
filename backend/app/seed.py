import os

import bcrypt

from app.extensions import db
from app.models import (
    Club,
    ClubMember,
    Event,
    GalleryImage,
    Notification,
    User,
)


def _hash(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_if_empty():
    if User.query.first():
        return

    demo_pw = os.environ.get("DEMO_PASSWORD", "password")
    h = _hash(demo_pw)

    # Core Users
    users = [
        ("admin-1", "admin@university.edu", "Admin User", "admin", None),
        ("head-1", "head@university.edu", "Tech Club Head", "club_head", "club-1"),
        ("student-1", "student@university.edu", "Student Member", "student", "club-1"),
    ]
    for uid, email, name, role, cid in users:
        db.session.add(
            User(
                id=uid,
                email=email,
                name=name,
                role=role,
                password_hash=h,
                club_id=cid,
            )
        )

    # Flush to ensure users are persisted before clubs reference them.
    # PostgreSQL enforces foreign key constraints at flush time.
    db.session.flush()

    # Core Club
    db.session.add(
        Club(
            id="club-1",
            name="Tech Club",
            description="The premier community for technology enthusiasts and innovators.",
            category="Technology",
            member_count=1,
            points=100,
            head_id="head-1",
            created_at="2026-01-01",
        )
    )

    # Core Membership
    db.session.add(ClubMember(user_id="student-1", club_id="club-1"))
    db.session.add(ClubMember(user_id="head-1", club_id="club-1"))

    # Core Event
    db.session.add(
        Event(
            id="event-1",
            title="Introduction to AI",
            description="A foundational workshop on Artificial Intelligence.",
            date="2026-05-15",
            time="02:00 PM",
            location="Room 404, Tech Wing",
            club_id="club-1",
            status="approved",
            created_by="head-1",
            attendance_count=10,
        )
    )

    # Core Notification
    db.session.add(
        Notification(
            id="notif-1",
            type="announcement",
            title="Database Migration Complete",
            message="The system has been successfully migrated to PostgreSQL.",
            created_at="2026-04-11T00:00:00",
        )
    )

    # Core Gallery Image
    db.session.add(
        GalleryImage(
            id="gallery-1",
            event_id="event-1",
            url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
            uploaded_at="2026-04-10",
        )
    )

    db.session.commit()

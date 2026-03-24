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

    users = [
        ("user1", "admin@university.edu", "Admin User", "admin", None),
        ("user2", "john@university.edu", "John Smith", "club_head", "1"),
        ("user3", "emily@university.edu", "Emily Johnson", "club_head", "2"),
        ("user4", "michael@university.edu", "Michael Brown", "student", "3"),
        ("user5", "alex@university.edu", "Alex Wilson", "club_head", "4"),
        ("user6", "sarah@university.edu", "Sarah Davis", "club_head", "5"),
        ("user7", "chris@university.edu", "Chris Lee", "club_head", "6"),
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
    # Commit users first so they can be referenced as club heads
    db.session.commit()

    clubs_data = [
        (
            "1",
            "Tech Club",
            "Exploring the latest in technology and innovation. We organize hackathons, tech talks, and workshops.",
            "Technology",
            85,
            450,
            "user2",
            "2025-01-15",
        ),
        (
            "2",
            "Drama Society",
            "Bringing stories to life through theatrical performances and creative expression.",
            "Arts",
            62,
            380,
            "user3",
            "2025-01-20",
        ),
        (
            "3",
            "Photography Club",
            "Capturing moments and exploring the art of photography through workshops and exhibitions.",
            "Arts",
            45,
            320,
            "user4",
            "2025-02-01",
        ),
        (
            "4",
            "Robotics Club",
            "Building and programming robots for competitions and demonstrations.",
            "Technology",
            84,
            410,
            "user5",
            "2025-02-10",
        ),
        (
            "5",
            "Music Society",
            "Creating harmony through diverse musical performances and jam sessions.",
            "Arts",
            72,
            395,
            "user6",
            "2025-02-15",
        ),
        (
            "6",
            "Environmental Club",
            "Promoting sustainability and environmental awareness on campus.",
            "Social",
            55,
            290,
            "user7",
            "2025-02-20",
        ),
    ]
    for row in clubs_data:
        cid, name, desc, cat, members, pts, head, created = row
        db.session.add(
            Club(
                id=cid,
                name=name,
                description=desc,
                category=cat,
                member_count=members,
                points=pts,
                head_id=head,
                created_at=created,
            )
        )
    # Commit clubs so they can be referenced by events and members
    db.session.commit()

    for uid, club_id in [
        ("user2", "1"),
        ("user3", "2"),
        ("user4", "3"),
        ("user5", "4"),
        ("user6", "5"),
        ("user7", "6"),
    ]:
        db.session.add(ClubMember(user_id=uid, club_id=club_id))

    events_data = [
        (
            "1",
            "Annual Hackathon 2026",
            "24-hour coding marathon with exciting prizes and learning opportunities.",
            "2026-04-15",
            "09:00 AM",
            "Engineering Building, Hall A",
            "1",
            "approved",
            "user2",
            120,
        ),
        (
            "2",
            "Spring Musical Performance",
            "A spectacular theatrical performance showcasing student talent.",
            "2026-03-22",
            "06:00 PM",
            "University Auditorium",
            "2",
            "approved",
            "user3",
            None,
        ),
        (
            "3",
            "Photography Workshop",
            "Learn advanced photography techniques from professional photographers.",
            "2026-03-18",
            "02:00 PM",
            "Arts Building, Room 301",
            "3",
            "pending",
            "user4",
            None,
        ),
        (
            "4",
            "Robot Wars Competition",
            "Inter-university robotics competition with exciting battles.",
            "2026-04-20",
            "10:00 AM",
            "Sports Complex",
            "4",
            "pending",
            "user5",
            None,
        ),
        (
            "5",
            "Campus Cleanup Drive",
            "Join us in making our campus greener and cleaner.",
            "2026-03-25",
            "08:00 AM",
            "Central Lawn",
            "6",
            "approved",
            "user7",
            None,
        ),
    ]
    for row in events_data:
        eid, title, desc, d, t, loc, cid, status, creator, att = row
        db.session.add(
            Event(
                id=eid,
                title=title,
                description=desc,
                date=d,
                time=t,
                location=loc,
                club_id=cid,
                status=status,
                created_by=creator,
                attendance_count=att,
            )
        )

    notifications_data = [
        (
            "1",
            "event_approval",
            "Event Approved",
            'Your event "Annual Hackathon 2026" has been approved by the administration.',
            "2026-03-10T14:30:00",
        ),
        (
            "2",
            "event_reminder",
            "Upcoming Event Reminder",
            "Photography Workshop is scheduled for tomorrow at 2:00 PM.",
            "2026-03-17T09:00:00",
        ),
        (
            "3",
            "announcement",
            "System Maintenance",
            "The system will undergo maintenance on March 20th from 2:00 AM to 4:00 AM.",
            "2026-03-09T10:00:00",
        ),
        (
            "4",
            "event_approval",
            "Event Pending Review",
            'Your event "Robot Wars Competition" is pending admin approval.',
            "2026-03-11T11:20:00",
        ),
    ]
    for nid, ntype, title, msg, created in notifications_data:
        db.session.add(
            Notification(
                id=nid,
                type=ntype,
                title=title,
                message=msg,
                created_at=created,
            )
        )

    gallery_data = [
        ("1", "1", "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800", "2026-03-01"),
        ("2", "1", "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800", "2026-03-01"),
        ("3", "2", "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800", "2026-02-28"),
        ("4", "3", "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800", "2026-02-25"),
        ("5", "2", "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800", "2026-02-28"),
        ("6", "1", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800", "2026-03-01"),
    ]
    for gid, eid, url, uploaded in gallery_data:
        db.session.add(
            GalleryImage(
                id=gid,
                event_id=eid,
                url=url,
                uploaded_at=uploaded,
            )
        )

    db.session.commit()

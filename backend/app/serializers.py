from app.extensions import db
from app.models import Club, Event, GalleryImage, Notification, User


def user_to_dict(u: User) -> dict:
    d = {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role,
    }
    if u.club_id:
        d["clubId"] = u.club_id
    return d


def club_to_dict(c: Club) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "description": c.description or "",
        "category": c.category or "",
        "memberCount": c.member_count if c.member_count is not None else 0,
        "points": c.points or 0,
        "headId": c.head_id,
        "createdAt": c.created_at,
        **({"logo": c.logo} if c.logo else {}),
    }


def event_to_dict(e: Event) -> dict:
    club = db.session.get(Club, e.club_id)
    club_name = club.name if club else ""
    d = {
        "id": e.id,
        "title": e.title,
        "description": e.description or "",
        "date": e.date,
        "time": e.time,
        "location": e.location,
        "clubId": e.club_id,
        "clubName": club_name,
        "status": e.status,
        "createdBy": e.created_by,
    }
    if e.attendance_count is not None:
        d["attendanceCount"] = e.attendance_count
    return d


def notification_to_dict(n: Notification, read: bool) -> dict:
    return {
        "id": n.id,
        "type": n.type,
        "title": n.title,
        "message": n.message,
        "read": read,
        "createdAt": n.created_at,
    }


def gallery_to_dict(g: GalleryImage) -> dict:
    ev = db.session.get(Event, g.event_id)
    event_name = ev.title if ev else ""
    return {
        "id": g.id,
        "eventId": g.event_id,
        "eventName": event_name,
        "url": g.url,
        "uploadedAt": g.uploaded_at,
    }

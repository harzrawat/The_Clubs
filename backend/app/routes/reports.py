from collections import defaultdict
from datetime import datetime

from flask import Blueprint, jsonify, request

from app.models import Club, Event

bp = Blueprint("reports", __name__, url_prefix="/api/reports")

MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]


@bp.route("/yearly", methods=["GET"])
def yearly_report():
    year = request.args.get("year", type=int)
    if not year:
        year = datetime.now().year

    events = Event.query.filter_by(status="approved").all()
    in_year = []
    for e in events:
        try:
            y = int((e.date or "")[:4])
        except (TypeError, ValueError):
            continue
        if y == year:
            in_year.append(e)

    total_events = len(in_year)
    total_clubs = Club.query.count()

    month_counts = defaultdict(int)
    for e in in_year:
        try:
            month = int((e.date or "")[5:7])
        except (TypeError, ValueError):
            continue
        if 1 <= month <= 12:
            month_counts[month] += 1

    monthly_data = [{"month": MONTHS[m - 1], "events": month_counts[m]} for m in range(1, 13)]

    total_participants = sum(
        (e.attendance_count or 0) for e in in_year if e.attendance_count is not None
    )

    return (
        jsonify(
            {
                "year": year,
                "totalEvents": total_events,
                "totalClubs": total_clubs,
                "totalParticipants": total_participants,
                "monthlyData": monthly_data,
            }
        ),
        200,
    )

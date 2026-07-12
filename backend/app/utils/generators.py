"""
Shared small helpers used across routers — temp password generation
and a background-thread email dispatcher (fire-and-forget).
"""
import random
import string
import threading
from sqlalchemy.orm import Session
from .. import models

def generate_temp_password(length: int = 10) -> str:
    """Generate a human-readable temporary password."""
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))

def send_email_async(fn, *args) -> None:
    """Run an email-sending function in a background thread so requests don't block on SMTP."""
    thread = threading.Thread(target=fn, args=args, daemon=True)
    thread.start()

def generate_trip_number(db: Session) -> str:
    last_trip = (
        db.query(models.Trip)
        .order_by(models.Trip.created_at.desc())
        .first()
    )

    if not last_trip or not last_trip.trip_number:
        return "TRIP-0001"

    try:
        last_number = int(last_trip.trip_number.split("-")[-1])
    except (ValueError, IndexError):
        last_number = 0

    return f"TRIP-{last_number + 1:04d}"
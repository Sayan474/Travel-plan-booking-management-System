from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

import models


def generate_booking_reference(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8].upper()}"


def mark_trip_booked(db: Session, trip: models.Trip) -> models.Trip:
    trip.status = "booked"
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


def create_payment(
    db: Session,
    *,
    user_id: int,
    trip_id: int,
    amount,
    currency: str,
    method: str,
    status: str = "completed",
) -> models.Payment:
    payment = models.Payment(
        user_id=user_id,
        trip_id=trip_id,
        amount=amount,
        currency=currency,
        method=method,
        status=status,
        transaction_id=f"TXN-{uuid4().hex[:10].upper()}",
        paid_at=datetime.utcnow(),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

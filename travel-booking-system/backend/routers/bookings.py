from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from routers.auth import get_current_user
from services import booking_service
from services.email_service import send_booking_confirmation

router = APIRouter(prefix="/api", tags=["bookings"])


@router.post("/bookings/confirm")
def confirm_booking(
    payload: schemas.BookingConfirmRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == payload.trip_id, models.Trip.user_id == current_user.id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    for p in payload.passengers:
        passenger = models.Passenger(booking_id=trip.id, **p.model_dump())
        db.add(passenger)

    booking_reference = booking_service.generate_booking_reference("TRIP")
    for flight in trip.flights:
        if not flight.booking_ref:
            flight.booking_ref = booking_reference
    for hotel in trip.hotels:
        if not hotel.booking_ref:
            hotel.booking_ref = booking_reference
    for activity in trip.activities:
        if not activity.booking_ref:
            activity.booking_ref = booking_reference

    trip = booking_service.mark_trip_booked(db, trip)
    email_result = send_booking_confirmation(current_user.email, booking_reference)

    return {
        "message": "Booking confirmed",
        "trip_id": trip.id,
        "booking_reference": booking_reference,
        "email": email_result,
    }


@router.get("/bookings/history", response_model=list[schemas.TripOut])
def booking_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Trip)
        .filter(models.Trip.user_id == current_user.id)
        .order_by(models.Trip.created_at.desc())
        .all()
    )


@router.post("/payments/process", response_model=schemas.PaymentOut, status_code=status.HTTP_201_CREATED)
def process_payment(
    payload: schemas.PaymentProcessRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == payload.trip_id, models.Trip.user_id == current_user.id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    payment = booking_service.create_payment(
        db,
        user_id=current_user.id,
        trip_id=payload.trip_id,
        amount=payload.amount,
        currency=payload.currency,
        method=payload.method,
        status="completed",
    )
    return payment

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api", tags=["flights"])


def _ensure_trip_access(db: Session, trip_id: int, user_id: int) -> None:
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id, models.Trip.user_id == user_id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")


@router.get("/trips/{trip_id}/flights", response_model=list[schemas.FlightOut])
def list_flights(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ensure_trip_access(db, trip_id, current_user.id)
    return db.query(models.Flight).filter(models.Flight.trip_id == trip_id).all()


@router.post(
    "/trips/{trip_id}/flights",
    response_model=schemas.FlightOut,
    status_code=status.HTTP_201_CREATED,
)
def create_flight(
    trip_id: int,
    payload: schemas.FlightCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ensure_trip_access(db, trip_id, current_user.id)
    flight = models.Flight(trip_id=trip_id, **payload.model_dump())
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return flight


@router.delete("/flights/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flight(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    flight = db.query(models.Flight).filter(models.Flight.id == id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    _ensure_trip_access(db, flight.trip_id, current_user.id)
    db.delete(flight)
    db.commit()
    return None

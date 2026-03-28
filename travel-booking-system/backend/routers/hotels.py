from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api", tags=["hotels"])


def _ensure_trip_access(db: Session, trip_id: int, user_id: int) -> None:
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id, models.Trip.user_id == user_id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")


@router.get("/trips/{trip_id}/hotels", response_model=list[schemas.HotelOut])
def list_hotels(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ensure_trip_access(db, trip_id, current_user.id)
    return db.query(models.Hotel).filter(models.Hotel.trip_id == trip_id).all()


@router.post(
    "/trips/{trip_id}/hotels",
    response_model=schemas.HotelOut,
    status_code=status.HTTP_201_CREATED,
)
def create_hotel(
    trip_id: int,
    payload: schemas.HotelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _ensure_trip_access(db, trip_id, current_user.id)
    hotel = models.Hotel(trip_id=trip_id, **payload.model_dump())
    db.add(hotel)
    db.commit()
    db.refresh(hotel)
    return hotel


@router.delete("/hotels/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    _ensure_trip_access(db, hotel.trip_id, current_user.id)
    db.delete(hotel)
    db.commit()
    return None

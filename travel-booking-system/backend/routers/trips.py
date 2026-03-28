from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api", tags=["trips"])


def _get_trip_or_404(db: Session, trip_id: int, user_id: int) -> models.Trip:
    trip = (
        db.query(models.Trip)
        .filter(models.Trip.id == trip_id, models.Trip.user_id == user_id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.get("/trips", response_model=list[schemas.TripOut])
def list_trips(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Trip).filter(models.Trip.user_id == current_user.id).all()


@router.post("/trips", response_model=schemas.TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: schemas.TripCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    trip = models.Trip(user_id=current_user.id, **payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/trips/{id}", response_model=schemas.TripOut)
def get_trip(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_trip_or_404(db, id, current_user.id)


@router.put("/trips/{id}", response_model=schemas.TripOut)
def update_trip(
    id: int,
    payload: schemas.TripUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    trip = _get_trip_or_404(db, id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/trips/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    trip = _get_trip_or_404(db, id, current_user.id)
    db.delete(trip)
    db.commit()
    return None


@router.get("/trips/{trip_id}/activities", response_model=list[schemas.ActivityOut])
def list_activities(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_trip_or_404(db, trip_id, current_user.id)
    return db.query(models.Activity).filter(models.Activity.trip_id == trip_id).all()


@router.post(
    "/trips/{trip_id}/activities",
    response_model=schemas.ActivityOut,
    status_code=status.HTTP_201_CREATED,
)
def create_activity(
    trip_id: int,
    payload: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_trip_or_404(db, trip_id, current_user.id)
    activity = models.Activity(trip_id=trip_id, **payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/activities/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    activity = db.query(models.Activity).filter(models.Activity.id == id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    _get_trip_or_404(db, activity.trip_id, current_user.id)
    db.delete(activity)
    db.commit()
    return None

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from routers.auth import get_current_user
from services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/chat", response_model=schemas.AIChatResponse)
def chat(
    payload: schemas.AIChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reply = ai_service.chat(db, current_user.id, payload.session_id, payload.message)
    return schemas.AIChatResponse(session_id=payload.session_id, reply=reply)


@router.get("/history/{session_id}", response_model=list[schemas.AIMessageOut])
def history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.AIConversation)
        .filter(
            models.AIConversation.user_id == current_user.id,
            models.AIConversation.session_id == session_id,
        )
        .order_by(models.AIConversation.timestamp.asc())
        .all()
    )


@router.post("/plan-trip", response_model=schemas.AIPlanTripResponse)
def plan_trip(
    payload: schemas.AIPlanTripRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    session_id = f"plan-{current_user.id}-{payload.destination.lower()}"
    return ai_service.plan_trip(
        db,
        current_user.id,
        payload.destination,
        payload.start_date,
        payload.end_date,
        payload.budget,
        payload.preferences,
        session_id,
    )


@router.post("/suggest-hotels")
def suggest_hotels(
    payload: schemas.AISuggestRequest,
    current_user: models.User = Depends(get_current_user),
):
    _ = current_user
    return {"destination": payload.destination, "hotels": ai_service.suggest(payload.destination, "hotels")}


@router.post("/suggest-flights")
def suggest_flights(
    payload: schemas.AISuggestRequest,
    current_user: models.User = Depends(get_current_user),
):
    _ = current_user
    return {
        "destination": payload.destination,
        "flights": ai_service.suggest(payload.destination, "flights"),
    }

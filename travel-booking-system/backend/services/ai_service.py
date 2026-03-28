# pyright: reportMissingImports=false, reportMissingModuleSource=false

import json
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

import models

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

SYSTEM_PROMPT = (
    "You are TravelMind, an expert AI travel assistant. "
    "You help users plan trips, find flights and hotels, create itineraries, "
    "manage bookings, and answer any travel-related questions. "
    "When given a destination and dates, you generate a full day-by-day itinerary. "
    "You respond in structured JSON when asked for plans, and conversational "
    "text for general queries."
)


class AIService:
    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("OPENAI_BASE_URL")

        # Support OpenAI-compatible providers if a non-OpenAI key is used.
        if self.api_key and self.api_key.startswith("gsk_") and not self.base_url:
            self.base_url = "https://api.groq.com/openai/v1"

        if self.api_key:
            if self.base_url:
                self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
            else:
                self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

        default_model = "llama-3.1-8b-instant" if self.api_key and self.api_key.startswith("gsk_") else "gpt-4o-mini"
        self.model = os.getenv("OPENAI_MODEL", default_model)

    def save_message(
        self, db: Session, user_id: int, session_id: str, role: str, message: str
    ) -> models.AIConversation:
        record = models.AIConversation(
            user_id=user_id, session_id=session_id, role=role, message=message
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    def get_history(self, db: Session, user_id: int, session_id: str) -> list[dict]:
        rows = (
            db.query(models.AIConversation)
            .filter(
                models.AIConversation.user_id == user_id,
                models.AIConversation.session_id == session_id,
            )
            .order_by(models.AIConversation.timestamp.asc())
            .all()
        )
        return [{"role": row.role, "content": row.message} for row in rows]

    def chat(self, db: Session, user_id: int, session_id: str, message: str) -> str:
        self.save_message(db, user_id, session_id, "user", message)
        history = self.get_history(db, user_id, session_id)

        if not self.client:
            reply = (
                "TravelMind offline mode: I can still help with planning. "
                "Set OPENAI_API_KEY to enable live AI responses."
            )
            self.save_message(db, user_id, session_id, "assistant", reply)
            return reply

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    *history,
                ],
                temperature=0.6,
            )
            reply = completion.choices[0].message.content or "I could not generate a response."
        except Exception:
            reply = (
                "TravelMind offline mode: I can still help with planning. "
                "The live AI provider is temporarily unavailable."
            )
        self.save_message(db, user_id, session_id, "assistant", reply)
        return reply

    def plan_trip(
        self,
        db: Session,
        user_id: int,
        destination: str,
        start_date,
        end_date,
        budget,
        preferences: str | None,
        session_id: str,
    ) -> dict:
        plan_request = {
            "destination": destination,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "budget": float(budget) if budget is not None else None,
            "preferences": preferences,
        }

        prompt = (
            "Generate a complete trip plan in JSON with keys: "
            "itinerary (list of days with date,title,activities), "
            "suggested_flights (list), suggested_hotels (list), "
            "estimated_cost (number), tips (list of strings). Input: "
            f"{json.dumps(plan_request)}"
        )

        self.save_message(db, user_id, session_id, "user", prompt)

        if not self.client:
            days = (end_date - start_date).days + 1
            itinerary = []
            for i in range(max(days, 1)):
                itinerary.append(
                    {
                        "day": i + 1,
                        "date": str(start_date),
                        "title": f"Explore {destination}",
                        "activities": [
                            f"City highlights tour in {destination}",
                            "Local food tasting",
                        ],
                    }
                )
            fallback = {
                "itinerary": itinerary,
                "suggested_flights": [
                    {
                        "airline": "SkyWays",
                        "origin": "Your City",
                        "destination": destination,
                        "price": 399,
                    }
                ],
                "suggested_hotels": [
                    {
                        "name": f"Central {destination} Hotel",
                        "price_per_night": 120,
                    }
                ],
                "estimated_cost": float(budget) if budget else 1500,
                "tips": ["Carry travel insurance", "Book early for better fares"],
            }
            self.save_message(db, user_id, session_id, "assistant", json.dumps(fallback))
            return fallback

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.4,
            )
            text = completion.choices[0].message.content or "{}"

            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                parsed = {
                    "itinerary": [],
                    "suggested_flights": [],
                    "suggested_hotels": [],
                    "estimated_cost": float(budget) if budget else 0,
                    "tips": ["Could not parse AI output"],
                }
        except Exception:
            days = (end_date - start_date).days + 1
            itinerary = []
            for i in range(max(days, 1)):
                itinerary.append(
                    {
                        "day": i + 1,
                        "date": str(start_date),
                        "title": f"Explore {destination}",
                        "activities": [
                            f"City highlights tour in {destination}",
                            "Local food tasting",
                        ],
                    }
                )
            parsed = {
                "itinerary": itinerary,
                "suggested_flights": [
                    {
                        "airline": "SkyWays",
                        "origin": "Your City",
                        "destination": destination,
                        "price": 399,
                    }
                ],
                "suggested_hotels": [
                    {
                        "name": f"Central {destination} Hotel",
                        "price_per_night": 120,
                    }
                ],
                "estimated_cost": float(budget) if budget else 1500,
                "tips": [
                    "Live AI is temporarily unavailable; showing fallback plan",
                    "Book early for better fares",
                ],
            }

        self.save_message(db, user_id, session_id, "assistant", json.dumps(parsed))
        return parsed

    def suggest(self, destination: str, kind: str) -> list[dict]:
        if kind == "hotels":
            return [
                {
                    "name": f"{destination} Suites",
                    "location": destination,
                    "price_per_night": 95,
                    "rating": 4.4,
                },
                {
                    "name": f"Grand {destination} Residency",
                    "location": destination,
                    "price_per_night": 140,
                    "rating": 4.7,
                },
            ]
        return [
            {
                "airline": "AeroNova",
                "origin": "Your City",
                "destination": destination,
                "departure": datetime.utcnow().isoformat(),
                "price": 320,
            },
            {
                "airline": "FlyJet",
                "origin": "Your City",
                "destination": destination,
                "departure": datetime.utcnow().isoformat(),
                "price": 410,
            },
        ]


ai_service = AIService()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

import models
from database import Base, engine
from routers import ai_agent, auth, bookings, flights, hotels, trips

app = FastAPI(title="TravelMind Booking Management API", version="1.0.0")

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.on_event("startup")
def on_startup() -> None:
    models.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "TravelMind API is running"}


app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(flights.router)
app.include_router(hotels.router)
app.include_router(bookings.router)
app.include_router(ai_agent.router)

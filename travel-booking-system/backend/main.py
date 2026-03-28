from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import Base, engine
from routers import ai_agent, auth, bookings, flights, hotels, trips

app = FastAPI(title="TravelMind Booking Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

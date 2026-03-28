from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None
    avatar_url: str | None
    created_at: datetime
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TripBase(BaseModel):
    title: str
    destination: str
    start_date: date
    end_date: date
    budget: Decimal | None = None
    status: Literal["planned", "booked", "completed", "cancelled"] = "planned"
    notes: str | None = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: str | None = None
    destination: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    budget: Decimal | None = None
    status: Literal["planned", "booked", "completed", "cancelled"] | None = None
    notes: str | None = None


class FlightBase(BaseModel):
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    seat_class: str | None = None
    price: Decimal
    booking_ref: str | None = None
    status: str = "reserved"


class FlightCreate(FlightBase):
    pass


class FlightOut(FlightBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int


class HotelBase(BaseModel):
    hotel_name: str
    location: str
    check_in: date
    check_out: date
    room_type: str | None = None
    price_per_night: Decimal
    total_price: Decimal
    booking_ref: str | None = None
    status: str = "reserved"


class HotelCreate(HotelBase):
    pass


class HotelOut(HotelBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int


class ActivityBase(BaseModel):
    name: str
    location: str | None = None
    scheduled_date: date
    duration_hours: float | None = None
    price: Decimal | None = None
    booking_ref: str | None = None
    status: str = "planned"


class ActivityCreate(ActivityBase):
    pass


class ActivityOut(ActivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int


class TripOut(TripBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    flights: list[FlightOut] = Field(default_factory=list)
    hotels: list[HotelOut] = Field(default_factory=list)
    activities: list[ActivityOut] = Field(default_factory=list)


class PassengerCreate(BaseModel):
    full_name: str
    passport_number: str
    dob: date
    nationality: str


class PaymentProcessRequest(BaseModel):
    trip_id: int
    amount: Decimal
    currency: str = "USD"
    method: str


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    trip_id: int
    amount: Decimal
    currency: str
    method: str
    status: str
    transaction_id: str | None
    paid_at: datetime | None


class BookingConfirmRequest(BaseModel):
    trip_id: int
    passengers: list[PassengerCreate] = Field(default_factory=list)


class AIChatRequest(BaseModel):
    session_id: str
    message: str


class AIChatResponse(BaseModel):
    session_id: str
    reply: str


class AIMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    session_id: str
    role: str
    message: str
    timestamp: datetime


class AIPlanTripRequest(BaseModel):
    destination: str
    start_date: date
    end_date: date
    budget: Decimal | None = None
    preferences: str | None = None


class AIPlanTripResponse(BaseModel):
    itinerary: list[dict]
    suggested_flights: list[dict]
    suggested_hotels: list[dict]
    estimated_cost: float
    tips: list[str]


class AISuggestRequest(BaseModel):
    destination: str
    start_date: date | None = None
    end_date: date | None = None
    budget: Decimal | None = None
    preferences: str | None = None

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(40), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    role = Column(String(50), default="user", nullable=False)

    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship(
        "AIConversation", back_populates="user", cascade="all, delete-orphan"
    )


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(180), nullable=False)
    destination = Column(String(180), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget = Column(Numeric(12, 2), nullable=True)
    status = Column(String(20), default="planned", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="trips")
    flights = relationship("Flight", back_populates="trip", cascade="all, delete-orphan")
    hotels = relationship("Hotel", back_populates="trip", cascade="all, delete-orphan")
    activities = relationship(
        "Activity", back_populates="trip", cascade="all, delete-orphan"
    )
    payments = relationship("Payment", back_populates="trip", cascade="all, delete-orphan")


class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    airline = Column(String(120), nullable=False)
    flight_number = Column(String(50), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    seat_class = Column(String(50), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    booking_ref = Column(String(100), nullable=True)
    status = Column(String(50), default="reserved", nullable=False)

    trip = relationship("Trip", back_populates="flights")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    hotel_name = Column(String(180), nullable=False)
    location = Column(String(180), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    room_type = Column(String(80), nullable=True)
    price_per_night = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)
    booking_ref = Column(String(100), nullable=True)
    status = Column(String(50), default="reserved", nullable=False)

    trip = relationship("Trip", back_populates="hotels")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(180), nullable=False)
    location = Column(String(180), nullable=True)
    scheduled_date = Column(Date, nullable=False)
    duration_hours = Column(Float, nullable=True)
    price = Column(Numeric(10, 2), nullable=True)
    booking_ref = Column(String(100), nullable=True)
    status = Column(String(50), default="planned", nullable=False)

    trip = relationship("Trip", back_populates="activities")


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(180), nullable=False)
    passport_number = Column(String(80), nullable=False)
    dob = Column(Date, nullable=False)
    nationality = Column(String(80), nullable=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    method = Column(String(50), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    transaction_id = Column(String(120), nullable=True)
    paid_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="payments")
    trip = relationship("Trip", back_populates="payments")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String(120), index=True, nullable=False)
    role = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="ai_conversations")

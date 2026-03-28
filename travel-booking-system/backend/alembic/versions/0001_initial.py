"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-03-27
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=40)),
        sa.Column("avatar_url", sa.String(length=512)),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
    )
    op.create_table(
        "trips",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("destination", sa.String(length=180), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("budget", sa.Numeric(12, 2)),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="planned"),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "flights",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trip_id", sa.Integer(), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("airline", sa.String(length=120), nullable=False),
        sa.Column("flight_number", sa.String(length=50), nullable=False),
        sa.Column("origin", sa.String(length=100), nullable=False),
        sa.Column("destination", sa.String(length=100), nullable=False),
        sa.Column("departure_time", sa.DateTime(), nullable=False),
        sa.Column("arrival_time", sa.DateTime(), nullable=False),
        sa.Column("seat_class", sa.String(length=50)),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("booking_ref", sa.String(length=100)),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="reserved"),
    )
    op.create_table(
        "hotels",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trip_id", sa.Integer(), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hotel_name", sa.String(length=180), nullable=False),
        sa.Column("location", sa.String(length=180), nullable=False),
        sa.Column("check_in", sa.Date(), nullable=False),
        sa.Column("check_out", sa.Date(), nullable=False),
        sa.Column("room_type", sa.String(length=80)),
        sa.Column("price_per_night", sa.Numeric(10, 2), nullable=False),
        sa.Column("total_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("booking_ref", sa.String(length=100)),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="reserved"),
    )
    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("trip_id", sa.Integer(), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("location", sa.String(length=180)),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("duration_hours", sa.Float()),
        sa.Column("price", sa.Numeric(10, 2)),
        sa.Column("booking_ref", sa.String(length=100)),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="planned"),
    )
    op.create_table(
        "passengers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("full_name", sa.String(length=180), nullable=False),
        sa.Column("passport_number", sa.String(length=80), nullable=False),
        sa.Column("dob", sa.Date(), nullable=False),
        sa.Column("nationality", sa.String(length=80), nullable=False),
    )
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trip_id", sa.Integer(), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="USD"),
        sa.Column("method", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("transaction_id", sa.String(length=120)),
        sa.Column("paid_at", sa.DateTime()),
    )
    op.create_table(
        "ai_conversations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_id", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ai_conversations")
    op.drop_table("payments")
    op.drop_table("passengers")
    op.drop_table("activities")
    op.drop_table("hotels")
    op.drop_table("flights")
    op.drop_table("trips")
    op.drop_table("users")

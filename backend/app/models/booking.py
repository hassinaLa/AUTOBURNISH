from datetime import datetime, date, time

from sqlalchemy import String, Text, DateTime, Date, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # =========================
    # CUSTOMER INFORMATION
    # =========================

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    # =========================
    # VEHICLE INFORMATION
    # =========================

    vehicle_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    vehicle_model: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    vehicle_year: Mapped[int | None] = mapped_column(
        nullable=True
    )

    vehicle_color: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    # =========================
    # SERVICE
    # =========================

    package: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    service: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    request_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # =========================
    # APPOINTMENT
    # =========================

    preferred_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    preferred_time: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    # =========================
    # ADDITIONAL INFORMATION
    # =========================

    message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    contact_preference: Mapped[str] = mapped_column(
        String(20),
        default="phone",
        nullable=False
    )

    # =========================
    # BOOKING STATUS
    # =========================

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
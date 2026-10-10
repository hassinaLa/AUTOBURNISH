import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin
from app.database.database import get_db
from app.models.booking import Booking
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingCreatedResponse,
    BookingStatusUpdate,
)


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)


# =====================================================
# CREATE BOOKING
# PUBLIC
# =====================================================


@router.post(
    "/",
    response_model=BookingCreatedResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
):
    photo_token = secrets.token_urlsafe(32)

    new_booking = Booking(
        full_name=booking.full_name,
        phone=booking.phone,
        email=booking.email,
        vehicle_type=booking.vehicle_type,
        vehicle_model=booking.vehicle_model,
        vehicle_year=booking.vehicle_year,
        vehicle_color=booking.vehicle_color,
        package=booking.package,
        service=booking.service,
        request_type=booking.request_type,
        preferred_date=booking.preferred_date,
        preferred_time=booking.preferred_time,
        message=booking.message,
        contact_preference=booking.contact_preference,
        status="pending",
        photo_token=photo_token,
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {
        "id": new_booking.id,
        "full_name": new_booking.full_name,
        "phone": new_booking.phone,
        "email": new_booking.email,
        "vehicle_type": new_booking.vehicle_type,
        "vehicle_model": new_booking.vehicle_model,
        "vehicle_year": new_booking.vehicle_year,
        "vehicle_color": new_booking.vehicle_color,
        "package": new_booking.package,
        "service": new_booking.service,
        "request_type": new_booking.request_type,
        "preferred_date": new_booking.preferred_date,
        "preferred_time": new_booking.preferred_time,
        "message": new_booking.message,
        "contact_preference": new_booking.contact_preference,
        "status": new_booking.status,
        "created_at": new_booking.created_at,
        "photo_token": photo_token,
    }


# =====================================================
# GET ALL BOOKINGS
# ADMIN ONLY
# =====================================================

@router.get(
    "/",
    response_model=list[BookingResponse]
)
def get_bookings(
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):

    bookings = (
        db.query(Booking)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return bookings


# =====================================================
# GET ONE BOOKING
# ADMIN ONLY
# =====================================================

@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    return booking


# =====================================================
# UPDATE BOOKING STATUS
# ADMIN ONLY
# =====================================================

@router.patch(
    "/{booking_id}/status",
    response_model=BookingResponse
)
def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    allowed_statuses = {
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    }

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking status"
        )

    booking.status = status_update.status

    db.commit()
    db.refresh(booking)

    return booking
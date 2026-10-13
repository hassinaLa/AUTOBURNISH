from datetime import date, time, datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class BookingCreate(BaseModel):
    full_name: str
    phone: str
    email: EmailStr | None = None

    vehicle_type: str
    vehicle_model: str
    vehicle_year: int | None = None
    vehicle_color: str | None = None

    package: str | None = None
    service: str | None = None
    request_type: str

    preferred_date: date
    preferred_time: time

    message: str | None = None
    contact_preference: str = "phone"


class BookingResponse(BaseModel):
    id: int

    full_name: str
    phone: str
    email: str | None

    vehicle_type: str
    vehicle_model: str
    vehicle_year: int | None
    vehicle_color: str | None

    package: str | None
    service: str | None
    request_type: str

    preferred_date: date
    preferred_time: time

    message: str | None
    contact_preference: str

    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class BookingStatusUpdate(BaseModel):
    status: str


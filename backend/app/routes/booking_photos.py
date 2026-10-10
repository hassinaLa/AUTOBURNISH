
from io import BytesIO
from pathlib import Path
from uuid import uuid4
import re
import secrets

from fastapi import (
    APIRouter,
    Depends,
    File,
    Header,
    HTTPException,
    UploadFile,
    status,
)
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.booking import Booking
from app.models.booking_photo import BookingPhoto


from fastapi.responses import FileResponse

from app.core.dependencies import get_current_admin


router = APIRouter(
    prefix="/api/bookings",
    tags=["Booking Photos"],
)

UPLOAD_DIR = Path("uploads/bookings")

MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 40_000_000

ALLOWED_TYPES = {
    "JPEG": ("image/jpeg", ".jpg"),
    "PNG": ("image/png", ".png"),
    "WEBP": ("image/webp", ".webp"),
}


def safe_name(value: str) -> str:
    """Convert a client name into a safe filename component."""
    value = value.strip().replace(" ", "_")
    value = re.sub(r"[^\w-]", "", value, flags=re.UNICODE)
    value = re.sub(r"_+", "_", value)
    return value[:60] or "client"


@router.post(
    "/{booking_id}/photos",
    status_code=status.HTTP_201_CREATED,
)
async def upload_booking_photo(
    booking_id: int,
    file: UploadFile = File(..., description="Vehicle photo"),
    booking_token: str | None = Header(
        default=None,
        alias="X-Booking-Token",
    ),
    db: Session = Depends(get_db),
):
    # 1. Require the private token for this booking.
    if not booking_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Booking token is required",
        )

    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if not booking.photo_token or not secrets.compare_digest(
        booking_token,
        booking.photo_token,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid booking token",
        )

    file_path = None

    try:
        # 2. Read at most 5 MB + 1 byte.
        content = await file.read(MAX_FILE_SIZE + 1)

        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty",
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Each image must not exceed 5 MB",
            )

        # 3. Validate the actual image format, not just the filename.
        try:
            with Image.open(BytesIO(content)) as image:
                image_format = image.format

                if image_format not in ALLOWED_TYPES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Only JPEG, PNG, and WebP images are allowed",
                    )

                width, height = image.size

                if width * height > MAX_IMAGE_PIXELS:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Image dimensions are too large",
                    )

                image.verify()

        except HTTPException:
            raise
        except (
            UnidentifiedImageError,
            Image.DecompressionBombError,
            OSError,
            SyntaxError,
            ValueError,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is not a valid supported image",
            )

        expected_content_type, extension = ALLOWED_TYPES[image_format]

        # Reject a declared content type that contradicts the image.
        if file.content_type and file.content_type != expected_content_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The declared file type does not match the image",
            )

        # 4. Store the image under its booking and customer name.
        client_name = safe_name(booking.full_name)
        reservation_label = f"reservation_{booking.id}_{client_name}"

        booking_dir = UPLOAD_DIR / reservation_label
        booking_dir.mkdir(parents=True, exist_ok=True)

        unique_filename = (
            f"{reservation_label}_{uuid4().hex}{extension}"
        )

        file_path = booking_dir / unique_filename

        with file_path.open("xb") as buffer:
            buffer.write(content)

        # 5. Link the saved image to the correct booking.
        photo = BookingPhoto(
            booking_id=booking.id,
            filename=unique_filename,
            file_path=str(file_path),
        )

        db.add(photo)
        db.commit()
        db.refresh(photo)

        return {
            "message": "Photo uploaded successfully",
            "booking_id": booking.id,
            "client_name": booking.full_name,
            "photo": {
                "id": photo.id,
                "filename": photo.filename,
                "stored_as": str(file_path),
            },
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()

        if file_path is not None and file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save the uploaded photo",
        )

    finally:
        await file.close()


# =====================================================
# GET PHOTOS FOR ONE BOOKING
# ADMIN ONLY
# =====================================================

@router.get("/{booking_id}/photos")
def get_booking_photos(
    booking_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    photos = (
        db.query(BookingPhoto)
        .filter(BookingPhoto.booking_id == booking_id)
        .order_by(BookingPhoto.id.desc())
        .all()
    )

    return {
        "booking_id": booking.id,
        "client_name": booking.full_name,
        "photos": [
            {
                "id": photo.id,
                "booking_id": photo.booking_id,
                "filename": photo.filename,
                "view_url": (
                    f"/api/bookings/{booking.id}/photos/"
                    f"{photo.id}/view"
                ),
            }
            for photo in photos
        ],
    }


# =====================================================
# VIEW ONE PHOTO
# ADMIN ONLY
# =====================================================

@router.get("/{booking_id}/photos/{photo_id}/view")
def view_booking_photo(
    booking_id: int,
    photo_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    photo = (
        db.query(BookingPhoto)
        .filter(
            BookingPhoto.id == photo_id,
            BookingPhoto.booking_id == booking_id,
        )
        .first()
    )

    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found for this booking",
        )

    # Resolve the stored path relative to the backend directory.
    backend_dir = Path(__file__).resolve().parents[2]
    upload_root = (backend_dir / "uploads" / "bookings").resolve()

    stored_path = Path(photo.file_path)

    if not stored_path.is_absolute():
        stored_path = backend_dir / stored_path

    try:
        resolved_path = stored_path.resolve()
        resolved_path.relative_to(upload_root)
    except (ValueError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid photo storage path",
        )

    if not resolved_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo file not found on the server",
        )

    extension = resolved_path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }

    media_type = media_types.get(extension)

    if media_type is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported photo format",
        )

    return FileResponse(
        path=str(resolved_path),
        media_type=media_type,
        filename=photo.filename,
        content_disposition_type="inline",
    )
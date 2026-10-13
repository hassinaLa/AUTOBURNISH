from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, LoginResponse
from app.core.security import (
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    admin = (
        db.query(Admin)
        .filter(
            Admin.username == login_data.username
        )
        .first()
    )

    if admin is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )


    password_valid = verify_password(
        login_data.password,
        admin.hashed_password
    )


    if not password_valid:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )


    access_token = create_access_token(
        admin.username
    )


    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
"""
Auth router — /api/auth/*
Endpoints: register (admin company), login, forgot-password, change-password
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.security import (
    hash_password, verify_password, create_access_token, get_current_user,
)
from ..services.email_service import send_welcome_email, send_password_reset_email
from ..utils.generators import generate_temp_password, send_email_async

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ─── POST /api/auth/register ───────────────────────────────────────────────

@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register_admin(payload: schemas.AdminRegisterRequest, db: Session = Depends(get_db)):
    """Admin registers a new company + their own account. Sends a welcome email via SMTP."""
    if db.query(models.Company).filter(models.Company.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "A company account with this email already exists.")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "A user with this email already exists.")

    company = models.Company(
        name=payload.company_name, email=payload.email, location=payload.company_location,
    )
    db.add(company)
    db.flush()  # get company.id before commit

    user = models.User(
        company_id=company.id,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=models.UserRole.admin,
        must_change_password=False,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    send_email_async(send_welcome_email, user.email, user.full_name, company.name)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.TokenResponse(
        access_token=token, user=schemas.UserOut.model_validate(user), must_change_password=False,
    )

# ─── POST /api/auth/login ───────────────────────────────────────────────────

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Unified login for all roles. Returns `must_change_password` for frontend redirect."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Your account has been deactivated. Contact your administrator.")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.TokenResponse(
        access_token=token, user=schemas.UserOut.model_validate(user),
        must_change_password=user.must_change_password,
    )

# ─── POST /api/auth/forgot-password ────────────────────────────────────────

@router.post("/forgot-password", response_model=schemas.MessageResponse)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generates a temporary password and emails it. Always returns 200 to avoid email enumeration."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user:
        temp = generate_temp_password()
        user.hashed_password = hash_password(temp)
        user.must_change_password = True
        db.commit()
        send_email_async(send_password_reset_email, user.email, user.full_name, temp)

    return schemas.MessageResponse(message="If this email is registered, a temporary password has been sent.")

# ─── POST /api/auth/change-password ────────────────────────────────────────

@router.post("/change-password", response_model=schemas.MessageResponse)
def change_password(
    payload: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Authenticated endpoint: change password, clears must_change_password on success."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect.")

    current_user.hashed_password = hash_password(payload.new_password)
    current_user.must_change_password = False
    db.commit()
    return schemas.MessageResponse(message="Password changed successfully.")
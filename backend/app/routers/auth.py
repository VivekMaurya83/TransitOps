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

MAX_FAILED   = 5
LOCKOUT_MINS = 15

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Unified login for all roles.
    - Enforces account lockout after 5 consecutive failed attempts (15-min cooldown).
    - Validates that the selected role matches the user's actual role in the database.
    - Returns `must_change_password` for frontend redirect.
    """
    from datetime import datetime, timezone, timedelta

    user = db.query(models.User).filter(models.User.email == payload.email).first()

    # ── 1. Lockout Check (before password test to prevent timing attacks) ──────
    if user and user.locked_until:
        now = datetime.now(timezone.utc)
        lock_dt = user.locked_until
        if lock_dt.tzinfo is None:
            lock_dt = lock_dt.replace(tzinfo=timezone.utc)
        if now < lock_dt:
            remaining = int((lock_dt - now).total_seconds() // 60) + 1
            raise HTTPException(
                status.HTTP_423_LOCKED,
                f"Account locked due to too many failed attempts. Try again in {remaining} minute(s).",
            )
        else:
            # Lockout has expired — clear it
            user.locked_until = None
            user.failed_login_attempts = 0
            user.account_status = models.AccountStatus.active
            db.commit()

    # ── 2. Password Verification ───────────────────────────────────────────────
    password_ok = user is not None and verify_password(payload.password, user.hashed_password)

    if not password_ok:
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_FAILED:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINS)
                user.account_status = models.AccountStatus.locked
                db.commit()
                raise HTTPException(
                    status.HTTP_423_LOCKED,
                    f"Account locked after {MAX_FAILED} failed attempts. Try again in {LOCKOUT_MINS} minutes.",
                )
            db.commit()
            remaining_attempts = MAX_FAILED - user.failed_login_attempts
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                f"Invalid email or password. {remaining_attempts} attempt(s) remaining before lockout.",
            )
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    # ── 3. Account Active Check ────────────────────────────────────────────────
    if not user.is_active:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Your account has been deactivated. Contact your administrator.",
        )

    # ── 4. Role Mismatch Check ─────────────────────────────────────────────────
    if payload.role:
        ROLE_ALIAS = {
            "fleet_manager":     "fleet_manager",
            "admin":             "admin",
            "dispatcher":        "dispatcher",
            "safety_officer":    "safety_officer",
            "financial_analyst": "financial_analyst",
        }
        requested_role = ROLE_ALIAS.get(payload.role, payload.role)
        # Every user must select their exact role — no bypass for any role
        if user.role.value != requested_role:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"Access denied. Your account does not have the '{payload.role.replace('_', ' ').title()}' role.",
            )

    # ── 5. Successful Login — reset counters ───────────────────────────────────
    user.failed_login_attempts = 0
    user.locked_until = None
    user.account_status = models.AccountStatus.active
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserOut.model_validate(user),
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
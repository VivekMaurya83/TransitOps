"""
Admin router — /api/admin/*
Endpoints: invite-user, list users, update user, delete user.
All routes require role=admin.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.security import hash_password, require_admin
from ..services.email_service import send_invite_email
from ..utils.generators import generate_temp_password, send_email_async

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ─── POST /api/admin/invite-user ───────────────────────────────────────────

@router.post("/invite-user", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def invite_user(
    payload: schemas.InviteUserRequest,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin creates a new user in the same company. Emails a temp password."""
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "A user with this email already exists.")

    temp_password = generate_temp_password()
    user = models.User(
        company_id=admin.company_id,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(temp_password),
        role=payload.role,
        must_change_password=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    company = db.query(models.Company).filter(models.Company.id == admin.company_id).first()
    send_email_async(
        send_invite_email, user.email, user.full_name, admin.full_name,
        company.name if company else "your company", temp_password,
    )
    return schemas.UserOut.model_validate(user)

# ─── GET /api/admin/users ───────────────────────────────────────────────────

@router.get("/users", response_model=List[schemas.UserOut])
def list_users(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    """List all users in the admin's company."""
    users = (
        db.query(models.User)
        .filter(models.User.company_id == admin.company_id)
        .order_by(models.User.created_at.asc())
        .all()
    )
    return [schemas.UserOut.model_validate(u) for u in users]

# ─── PUT /api/admin/users/{user_id} ────────────────────────────────────────

@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: UUID,
    payload: schemas.UpdateUserRequest,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a user's name, role, or active status."""
    user = (
        db.query(models.User)
        .filter(models.User.id == user_id, models.User.company_id == admin.company_id)
        .first()
    )
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return schemas.UserOut.model_validate(user)

# ─── DELETE /api/admin/users/{user_id} ─────────────────────────────────────

@router.delete("/users/{user_id}", response_model=schemas.MessageResponse)
def delete_user(
    user_id: UUID,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Remove a user from the company (cannot remove yourself)."""
    if str(user_id) == str(admin.id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot remove your own account.")

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id, models.User.company_id == admin.company_id)
        .first()
    )
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")

    db.delete(user)
    db.commit()
    return schemas.MessageResponse(message="User removed successfully.")
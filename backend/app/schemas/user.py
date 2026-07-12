"""
User-related request/response schemas.
"""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

from ..models.user import UserRole

class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    must_change_password: bool
    is_active: bool
    company_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}

class InviteUserRequest(BaseModel):
    """Admin invites a new user to their company."""
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.dispatcher

class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
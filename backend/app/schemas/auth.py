"""
Auth-related request/response schemas.
"""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator

from .user import UserOut

class AdminRegisterRequest(BaseModel):
    """Used when an admin registers a new company."""
    company_name: str
    company_location: Optional[str] = None
    full_name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None  # RBAC hint from frontend; real role resolved from DB


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    must_change_password: bool
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

from ..models.driver import DriverStatus

class DriverCreate(BaseModel):
    full_name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: Optional[str] = None

class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[float] = None
    status: Optional[DriverStatus] = None

class DriverOut(BaseModel):
    id: UUID
    full_name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: Optional[str] = None
    safety_score: float
    status: DriverStatus
    license_expired: bool
    created_at: datetime

    model_config = {"from_attributes": True}
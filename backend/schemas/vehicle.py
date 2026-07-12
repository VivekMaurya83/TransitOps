from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, field_validator

from ..models.vehicle import VehicleType, VehicleStatus

class VehicleCreate(BaseModel):
    registration_number: str
    name: str
    type: VehicleType
    max_load_capacity: float
    odometer: float = 0
    acquisition_cost: Decimal = Decimal("0")
    region: Optional[str] = None

    @field_validator("max_load_capacity")
    @classmethod
    def capacity_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Max load capacity must be greater than 0")
        return v

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[VehicleType] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[Decimal] = None
    status: Optional[VehicleStatus] = None
    region: Optional[str] = None

class VehicleOut(BaseModel):
    id: UUID
    registration_number: str
    name: str
    type: VehicleType
    max_load_capacity: float
    odometer: float
    acquisition_cost: Decimal
    status: VehicleStatus
    region: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
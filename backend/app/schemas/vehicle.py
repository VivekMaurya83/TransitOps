from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, field_validator

from ..models.vehicle import VehicleStatus

class VehicleCreate(BaseModel):
    registration_number: str
    name: str
    vehicle_type_id: UUID
    region_id: Optional[UUID] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    manufacturing_year: Optional[int] = None
    max_load_capacity: float
    odometer: float = 0
    acquisition_cost: Decimal = Decimal("0")

    @field_validator("max_load_capacity")
    @classmethod
    def capacity_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Max load capacity must be greater than 0")
        return v

    @field_validator("odometer")
    @classmethod
    def odometer_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Odometer cannot be negative")
        return v

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    vehicle_type_id: Optional[UUID] = None
    region_id: Optional[UUID] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    manufacturing_year: Optional[int] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[Decimal] = None
    status: Optional[VehicleStatus] = None
    is_active: Optional[bool] = None

class VehicleOut(BaseModel):
    id: UUID
    registration_number: str
    name: str
    vehicle_type_id: UUID
    region_id: Optional[UUID] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    manufacturing_year: Optional[int] = None
    max_load_capacity: float
    odometer: float
    acquisition_cost: Decimal
    status: VehicleStatus
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from ..models.trip import TripStatus

class TripCreate(BaseModel):
    source: str
    destination: str
    vehicle_id: UUID
    driver_id: UUID
    cargo_weight: float
    planned_distance: float

class TripCompleteRequest(BaseModel):
    actual_distance: float
    fuel_consumed: float
    final_odometer: float

class TripOut(BaseModel):
    id: UUID
    source: str
    destination: str
    vehicle_id: UUID
    driver_id: UUID
    cargo_weight: float
    planned_distance: float
    actual_distance: Optional[float] = None
    fuel_consumed: Optional[float] = None
    status: TripStatus
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    trip_number: str
    model_config = {"from_attributes": True}
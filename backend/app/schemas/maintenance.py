from uuid import UUID
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

from ..models.maintenance import MaintenanceStatus

class MaintenanceCreate(BaseModel):
    vehicle_id: UUID
    maintenance_type: str
    description: Optional[str] = None
    cost: Decimal = Decimal("0")

class MaintenanceOut(BaseModel):
    id: UUID
    vehicle_id: UUID
    maintenance_type: str
    description: Optional[str] = None
    scheduled_date: Optional[date] = None
    start_date: Optional[date] = None
    completion_date: Optional[date] = None
    estimated_cost: Decimal
    actual_cost: Decimal
    status: MaintenanceStatus
    created_at: datetime

    model_config = {"from_attributes": True}
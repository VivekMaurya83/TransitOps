from uuid import UUID
from datetime import datetime
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
    cost: Decimal
    status: MaintenanceStatus
    opened_at: datetime
    closed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
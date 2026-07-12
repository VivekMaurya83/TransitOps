from uuid import UUID
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

from ..models.fuel_expense import ExpenseType

class FuelLogCreate(BaseModel):
    vehicle_id: UUID
    trip_id: Optional[UUID] = None
    liters: float
    cost: Decimal
    log_date: date
    odometer_reading: Optional[float] = None

class FuelLogOut(BaseModel):
    id: UUID
    vehicle_id: UUID
    trip_id: Optional[UUID] = None
    liters: float
    cost: Decimal
    log_date: date
    odometer_reading: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class ExpenseCreate(BaseModel):
    vehicle_id: Optional[UUID] = None
    trip_id: Optional[UUID] = None
    expense_type: ExpenseType
    amount: Decimal
    description: Optional[str] = None
    expense_date: date

class ExpenseOut(BaseModel):
    id: UUID
    vehicle_id: Optional[UUID] = None
    trip_id: Optional[UUID] = None
    expense_type: ExpenseType
    amount: Decimal
    description: Optional[str] = None
    expense_date: date
    created_at: datetime

    model_config = {"from_attributes": True}
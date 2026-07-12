import uuid
import enum
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Float, Numeric, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.database import Base

class ExpenseType(str, enum.Enum):
    toll = "toll"
    maintenance = "maintenance"
    parking = "parking"
    other = "other"

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=True)
    liters = Column(Float, nullable=False)
    cost = Column(Numeric(12, 2), nullable=False)
    log_date = Column(Date, nullable=False, default=date.today)
    odometer_reading = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="fuel_logs")
    trip = relationship("Trip", back_populates="fuel_logs")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=True)
    expense_type = Column(SAEnum(ExpenseType, name="expensetype"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(String(255), nullable=True)
    expense_date = Column(Date, nullable=False, default=date.today)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="expenses")
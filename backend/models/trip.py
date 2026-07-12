import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SAEnum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.database import Base

class TripStatus(str, enum.Enum):
    draft = "draft"
    dispatched = "dispatched"
    completed = "completed"
    cancelled = "cancelled"

class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    trip_number = Column(String(30), nullable=False, unique=True, index=True)
    source = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float, nullable=False)
    planned_distance = Column(Float, nullable=False)
    actual_distance = Column(Float, nullable=True)
    fuel_consumed = Column(Float, nullable=True)
    start_odometer = Column(Float, nullable=True)
    final_odometer = Column(Float, nullable=True)
    revenue = Column(Numeric(15, 2), nullable=False, default=0)
    status = Column(SAEnum(TripStatus, name="tripstatus"), nullable=False, default=TripStatus.draft)
    cancellation_reason = Column(String(255), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    dispatched_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    completed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    cancelled_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    fuel_logs = relationship("FuelLog", back_populates="trip")
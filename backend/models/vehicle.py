import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SAEnum, Numeric, Boolean, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.database import Base

class VehicleStatus(str, enum.Enum):
    available = "available"
    on_trip = "on_trip"
    in_shop = "in_shop"
    retired = "retired"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    vehicle_type_id = Column(UUID(as_uuid=True), ForeignKey("vehicle_types.id"), nullable=False)
    region_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=True)
    registration_number = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    manufacturer = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    manufacturing_year = Column(SmallInteger, nullable=True)
    max_load_capacity = Column(Float, nullable=False)
    odometer = Column(Float, nullable=False, default=0)
    acquisition_cost = Column(Numeric(15, 2), nullable=False, default=0)
    status = Column(SAEnum(VehicleStatus, name="vehiclestatus"), nullable=False, default=VehicleStatus.available)
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    company = relationship("Company", back_populates="vehicles")
    vehicle_type = relationship("VehicleTypeMaster", back_populates="vehicles")
    region = relationship("Region", back_populates="vehicles")
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")
    documents = relationship("VehicleDocument", back_populates="vehicle", cascade="all, delete-orphan")
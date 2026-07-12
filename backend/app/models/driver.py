import uuid
import enum
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Enum as SAEnum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.database import Base

class DriverStatus(str, enum.Enum):
    available = "available"
    on_trip = "on_trip"
    off_duty = "off_duty"
    suspended = "suspended"

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    region_id = Column(UUID(as_uuid=True), ForeignKey("regions.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    full_name = Column(String(255), nullable=False)
    employee_code = Column(String(40), nullable=True)
    license_number = Column(String(50), nullable=False, unique=True, index=True)
    license_category = Column(String(20), nullable=False)
    license_expiry_date = Column(Date, nullable=False)
    contact_number = Column(String(20), nullable=True)
    emergency_contact_number = Column(String(20), nullable=True)
    safety_score = Column(Float, nullable=False, default=100.0)
    status = Column(SAEnum(DriverStatus, name="driverstatus"), nullable=False, default=DriverStatus.available)
    suspension_reason = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    company = relationship("Company", back_populates="drivers")
    region = relationship("Region", back_populates="drivers")
    trips = relationship("Trip", back_populates="driver")
    documents = relationship("DriverDocument", back_populates="driver", cascade="all, delete-orphan")

    @property
    def license_expired(self) -> bool:
        return self.license_expiry_date < date.today()
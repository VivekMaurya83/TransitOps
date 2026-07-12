import uuid
import enum
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Date, Numeric, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.database import Base

class MaintenanceStatus(str, enum.Enum):
    scheduled = "scheduled"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    maintenance_type = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    scheduled_date = Column(Date, nullable=True)
    start_date = Column(Date, nullable=True)
    completion_date = Column(Date, nullable=True)
    estimated_cost = Column(Numeric(15, 2), nullable=False, default=0)
    actual_cost = Column(Numeric(15, 2), nullable=False, default=0)
    status = Column(SAEnum(MaintenanceStatus, name="maintenancestatus"), nullable=False, default=MaintenanceStatus.active)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    completed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
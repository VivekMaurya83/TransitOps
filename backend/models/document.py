import uuid
import enum
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.database import Base

class DocumentStatus(str, enum.Enum):
    valid = "valid"
    expired = "expired"
    revoked = "revoked"

class VehicleDocument(Base):
    __tablename__ = "vehicle_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    document_type = Column(String(80), nullable=False)
    document_number = Column(String(100), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    file_url = Column(String(500), nullable=False)
    status = Column(SAEnum(DocumentStatus, name="documentstatus"), default=DocumentStatus.valid)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="documents")

class DriverDocument(Base):
    __tablename__ = "driver_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("drivers.id"), nullable=False)
    document_type = Column(String(80), nullable=False)
    document_number = Column(String(100), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    file_url = Column(String(500), nullable=False)
    status = Column(SAEnum(DocumentStatus, name="documentstatus"), default=DocumentStatus.valid)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    driver = relationship("Driver", back_populates="documents")
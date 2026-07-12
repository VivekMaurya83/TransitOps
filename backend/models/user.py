import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..db.database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    fleet_manager = "fleet_manager"
    dispatcher = "dispatcher"
    safety_officer = "safety_officer"
    financial_analyst = "financial_analyst"

class AccountStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    locked = "locked"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="userrole"), nullable=False, default=UserRole.dispatcher)
    must_change_password = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    account_status = Column(SAEnum(AccountStatus, name="accountstatus"), default=AccountStatus.active)
    failed_login_attempts = Column(SmallInteger, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    company = relationship("Company", back_populates="users")
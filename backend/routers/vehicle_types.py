"""
Vehicle Types router — /api/vehicle-types
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..db.database import get_db
from .. import models
from ..core.rbac import require_roles

router = APIRouter(prefix="/api/vehicle-types", tags=["vehicle-types"])
manager_only = require_roles(models.UserRole.fleet_manager)

class VehicleTypeCreate(BaseModel):
    name: str
    description: str | None = None

class VehicleTypeOut(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    model_config = {"from_attributes": True}

@router.post("/", response_model=VehicleTypeOut, status_code=status.HTTP_201_CREATED)
def create_vehicle_type(payload: VehicleTypeCreate, current_user: models.User = Depends(manager_only), db: Session = Depends(get_db)):
    vt = models.VehicleTypeMaster(company_id=current_user.company_id, **payload.model_dump())
    db.add(vt)
    db.commit()
    db.refresh(vt)
    return vt

@router.get("/", response_model=List[VehicleTypeOut])
def list_vehicle_types(current_user: models.User = Depends(require_roles(*list(models.UserRole))), db: Session = Depends(get_db)):
    return db.query(models.VehicleTypeMaster).filter(models.VehicleTypeMaster.company_id == current_user.company_id).all()
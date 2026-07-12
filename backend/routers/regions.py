"""
Regions router — /api/regions
Simple lookup CRUD used for vehicle/driver filters.
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID

from ..db.database import get_db
from .. import models
from ..core.rbac import require_roles

router = APIRouter(prefix="/api/regions", tags=["regions"])
manager_only = require_roles(models.UserRole.fleet_manager)

class RegionCreate(BaseModel):
    name: str
    city: str | None = None
    state: str | None = None

class RegionOut(BaseModel):
    id: UUID
    name: str
    city: str | None = None
    state: str | None = None
    model_config = {"from_attributes": True}

@router.post("/", response_model=RegionOut, status_code=status.HTTP_201_CREATED)
def create_region(payload: RegionCreate, current_user: models.User = Depends(manager_only), db: Session = Depends(get_db)):
    region = models.Region(company_id=current_user.company_id, **payload.model_dump())
    db.add(region)
    db.commit()
    db.refresh(region)
    return region

@router.get("/", response_model=List[RegionOut])
def list_regions(current_user: models.User = Depends(require_roles(*list(models.UserRole))), db: Session = Depends(get_db)):
    return db.query(models.Region).filter(models.Region.company_id == current_user.company_id).all()
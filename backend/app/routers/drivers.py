"""
Driver & Safety Profiles router — /api/drivers
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.rbac import require_roles

router = APIRouter(prefix="/api/drivers", tags=["drivers"])
safety_or_manager = require_roles(models.UserRole.safety_officer, models.UserRole.fleet_manager)

@router.post("/", response_model=schemas.DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: schemas.DriverCreate,
    current_user: models.User = Depends(safety_or_manager),
    db: Session = Depends(get_db),
):
    if db.query(models.Driver).filter(models.Driver.license_number == payload.license_number).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "License number already registered.")
    driver = models.Driver(company_id=current_user.company_id, **payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.get("/", response_model=List[schemas.DriverOut])
def list_drivers(
    current_user: models.User = Depends(safety_or_manager),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Driver)
        .filter(models.Driver.company_id == current_user.company_id)
        .order_by(models.Driver.created_at.desc())
        .all()
    )

@router.get("/available", response_model=List[schemas.DriverOut])
def list_available_drivers(
    current_user: models.User = Depends(require_roles(models.UserRole.safety_officer, models.UserRole.fleet_manager, models.UserRole.dispatcher)),
    db: Session = Depends(get_db),
):
    from datetime import date
    return (
        db.query(models.Driver)
        .filter(
            models.Driver.company_id == current_user.company_id,
            models.Driver.status == models.DriverStatus.available,
            models.Driver.license_expiry_date >= date.today(),
        )
        .all()
    )

@router.put("/{driver_id}", response_model=schemas.DriverOut)
def update_driver(
    driver_id: UUID,
    payload: schemas.DriverUpdate,
    current_user: models.User = Depends(safety_or_manager),
    db: Session = Depends(get_db),
):
    driver = db.query(models.Driver).filter(
        models.Driver.id == driver_id, models.Driver.company_id == current_user.company_id
    ).first()
    if not driver:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Driver not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver
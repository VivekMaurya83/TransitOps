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

@router.post("/check-expirations")
def check_license_expirations(
    current_user: models.User = Depends(safety_or_manager),
    db: Session = Depends(get_db),
):
    from datetime import date, timedelta
    from ..services.email_service import send_license_expiry_alert
    from ..utils.generators import send_email_async

    limit_date = date.today() + timedelta(days=30)
    drivers = (
        db.query(models.Driver)
        .filter(
            models.Driver.company_id == current_user.company_id,
            models.Driver.license_expiry_date <= limit_date,
            models.Driver.is_active.is_(True)
        )
        .all()
    )

    if not drivers:
        return {"message": "No drivers with expiring or expired licenses found."}

    drivers_list = [
        {
            "name": d.full_name,
            "license_number": d.license_number,
            "expiry_date": str(d.license_expiry_date),
            "status": d.status.value
        }
        for d in drivers
    ]

    # Query active safety officers and fleet managers in the company
    managers = (
        db.query(models.User)
        .filter(
            models.User.company_id == current_user.company_id,
            models.User.is_active.is_(True),
            models.User.role.in_([models.UserRole.safety_officer, models.UserRole.fleet_manager])
        )
        .all()
    )

    if not managers:
        # Fallback to the current user if no specific roles found
        send_email_async(send_license_expiry_alert, current_user.email, drivers_list)
        return {"message": f"License expiry alert email queued for {current_user.email}", "expiring_drivers_count": len(drivers_list)}

    for m in managers:
        send_email_async(send_license_expiry_alert, m.email, drivers_list)

    emails_queued = [m.email for m in managers]
    return {
        "message": f"License expiry alert email queued for managers: {', '.join(emails_queued)}",
        "expiring_drivers_count": len(drivers_list)
    }
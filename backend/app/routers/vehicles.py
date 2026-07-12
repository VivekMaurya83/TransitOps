"""
Vehicle Registry router — /api/vehicles
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.rbac import require_roles

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])
manager_only = require_roles(models.UserRole.fleet_manager)

@router.post("/", response_model=schemas.VehicleOut, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: schemas.VehicleCreate,
    current_user: models.User = Depends(manager_only),
    db: Session = Depends(get_db),
):
    if db.query(models.Vehicle).filter(models.Vehicle.registration_number == payload.registration_number).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Registration number already exists.")
    vehicle = models.Vehicle(company_id=current_user.company_id, **payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/", response_model=List[schemas.VehicleOut])
def list_vehicles(
    status_filter: Optional[models.VehicleStatus] = Query(None, alias="status"),
    type_filter: Optional[models.VehicleType] = Query(None, alias="type"),
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    q = db.query(models.Vehicle).filter(models.Vehicle.company_id == current_user.company_id)
    if status_filter:
        q = q.filter(models.Vehicle.status == status_filter)
    if type_filter:
        q = q.filter(models.Vehicle.type == type_filter)
    return q.order_by(models.Vehicle.created_at.desc()).all()

@router.get("/available", response_model=List[schemas.VehicleOut])
def list_available_vehicles(
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    """Only vehicles eligible for dispatch — never retired or in_shop."""
    return (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.company_id == current_user.company_id,
            models.Vehicle.status == models.VehicleStatus.available,
        )
        .all()
    )

@router.put("/{vehicle_id}", response_model=schemas.VehicleOut)
def update_vehicle(
    vehicle_id: UUID,
    payload: schemas.VehicleUpdate,
    current_user: models.User = Depends(manager_only),
    db: Session = Depends(get_db),
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id, models.Vehicle.company_id == current_user.company_id
    ).first()
    if not vehicle:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", response_model=schemas.MessageResponse)
def retire_vehicle(
    vehicle_id: UUID,
    current_user: models.User = Depends(manager_only),
    db: Session = Depends(get_db),
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id, models.Vehicle.company_id == current_user.company_id
    ).first()
    if not vehicle:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle not found.")
    vehicle.status = models.VehicleStatus.retired
    db.commit()
    return schemas.MessageResponse(message="Vehicle retired successfully.")
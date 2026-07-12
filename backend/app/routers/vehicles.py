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

    vehicle_type = db.query(models.VehicleTypeMaster).filter(
        models.VehicleTypeMaster.id == payload.vehicle_type_id,
        models.VehicleTypeMaster.company_id == current_user.company_id,
    ).first()
    if not vehicle_type:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle type not found.")

    if payload.region_id:
        region = db.query(models.Region).filter(
            models.Region.id == payload.region_id,
            models.Region.company_id == current_user.company_id,
        ).first()
        if not region:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Region not found.")

    vehicle = models.Vehicle(
        company_id=current_user.company_id,
        created_by=current_user.id,
        **payload.model_dump(),
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/", response_model=List[schemas.VehicleOut])
def list_vehicles(
    status_filter: Optional[models.VehicleStatus] = Query(None, alias="status"),
    vehicle_type_id: Optional[UUID] = Query(None),
    region_id: Optional[UUID] = Query(None),
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    q = db.query(models.Vehicle).filter(models.Vehicle.company_id == current_user.company_id)

    if status_filter:
        q = q.filter(models.Vehicle.status == status_filter)
    if vehicle_type_id:
        q = q.filter(models.Vehicle.vehicle_type_id == vehicle_type_id)
    if region_id:
        q = q.filter(models.Vehicle.region_id == region_id)

    return q.order_by(models.Vehicle.created_at.desc()).all()

@router.get("/available", response_model=List[schemas.VehicleOut])
def list_available_vehicles(
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.company_id == current_user.company_id,
            models.Vehicle.status == models.VehicleStatus.available,
            models.Vehicle.is_active.is_(True),
        )
        .all()
    )

@router.get("/{vehicle_id}", response_model=schemas.VehicleOut)
def get_vehicle(
    vehicle_id: UUID,
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id,
        models.Vehicle.company_id == current_user.company_id,
    ).first()
    if not vehicle:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle not found.")
    return vehicle

@router.put("/{vehicle_id}", response_model=schemas.VehicleOut)
def update_vehicle(
    vehicle_id: UUID,
    payload: schemas.VehicleUpdate,
    current_user: models.User = Depends(manager_only),
    db: Session = Depends(get_db),
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == vehicle_id,
        models.Vehicle.company_id == current_user.company_id,
    ).first()
    if not vehicle:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle not found.")

    data = payload.model_dump(exclude_unset=True)

    if "vehicle_type_id" in data:
        vehicle_type = db.query(models.VehicleTypeMaster).filter(
            models.VehicleTypeMaster.id == data["vehicle_type_id"],
            models.VehicleTypeMaster.company_id == current_user.company_id,
        ).first()
        if not vehicle_type:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle type not found.")

    if "region_id" in data and data["region_id"] is not None:
        region = db.query(models.Region).filter(
            models.Region.id == data["region_id"],
            models.Region.company_id == current_user.company_id,
        ).first()
        if not region:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Region not found.")

    for field, value in data.items():
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
        models.Vehicle.id == vehicle_id,
        models.Vehicle.company_id == current_user.company_id,
    ).first()
    if not vehicle:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle not found.")

    vehicle.status = models.VehicleStatus.retired
    vehicle.is_active = False
    db.commit()
    return schemas.MessageResponse(message="Vehicle retired successfully.")
"""
Maintenance router — /api/maintenance
"""
from typing import List
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.rbac import require_roles
from ..services import trip_rules

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])
manager_only = require_roles(models.UserRole.fleet_manager)

@router.post("/", response_model=schemas.MaintenanceOut, status_code=status.HTTP_201_CREATED)
def open_maintenance_log(
    payload: schemas.MaintenanceCreate,
    current_user: models.User = Depends(manager_only),
    db: Session = Depends(get_db),
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == payload.vehicle_id, models.Vehicle.company_id == current_user.company_id
    ).first()
    if not vehicle:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle not found.")

    log = models.MaintenanceLog(
        company_id=current_user.company_id,
        created_by=current_user.id,
        **payload.model_dump(),
    )
    trip_rules.open_maintenance(db, vehicle)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.post("/{log_id}/close", response_model=schemas.MaintenanceOut)
def close_maintenance_log(
    log_id: UUID,
    current_user: models.User = Depends(manager_only),
    db: Session = Depends(get_db),
):
    log = db.query(models.MaintenanceLog).filter(
        models.MaintenanceLog.id == log_id, models.MaintenanceLog.company_id == current_user.company_id
    ).first()
    if not log:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Maintenance log not found.")
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == log.vehicle_id).first()

    log.status = models.MaintenanceStatus.closed
    log.closed_at = datetime.now(timezone.utc)
    trip_rules.close_maintenance(db, vehicle)
    db.commit()
    db.refresh(log)
    return log

@router.get("/", response_model=List[schemas.MaintenanceOut])
def list_maintenance_logs(
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.MaintenanceLog)
        .filter(models.MaintenanceLog.company_id == current_user.company_id)
        .order_by(models.MaintenanceLog.opened_at.desc())
        .all()
    )
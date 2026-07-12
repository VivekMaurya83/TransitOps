"""
Trip Dispatcher router — /api/trips
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.rbac import require_roles
from ..services import trip_rules
from ..utils.generators import generate_trip_number

router = APIRouter(prefix="/api/trips", tags=["trips"])
dispatcher_role = require_roles(models.UserRole.dispatcher, models.UserRole.fleet_manager)

def _get_trip_bundle(db: Session, trip_id: UUID, company_id: UUID):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.company_id == company_id).first()
    if not trip:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trip not found.")
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
    driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()
    return trip, vehicle, driver

@router.post("/", response_model=schemas.TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: schemas.TripCreate,
    current_user: models.User = Depends(dispatcher_role),
    db: Session = Depends(get_db),
):
    vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == payload.vehicle_id, models.Vehicle.company_id == current_user.company_id
    ).first()
    driver = db.query(models.Driver).filter(
        models.Driver.id == payload.driver_id, models.Driver.company_id == current_user.company_id
    ).first()
    if not vehicle or not driver:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Vehicle or driver not found.")

    trip = models.Trip(
        company_id=current_user.company_id,
        created_by=current_user.id,
        trip_number=generate_trip_number(db),
        status=models.TripStatus.draft,
        **payload.model_dump(),
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.post("/{trip_id}/dispatch", response_model=schemas.TripOut)
def dispatch_trip(
    trip_id: UUID,
    current_user: models.User = Depends(dispatcher_role),
    db: Session = Depends(get_db),
):
    trip, vehicle, driver = _get_trip_bundle(db, trip_id, current_user.company_id)
    trip_rules.dispatch_trip(db, trip, vehicle, driver, current_user.id)
    return trip

@router.post("/{trip_id}/complete", response_model=schemas.TripOut)
def complete_trip(
    trip_id: UUID,
    payload: schemas.TripCompleteRequest,
    current_user: models.User = Depends(dispatcher_role),
    db: Session = Depends(get_db),
):
    trip, vehicle, driver = _get_trip_bundle(db, trip_id, current_user.company_id)
    trip_rules.complete_trip(
        db, trip, vehicle, driver, current_user.id,
        payload.actual_distance, payload.fuel_consumed, payload.final_odometer,
    )
    return trip

@router.post("/{trip_id}/cancel", response_model=schemas.TripOut)
def cancel_trip(
    trip_id: UUID,
    current_user: models.User = Depends(dispatcher_role),
    db: Session = Depends(get_db),
):
    trip, vehicle, driver = _get_trip_bundle(db, trip_id, current_user.company_id)
    trip_rules.cancel_trip(db, trip, vehicle, driver, current_user.id)
    return trip

@router.get("/", response_model=List[schemas.TripOut])
def list_trips(
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Trip)
        .filter(models.Trip.company_id == current_user.company_id)
        .order_by(models.Trip.created_at.desc())
        .all()
    )
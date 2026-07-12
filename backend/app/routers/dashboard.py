"""
Dashboard router — /api/dashboard/*
Real-time fleet KPIs, filterable by vehicle type, status, and region.
Requires authentication.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models
from ..core.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(
    vehicle_type: Optional[models.VehicleType] = Query(None),
    region: Optional[str] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Summary KPI cards for the dashboard overview."""
    company_id = current_user.company_id

    vq = db.query(models.Vehicle).filter(models.Vehicle.company_id == company_id)
    if vehicle_type:
        vq = vq.filter(models.Vehicle.type == vehicle_type)
    if region:
        vq = vq.filter(models.Vehicle.region == region)

    active_vehicles = vq.filter(models.Vehicle.status != models.VehicleStatus.retired).count()
    available_vehicles = vq.filter(models.Vehicle.status == models.VehicleStatus.available).count()
    in_maintenance = vq.filter(models.Vehicle.status == models.VehicleStatus.in_shop).count()
    on_trip_vehicles = vq.filter(models.Vehicle.status == models.VehicleStatus.on_trip).count()

    active_trips = db.query(models.Trip).filter(
        models.Trip.company_id == company_id, models.Trip.status == models.TripStatus.dispatched
    ).count()
    pending_trips = db.query(models.Trip).filter(
        models.Trip.company_id == company_id, models.Trip.status == models.TripStatus.draft
    ).count()
    drivers_on_duty = db.query(models.Driver).filter(
        models.Driver.company_id == company_id, models.Driver.status == models.DriverStatus.on_trip
    ).count()

    fleet_utilization = round((on_trip_vehicles / active_vehicles) * 100, 1) if active_vehicles else 0.0

    return {
        "active_vehicles": active_vehicles,
        "available_vehicles": available_vehicles,
        "vehicles_in_maintenance": in_maintenance,
        "active_trips": active_trips,
        "pending_trips": pending_trips,
        "drivers_on_duty": drivers_on_duty,
        "fleet_utilization_percent": fleet_utilization,
    }

@router.get("/recent-trips")
def get_recent_trips(
    limit: int = Query(10, le=50),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Recent trips list for the dashboard table."""
    trips = (
        db.query(models.Trip)
        .filter(models.Trip.company_id == current_user.company_id)
        .order_by(models.Trip.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(t.id),
            "source": t.source,
            "destination": t.destination,
            "status": t.status.value,
            "cargo_weight": t.cargo_weight,
            "vehicle_id": str(t.vehicle_id),
            "driver_id": str(t.driver_id),
            "created_at": t.created_at,
        }
        for t in trips
    ]

@router.get("/vehicle-status-breakdown")
def get_vehicle_status_breakdown(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Counts per vehicle status — powers the availability bar chart."""
    result = {}
    for status_enum in models.VehicleStatus:
        count = db.query(models.Vehicle).filter(
            models.Vehicle.company_id == current_user.company_id,
            models.Vehicle.status == status_enum,
        ).count()
        result[status_enum.value] = count
    return result
"""
Dashboard router — /api/dashboard/*
Real-time fleet KPIs, filterable by vehicle type, status, and region.
Requires authentication.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models
from ..core.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(
    vehicle_type_id: Optional[UUID] = Query(None),
    region_id: Optional[UUID] = Query(None),
    status_filter: Optional[models.VehicleStatus] = Query(None, alias="status"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Summary KPI cards for the dashboard overview.
    Filters supported:
    - vehicle_type_id
    - region_id
    - status
    """
    company_id = current_user.company_id

    vq = db.query(models.Vehicle).filter(models.Vehicle.company_id == company_id)

    if vehicle_type_id:
        vq = vq.filter(models.Vehicle.vehicle_type_id == vehicle_type_id)

    if region_id:
        vq = vq.filter(models.Vehicle.region_id == region_id)

    if status_filter:
        vq = vq.filter(models.Vehicle.status == status_filter)

    total_vehicles = vq.count()
    available_vehicles = vq.filter(models.Vehicle.status == models.VehicleStatus.available).count()
    in_maintenance = vq.filter(models.Vehicle.status == models.VehicleStatus.in_shop).count()
    on_trip_vehicles = vq.filter(models.Vehicle.status == models.VehicleStatus.on_trip).count()
    retired_vehicles = vq.filter(models.Vehicle.status == models.VehicleStatus.retired).count()

    active_trips = db.query(models.Trip).filter(
        models.Trip.company_id == company_id,
        models.Trip.status == models.TripStatus.dispatched,
    ).count()

    pending_trips = db.query(models.Trip).filter(
        models.Trip.company_id == company_id,
        models.Trip.status == models.TripStatus.draft,
    ).count()

    completed_trips = db.query(models.Trip).filter(
        models.Trip.company_id == company_id,
        models.Trip.status == models.TripStatus.completed,
    ).count()

    drivers_on_duty = db.query(models.Driver).filter(
        models.Driver.company_id == company_id,
        models.Driver.status == models.DriverStatus.on_trip,
    ).count()

    available_drivers = db.query(models.Driver).filter(
        models.Driver.company_id == company_id,
        models.Driver.status == models.DriverStatus.available,
    ).count()

    fleet_utilization = round((on_trip_vehicles / total_vehicles) * 100, 1) if total_vehicles else 0.0

    return {
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "vehicles_in_maintenance": in_maintenance,
        "vehicles_on_trip": on_trip_vehicles,
        "retired_vehicles": retired_vehicles,
        "active_trips": active_trips,
        "pending_trips": pending_trips,
        "completed_trips": completed_trips,
        "drivers_on_duty": drivers_on_duty,
        "available_drivers": available_drivers,
        "fleet_utilization_percent": fleet_utilization,
    }

@router.get("/recent-trips")
def get_recent_trips(
    limit: int = Query(10, ge=1, le=50),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Recent trips list for dashboard table.
    """
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
            "trip_number": t.trip_number,
            "source": t.source,
            "destination": t.destination,
            "status": t.status.value,
            "cargo_weight": t.cargo_weight,
            "vehicle_id": str(t.vehicle_id) if t.vehicle_id else None,
            "driver_id": str(t.driver_id) if t.driver_id else None,
            "created_at": t.created_at,
            "dispatched_at": t.dispatched_at,
            "completed_at": t.completed_at,
        }
        for t in trips
    ]

@router.get("/vehicle-status-breakdown")
def get_vehicle_status_breakdown(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Vehicle counts grouped by operational status.
    """
    result = {}
    for status_enum in models.VehicleStatus:
        count = db.query(models.Vehicle).filter(
            models.Vehicle.company_id == current_user.company_id,
            models.Vehicle.status == status_enum,
        ).count()
        result[status_enum.value] = count
    return result

@router.get("/driver-status-breakdown")
def get_driver_status_breakdown(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Driver counts grouped by operational status.
    """
    result = {}
    for status_enum in models.DriverStatus:
        count = db.query(models.Driver).filter(
            models.Driver.company_id == current_user.company_id,
            models.Driver.status == status_enum,
        ).count()
        result[status_enum.value] = count
    return result
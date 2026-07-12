"""
Centralized business rules for trip dispatch/completion/cancellation
and maintenance lifecycle. The partial unique indexes in Postgres act
as the final safety net against race conditions; these checks give
clean error messages before hitting that constraint.
"""
from datetime import date, datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models

def validate_dispatch(vehicle: models.Vehicle, driver: models.Driver, cargo_weight: float) -> None:
    if vehicle.status in (models.VehicleStatus.retired, models.VehicleStatus.in_shop):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Vehicle is retired or in maintenance and cannot be dispatched.")
    if vehicle.status == models.VehicleStatus.on_trip:
        raise HTTPException(status.HTTP_409_CONFLICT, "Vehicle is already on another trip.")
    if driver.status == models.DriverStatus.suspended:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Driver is suspended and cannot be assigned.")
    if driver.status == models.DriverStatus.on_trip:
        raise HTTPException(status.HTTP_409_CONFLICT, "Driver is already on another trip.")
    if driver.license_expiry_date < date.today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Driver's license has expired.")
    if cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Cargo weight ({cargo_weight}kg) exceeds vehicle capacity ({vehicle.max_load_capacity}kg).",
        )

def dispatch_trip(db: Session, trip: models.Trip, vehicle: models.Vehicle, driver: models.Driver, user_id) -> None:
    validate_dispatch(vehicle, driver, trip.cargo_weight)
    trip.status = models.TripStatus.dispatched
    trip.dispatched_at = datetime.now(timezone.utc)
    trip.dispatched_by = user_id
    trip.start_odometer = vehicle.odometer
    vehicle.status = models.VehicleStatus.on_trip
    driver.status = models.DriverStatus.on_trip
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Vehicle or driver was just assigned to another trip.")

def complete_trip(db: Session, trip: models.Trip, vehicle: models.Vehicle, driver: models.Driver, user_id,
                   actual_distance: float, fuel_consumed: float, final_odometer: float) -> None:
    if trip.status != models.TripStatus.dispatched:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only dispatched trips can be completed.")
    trip.status = models.TripStatus.completed
    trip.actual_distance = actual_distance
    trip.fuel_consumed = fuel_consumed
    trip.final_odometer = final_odometer
    trip.completed_at = datetime.now(timezone.utc)
    trip.completed_by = user_id
    vehicle.odometer = final_odometer
    vehicle.status = models.VehicleStatus.available
    driver.status = models.DriverStatus.available
    db.commit()

def cancel_trip(db: Session, trip: models.Trip, vehicle: models.Vehicle, driver: models.Driver, user_id,
                 reason: str = None) -> None:
    if trip.status not in (models.TripStatus.draft, models.TripStatus.dispatched):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only draft or dispatched trips can be cancelled.")
    was_dispatched = trip.status == models.TripStatus.dispatched
    trip.status = models.TripStatus.cancelled
    trip.cancelled_at = datetime.now(timezone.utc)
    trip.cancelled_by = user_id
    trip.cancellation_reason = reason
    if was_dispatched:
        vehicle.status = models.VehicleStatus.available
        driver.status = models.DriverStatus.available
    db.commit()

def open_maintenance(db: Session, vehicle: models.Vehicle) -> None:
    if vehicle.status == models.VehicleStatus.on_trip:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot start maintenance while vehicle is on a trip.")
    vehicle.status = models.VehicleStatus.in_shop
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Vehicle already has an active maintenance record.")

def close_maintenance(db: Session, vehicle: models.Vehicle) -> None:
    if vehicle.status != models.VehicleStatus.retired:
        vehicle.status = models.VehicleStatus.available
    db.commit()
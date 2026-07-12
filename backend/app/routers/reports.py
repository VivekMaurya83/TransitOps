"""
Reports & Analytics router — /api/reports
Fuel efficiency, fleet utilization, operational cost, and vehicle ROI.
"""
import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models
from ..core.rbac import require_roles

router = APIRouter(prefix="/api/reports", tags=["reports"])
allowed = require_roles(models.UserRole.fleet_manager, models.UserRole.financial_analyst)

@router.get("/summary")
def get_summary(
    current_user: models.User = Depends(allowed),
    db: Session = Depends(get_db),
):
    company_id = current_user.company_id
    total_vehicles = db.query(models.Vehicle).filter(models.Vehicle.company_id == company_id).count()
    active_vehicles = db.query(models.Vehicle).filter(
        models.Vehicle.company_id == company_id, models.Vehicle.status != models.VehicleStatus.retired
    ).count()
    on_trip = db.query(models.Vehicle).filter(
        models.Vehicle.company_id == company_id, models.Vehicle.status == models.VehicleStatus.on_trip
    ).count()

    total_fuel_cost = db.query(func.coalesce(func.sum(models.FuelLog.cost), 0)).filter(
        models.FuelLog.company_id == company_id
    ).scalar()
    total_maintenance_cost = db.query(func.coalesce(func.sum(models.MaintenanceLog.actual_cost), 0)).filter(
        models.MaintenanceLog.company_id == company_id
    ).scalar()
    total_distance = db.query(func.coalesce(func.sum(models.Trip.actual_distance), 0)).filter(
        models.Trip.company_id == company_id, models.Trip.status == models.TripStatus.completed
    ).scalar()
    total_fuel_used = db.query(func.coalesce(func.sum(models.Trip.fuel_consumed), 0)).filter(
        models.Trip.company_id == company_id, models.Trip.status == models.TripStatus.completed
    ).scalar()

    fuel_efficiency = round(total_distance / total_fuel_used, 2) if total_fuel_used else 0
    fleet_utilization = round((on_trip / active_vehicles) * 100, 1) if active_vehicles else 0
    operational_cost = float(total_fuel_cost) + float(total_maintenance_cost)

    return {
        "total_vehicles": total_vehicles,
        "active_vehicles": active_vehicles,
        "fleet_utilization_percent": fleet_utilization,
        "fuel_efficiency_km_per_liter": fuel_efficiency,
        "operational_cost": operational_cost,
        "total_maintenance_cost": float(total_maintenance_cost),
        "total_fuel_cost": float(total_fuel_cost),
    }

@router.get("/export/vehicles.csv")
def export_vehicles_csv(
    current_user: models.User = Depends(allowed),
    db: Session = Depends(get_db),
):
    vehicles = db.query(models.Vehicle).filter(models.Vehicle.company_id == current_user.company_id).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Registration Number", "Name", "Type", "Status", "Odometer", "Acquisition Cost"])
    for v in vehicles:
        writer.writerow([
            v.registration_number, v.name,
            v.vehicle_type.name if v.vehicle_type else "",
            v.status.value, v.odometer, v.acquisition_cost,
        ])
    buffer.seek(0)
    return StreamingResponse(
        buffer, media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vehicles_report.csv"},
    )
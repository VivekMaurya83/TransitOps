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
    total_revenue = db.query(func.coalesce(func.sum(models.Trip.revenue), 0)).filter(
        models.Trip.company_id == company_id, models.Trip.status == models.TripStatus.completed
    ).scalar()
    total_acquisition_cost = db.query(func.coalesce(func.sum(models.Vehicle.acquisition_cost), 0)).filter(
        models.Vehicle.company_id == company_id
    ).scalar()

    fuel_efficiency = round(total_distance / total_fuel_used, 2) if total_fuel_used else 0
    fleet_utilization = round((on_trip / active_vehicles) * 100, 1) if active_vehicles else 0
    operational_cost = float(total_fuel_cost) + float(total_maintenance_cost)

    net_income = float(total_revenue) - operational_cost
    fleet_roi = round((net_income / float(total_acquisition_cost)) * 100, 1) if total_acquisition_cost > 0 else 0.0

    # Calculate top costliest vehicles
    vehicles_data = db.query(models.Vehicle).filter(models.Vehicle.company_id == company_id).all()
    vehicle_costs = []
    for v in vehicles_data:
        f_cost = db.query(func.coalesce(func.sum(models.FuelLog.cost), 0)).filter(models.FuelLog.vehicle_id == v.id).scalar()
        m_cost = db.query(func.coalesce(func.sum(models.MaintenanceLog.actual_cost), 0)).filter(models.MaintenanceLog.vehicle_id == v.id).scalar()
        total_v_cost = float(f_cost) + float(m_cost)
        vehicle_costs.append({
            "name": v.name or v.registration_number,
            "registration_number": v.registration_number,
            "total_cost": total_v_cost
        })
    vehicle_costs.sort(key=lambda x: x["total_cost"], reverse=True)
    top_costliest = vehicle_costs[:5]

    # Calculate monthly revenue (last 6 months)
    from datetime import datetime, timedelta, timezone
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
    completed_trips = db.query(models.Trip).filter(
        models.Trip.company_id == company_id,
        models.Trip.status == models.TripStatus.completed,
        models.Trip.completed_at >= six_months_ago
    ).all()

    monthly_rev = {}
    months_order = []
    for i in reversed(range(6)):
        m_name = (datetime.now() - timedelta(days=30*i)).strftime("%b")
        monthly_rev[m_name] = 0.0
        months_order.append(m_name)

    for t in completed_trips:
        if t.completed_at:
            m_name = t.completed_at.strftime("%b")
            if m_name in monthly_rev:
                monthly_rev[m_name] += float(t.revenue)

    monthly_revenue_data = [{"month": m, "revenue": monthly_rev[m]} for m in months_order]

    return {
        "total_vehicles": total_vehicles,
        "active_vehicles": active_vehicles,
        "fleet_utilization_percent": fleet_utilization,
        "fuel_efficiency_km_per_liter": fuel_efficiency,
        "operational_cost": operational_cost,
        "total_maintenance_cost": float(total_maintenance_cost),
        "total_fuel_cost": float(total_fuel_cost),
        "total_revenue": float(total_revenue),
        "total_acquisition_cost": float(total_acquisition_cost),
        "fleet_roi_percent": fleet_roi,
        "top_costliest_vehicles": top_costliest,
        "monthly_revenue": monthly_revenue_data,
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
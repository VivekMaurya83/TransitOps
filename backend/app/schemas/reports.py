"""
Reports & analytics response schemas.
"""
from pydantic import BaseModel

class ReportSummaryOut(BaseModel):
    total_vehicles: int
    active_vehicles: int
    fleet_utilization_percent: float
    fuel_efficiency_km_per_liter: float
    operational_cost: float
    total_maintenance_cost: float
    total_fuel_cost: float
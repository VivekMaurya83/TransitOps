"""
Re-exports all Pydantic schemas so `from .. import schemas` keeps working
exactly like your original flat schemas.py did.
"""
from .common import MessageResponse
from .auth import (
    AdminRegisterRequest, LoginRequest, ForgotPasswordRequest,
    ChangePasswordRequest, TokenResponse,
)
from .user import UserOut, InviteUserRequest, UpdateUserRequest
from .settings import SettingsOut, UpdateSettingsRequest
from .vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from .driver import DriverCreate, DriverUpdate, DriverOut
from .trip import TripCreate, TripCompleteRequest, TripOut
from .maintenance import MaintenanceCreate, MaintenanceOut
from .fuel_expense import FuelLogCreate, FuelLogOut, ExpenseCreate, ExpenseOut
from .reports import ReportSummaryOut

__all__ = [
    "MessageResponse",
    "AdminRegisterRequest", "LoginRequest", "ForgotPasswordRequest",
    "ChangePasswordRequest", "TokenResponse",
    "UserOut", "InviteUserRequest", "UpdateUserRequest",
    "SettingsOut", "UpdateSettingsRequest",
    "VehicleCreate", "VehicleUpdate", "VehicleOut",
    "DriverCreate", "DriverUpdate", "DriverOut",
    "TripCreate", "TripCompleteRequest", "TripOut",
    "MaintenanceCreate", "MaintenanceOut",
    "FuelLogCreate", "FuelLogOut", "ExpenseCreate", "ExpenseOut",
    "ReportSummaryOut",
]
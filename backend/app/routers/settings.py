"""
Settings router — /api/settings
GET and PUT user + company profile. Requires authentication.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.security import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])

def _build_settings_out(user: models.User, company: models.Company | None) -> schemas.SettingsOut:
    return schemas.SettingsOut(
        full_name=user.full_name,
        email=user.email,
        company_name=company.name if company else "",
        company_location=company.location if company else None,
        role=user.role.value,
    )

@router.get("/", response_model=schemas.SettingsOut)
def get_settings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return user and company profile data."""
    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    return _build_settings_out(current_user, company)

@router.put("/", response_model=schemas.SettingsOut)
def update_settings(
    payload: schemas.UpdateSettingsRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user full name and (admin only) company name/location."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    if current_user.role == models.UserRole.admin and company:
        if payload.company_name is not None:
            company.name = payload.company_name
        if payload.company_location is not None:
            company.location = payload.company_location

    db.commit()
    db.refresh(current_user)
    return _build_settings_out(current_user, company)
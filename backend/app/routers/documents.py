"""
Vehicle & Driver Documents router — /api/documents
"""
from typing import List
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from ..db.database import get_db
from .. import models
from ..core.rbac import require_roles

router = APIRouter(prefix="/api/documents", tags=["documents"])
manager_or_safety = require_roles(models.UserRole.fleet_manager, models.UserRole.safety_officer)

class VehicleDocumentCreate(BaseModel):
    vehicle_id: UUID
    document_type: str
    document_number: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    file_url: str

class VehicleDocumentOut(BaseModel):
    id: UUID
    vehicle_id: UUID
    document_type: str
    expiry_date: date | None = None
    status: models.DocumentStatus
    model_config = {"from_attributes": True}

class DriverDocumentCreate(BaseModel):
    driver_id: UUID
    document_type: str
    document_number: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    file_url: str

class DriverDocumentOut(BaseModel):
    id: UUID
    driver_id: UUID
    document_type: str
    expiry_date: date | None = None
    status: models.DocumentStatus
    model_config = {"from_attributes": True}

@router.post("/drivers", response_model=DriverDocumentOut, status_code=status.HTTP_201_CREATED)
def add_driver_document(
    payload: DriverDocumentCreate,
    current_user: models.User = Depends(manager_or_safety),
    db: Session = Depends(get_db),
):
    if payload.issue_date and payload.expiry_date and payload.expiry_date < payload.issue_date:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Expiry date cannot be earlier than issue date.",
        )

    driver = db.query(models.Driver).filter(
        models.Driver.id == payload.driver_id,
        models.Driver.company_id == current_user.company_id,
    ).first()
    if not driver:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Driver not found.")

    doc = models.DriverDocument(uploaded_by=current_user.id, **payload.model_dump())
    db.add(doc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Unable to create driver document due to invalid related data.",
        )

    db.refresh(doc)
    return doc

@router.get("/drivers/{driver_id}", response_model=List[DriverDocumentOut])
def list_driver_documents(
    driver_id: UUID,
    current_user: models.User = Depends(require_roles(*list(models.UserRole))),
    db: Session = Depends(get_db),
):
    driver = db.query(models.Driver).filter(
        models.Driver.id == driver_id,
        models.Driver.company_id == current_user.company_id,
    ).first()
    if not driver:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Driver not found.")

    return db.query(models.DriverDocument).filter(
        models.DriverDocument.driver_id == driver_id
    ).all()
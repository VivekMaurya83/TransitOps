"""
Vehicle & Driver Documents router — /api/documents
"""
from typing import List
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

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

@router.post("/vehicles", response_model=VehicleDocumentOut, status_code=status.HTTP_201_CREATED)
def add_vehicle_document(payload: VehicleDocumentCreate, current_user: models.User = Depends(manager_or_safety), db: Session = Depends(get_db)):
    doc = models.VehicleDocument(uploaded_by=current_user.id, **payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/vehicles/{vehicle_id}", response_model=List[VehicleDocumentOut])
def list_vehicle_documents(vehicle_id: UUID, current_user: models.User = Depends(require_roles(*list(models.UserRole))), db: Session = Depends(get_db)):
    return db.query(models.VehicleDocument).filter(models.VehicleDocument.vehicle_id == vehicle_id).all()
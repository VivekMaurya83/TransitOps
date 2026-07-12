"""
Fuel & Expense Management router — /api/fuel-expenses
"""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from .. import models, schemas
from ..core.rbac import require_roles

router = APIRouter(prefix="/api/fuel-expenses", tags=["fuel-expenses"])
finance_only = require_roles(models.UserRole.financial_analyst)

@router.post("/fuel", response_model=schemas.FuelLogOut, status_code=status.HTTP_201_CREATED)
def add_fuel_log(
    payload: schemas.FuelLogCreate,
    current_user: models.User = Depends(finance_only),
    db: Session = Depends(get_db),
):
    log = models.FuelLog(company_id=current_user.company_id, **payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/fuel", response_model=List[schemas.FuelLogOut])
def list_fuel_logs(
    current_user: models.User = Depends(finance_only),
    db: Session = Depends(get_db),
):
    return db.query(models.FuelLog).filter(models.FuelLog.company_id == current_user.company_id).all()

@router.post("/expenses", response_model=schemas.ExpenseOut, status_code=status.HTTP_201_CREATED)
def add_expense(
    payload: schemas.ExpenseCreate,
    current_user: models.User = Depends(finance_only),
    db: Session = Depends(get_db),
):
    expense = models.Expense(company_id=current_user.company_id, **payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/expenses", response_model=List[schemas.ExpenseOut])
def list_expenses(
    current_user: models.User = Depends(finance_only),
    db: Session = Depends(get_db),
):
    return db.query(models.Expense).filter(models.Expense.company_id == current_user.company_id).all()
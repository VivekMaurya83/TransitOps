"""
FastAPI application entry point.
Mounts all routers, sets up CORS, and creates DB tables on startup.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db.database import engine, Base
from .routers import (
    auth, admin, dashboard, settings,
    vehicles, drivers, trips, maintenance, fuel_expenses, reports,
)

app = FastAPI(
    title="TransitOps API",
    description="Backend API for the TransitOps Smart Transport Operations Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.on_event("startup")
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables verified/created successfully.")
    except Exception as e:
        print(f"[WARN] Could not connect to database: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(dashboard.router)
app.include_router(settings.router)
app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(maintenance.router)
app.include_router(fuel_expenses.router)
app.include_router(reports.router)

@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "TransitOps API"}
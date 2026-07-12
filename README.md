<div align="center">

# 🚛 TransitOps

### Smart Transport Operations Platform

*Run every vehicle, driver, trip, maintenance task, and operational cost from one intelligent command center.*

<br>

![Status](https://img.shields.io/badge/Status-Hackathon-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<br>

> **Built for smoother dispatches, safer fleets, clearer decisions, and happier operations teams.**

</div>

---

## ✨ What is TransitOps?

**TransitOps** is a smart transport operations platform designed to replace scattered spreadsheets, manual registers, and disconnected workflows with one unified system.

From registering a vehicle to dispatching a trip, recording fuel usage, tracking maintenance costs, verifying compliance documents, and reviewing analytics—TransitOps keeps the entire fleet lifecycle organized, secure, and visible.

It is built for logistics teams that want fewer operational surprises and more confident decisions.

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">
</div>

## 🎯 The Problem We Solve

Traditional fleet operations often struggle with:

- Vehicle and driver records spread across spreadsheets
- Double-booked vehicles or drivers
- Expired licenses and missed document renewals
- Vehicles sent on trips while under maintenance
- Unclear fuel, trip, and maintenance costs
- Limited visibility into fleet availability and performance
- Delayed reporting for operational decisions

**TransitOps transforms those pain points into structured, rule-driven workflows.**

---

## 🌟 Core Features

### 🔐 Secure Authentication & Access

- JWT-based authentication
- Secure password hashing
- Account lockout after repeated failed login attempts
- Role-aware access control
- Company-scoped data isolation
- Password reset and change-password flows

### 🚚 Fleet Management

- Create, update, and manage vehicle records
- Store registration, manufacturer, model, capacity, odometer, and acquisition details
- Track live operational status:
  - Available
  - On trip
  - In maintenance
  - Retired
- Prevent overloaded dispatches with capacity validation

### 👨‍✈️ Driver Management

- Maintain complete driver profiles
- Track license numbers, validity, availability, and safety information
- Prevent suspended or expired-license drivers from being dispatched
- Automatically update driver availability through trip lifecycle events

### 📦 Smart Trip Operations

- Create draft trips
- Dispatch only eligible vehicles and drivers
- Prevent vehicle and driver double-booking
- Validate cargo weight against vehicle capacity
- Complete trips with actual distance, fuel consumed, and final odometer
- Cancel draft or dispatched trips safely
- Track who dispatched, completed, or cancelled each trip

### 🔧 Maintenance Lifecycle

- Create scheduled or emergency maintenance records
- Automatically move vehicles into maintenance status
- Block maintenance for vehicles currently on active trips
- Prevent maintenance vehicles from being dispatched
- Restore eligible vehicles to availability after maintenance closure
- Support estimated and actual maintenance-cost capture

### ⛽ Fuel & Expense Tracking

- Record fuel activity and consumption
- Capture tolls, repairs, and other operating expenses
- Associate expenses with operational resources
- Support more accurate cost analysis across the fleet

### 📄 Compliance Documents

- Upload and manage vehicle documents
- Upload and manage driver documents
- Track document type, number, issue date, expiry date, file URL, and status
- Validate that expiry dates cannot be earlier than issue dates
- Return clean errors for missing vehicles or drivers
- Protect documents with tenant/company ownership checks

### 📊 Reports & Analytics

- Fleet availability insights
- Active-trip visibility
- Vehicle utilization monitoring
- Driver availability tracking
- Fuel and expense visibility
- Maintenance-cost insights
- Operational reports and CSV export support

---

## 🧠 Built-In Safety Rules

TransitOps does more than store data—it actively protects operations.

| Operational Risk | TransitOps Protection |
|---|---|
| Vehicle is already assigned | Blocks duplicate vehicle dispatch |
| Driver is already assigned | Blocks duplicate driver dispatch |
| Driver license has expired | Prevents dispatch |
| Driver is suspended | Prevents dispatch |
| Cargo exceeds capacity | Rejects dispatch |
| Vehicle is in maintenance | Blocks dispatch |
| Vehicle is retired | Blocks dispatch |
| Cancelled or completed trip is dispatched again | Enforced trip lifecycle validation |
| Document expiry is before issue date | Rejects invalid document |
| Unknown vehicle or driver document parent | Returns clean `404 Not Found` |
| Concurrent dispatch race condition | Database constraints provide a final safety net |

---

## 👥 Roles & Responsibilities

TransitOps uses role-based access control to keep the right actions in the right hands.

| Role | Primary Responsibility |
|---|---|
| **Admin** | Company setup, user management, settings, oversight, and administrative control |
| **Fleet Manager** | Vehicles, drivers, trip operations, and fleet-level management |
| **Dispatcher** | Day-to-day trip dispatch coordination |
| **Safety Officer** | Driver and vehicle compliance, documents, and safety workflows |
| **Financial Analyst** | Expense, fuel, maintenance-cost, and reporting visibility |

> In day-to-day operations, the **Fleet Manager** is the primary role responsible for adding and managing drivers and vehicles. Admin access can remain available as a controlled override.

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">
</div>

## 🛠️ Technology Stack

### Frontend

- **React**
- **Vite**
- **Tailwind CSS**
- **Recharts**

### Backend

- **Python**
- **FastAPI**
- **SQLAlchemy**
- **Pydantic**
- **RESTful APIs**

### Database

- **PostgreSQL**

### Security

- **JWT access tokens**
- **bcrypt password hashing**
- **Role-Based Access Control**
- **Tenant-aware data checks**
- **Account lockout protection**

---

## 🗂️ Project Structure

```text
TransitOps/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, JWT, RBAC
│   │   ├── db/             # Database configuration and SQL setup
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business rules and workflows
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   └── main.py         # FastAPI application entry point
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.*
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd TransitOps
```

### 2. Configure PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE transitops;
```

Create a `backend/.env` file:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/transitops

SECRET_KEY=replace_with_a_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. Start the backend

```bash
cd backend

python -m venv venv
source venv/bin/activate
```

For Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend services:

```text
API:        http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs
OpenAPI:    http://127.0.0.1:8000/openapi.json
```

### 4. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will display the local frontend URL.

---

## 🔌 API Highlights

| Module | Example Endpoints |
|---|---|
| Authentication | `/api/auth/register`, `/api/auth/login`, `/api/auth/change-password` |
| Vehicles | `/api/vehicles/` |
| Drivers | `/api/drivers/` |
| Trips | `/api/trips/` |
| Maintenance | `/api/maintenance/` |
| Fuel & Expenses | `/api/fuel-expenses/` |
| Documents | `/api/documents/vehicles`, `/api/documents/drivers` |
| Reports | `/api/reports/` |
| Dashboard | `/api/dashboard/` |
| Settings | `/api/settings/` |

Explore the complete live API contract from **Swagger UI**:

```text
http://127.0.0.1:8000/docs
```

---

## 🧪 Example Login Request

```bash
curl -s -X POST "http://127.0.0.1:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@transitops.com",
    "password": "Admin@12345",
    "role": "admin"
  }'
```

Store the returned JWT access token:

```bash
export ADMIN_TOKEN="YOUR_ACCESS_TOKEN"
```

Test an authenticated endpoint:

```bash
curl -s -X GET "http://127.0.0.1:8000/api/vehicles/" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

> Never commit real passwords, JWTs, database credentials, or `.env` files to GitHub.

---

## ✅ Quality Checks Completed

TransitOps has been validated across key operational workflows:

- Authentication and JWT-protected routes
- Vehicle create and update workflows
- Driver create and update workflows
- Trip dispatch, completion, and cancellation behavior
- Vehicle/driver availability synchronization
- Vehicle capacity checks
- License-expiry and suspension checks
- Maintenance lifecycle validation
- Fuel and expense flows
- Reports and CSV export flows
- Vehicle document creation and listing
- Driver document creation and listing
- Invalid document-date rejection
- Missing parent-resource handling
- Multi-tenant ownership checks for documents

---

## 📸 Screenshots

![Dashboard](image.png)

![Fleet Management](image-3.png)

![Driver Management](image-4.png)

![Trip Management](image-5.png)

![Maintenance](image-8.png)

![Fuel Expenses](image-6.png)
![Analytics](image-7.png)

---

## 🌍 Who Is It For?

TransitOps is designed for:

- Logistics companies
- Fleet operators
- Courier and delivery services
- Warehouses and distribution centers
- Manufacturing businesses
- Enterprise transportation departments
- Growing businesses moving beyond spreadsheet-based fleet operations

Whether a company operates five vehicles or five hundred, TransitOps provides a clean foundation for safer, smarter, and more visible fleet operations.

<div align="center">
<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%">
</div>




## 🤝 Team

Built with care by the **TransitOps Team** during a hackathon.

Every module is designed around one simple idea:

> **Transport operations should feel controlled, connected, and confidently managed.**

---

<div align="center">

### 🚛 Keep Moving Smarter with TransitOps

Made with Python, FastAPI, React, PostgreSQL, teamwork, and a lot of operational thinking.

⭐ If you like TransitOps, consider giving this repository a star!

</div>
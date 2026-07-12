from __future__ import annotations

from app.db.database import SessionLocal
from app.models import Company, User, UserRole
from app.core.security import hash_password


SEED_COMPANY = {
    "name": "TransitOps Logistics Pvt Ltd",
    "email": "admin@transitops.com",
    "location": "Mumbai, Maharashtra",
}

SEED_USERS = [
    {
        "email": "admin@transitops.com",
        "full_name": "TransitOps Admin",
        "password": "Admin@12345",
        "role": UserRole.admin,
        "must_change_password": False,
        "is_active": True,
    },
    {
        "email": "fleet@transitops.com",
        "full_name": "Fleet Manager",
        "password": "Fleet@12345",
        "role": UserRole.fleet_manager,
        "must_change_password": False,
        "is_active": True,
    },
    {
        "email": "dispatcher@transitops.com",
        "full_name": "Dispatcher User",
        "password": "Dispatch@12345",
        "role": UserRole.dispatcher,
        "must_change_password": False,
        "is_active": True,
    },
    {
        "email": "safety@transitops.com",
        "full_name": "Safety Officer",
        "password": "Safety@12345",
        "role": UserRole.safety_officer,
        "must_change_password": True,
        "is_active": True,
    },
    {
        "email": "finance@transitops.com",
        "full_name": "Financial Analyst",
        "password": "Finance@12345",
        "role": UserRole.financial_analyst,
        "must_change_password": False,
        "is_active": True,
    },
    {
        "email": "inactive.dispatcher@transitops.com",
        "full_name": "Inactive Dispatcher",
        "password": "Dispatch@12345",
        "role": UserRole.dispatcher,
        "must_change_password": False,
        "is_active": False,
    },
]


def get_or_create_company(db) -> Company:
    company = db.query(Company).filter(Company.email == SEED_COMPANY["email"]).first()
    if company:
        return company

    company = Company(
        name=SEED_COMPANY["name"],
        email=SEED_COMPANY["email"],
        location=SEED_COMPANY["location"],
    )
    db.add(company)
    db.flush()
    return company


def upsert_user(db, company: Company, payload: dict) -> tuple[User, bool]:
    user = db.query(User).filter(User.email == payload["email"]).first()
    hashed = hash_password(payload["password"])

    if user:
        changed = False

        if user.company_id != company.id:
            user.company_id = company.id
            changed = True
        if user.full_name != payload["full_name"]:
            user.full_name = payload["full_name"]
            changed = True
        if user.role != payload["role"]:
            user.role = payload["role"]
            changed = True
        if user.must_change_password != payload["must_change_password"]:
            user.must_change_password = payload["must_change_password"]
            changed = True
        if user.is_active != payload["is_active"]:
            user.is_active = payload["is_active"]
            changed = True

        user.hashed_password = hashed
        return user, changed

    user = User(
        company_id=company.id,
        email=payload["email"],
        full_name=payload["full_name"],
        hashed_password=hashed,
        role=payload["role"],
        must_change_password=payload["must_change_password"],
        is_active=payload["is_active"],
    )
    db.add(user)
    return user, True


def main():
    db = SessionLocal()
    try:
        company = get_or_create_company(db)

        created_or_updated = 0
        for payload in SEED_USERS:
            _, changed = upsert_user(db, company, payload)
            if changed:
                created_or_updated += 1

        db.commit()

        print("Seed completed successfully.")
        print(f"Company: {company.name} ({company.email})")
        print(f"Users processed: {len(SEED_USERS)}")
        print(f"Created/updated: {created_or_updated}")
        print("\nLogin credentials:")
        for u in SEED_USERS:
            print(
                f"- {u['email']} | password={u['password']} | "
                f"role={u['role'].value} | active={u['is_active']} | "
                f"must_change_password={u['must_change_password']}"
            )

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
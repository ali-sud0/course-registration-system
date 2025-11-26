# app/scripts/init_admin.py
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.db import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.token_metadata import TokenMetadata
from app.core.security import hash_password


def gen_uuid():
    return str(uuid.uuid4())


def init_admin():
    # create tables if not exist
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # check if any admin exists
        admin_exists = db.query(User).filter(User.role == UserRole.Admin).first()
        if admin_exists:
            print(f"Admin already exists: user_number={admin_exists.user_number}")
            return

        # create default admin
        admin_user = User(
            id=gen_uuid(),
            role=UserRole.Admin,
            user_number="admin",
            first_name="Super",
            last_name="Admin",
            password_hash=hash_password("admin"),
            national_number="0000000000",
            phone_number="0000000000",
            is_suspended=False
        )

        db.add(admin_user)
        db.commit()
        print("Default admin created with user_number='admin' and password='admin'")

    finally:
        db.close()


if __name__ == "__main__":
    init_admin()

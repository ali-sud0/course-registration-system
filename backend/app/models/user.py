# app/models/user.py
from sqlalchemy import Column, String, Boolean, Enum
from app.db import Base
import uuid
import enum

class UserRole(enum.Enum):
    Professor = "Professor"
    Student = "Student"
    Admin = "Admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=uuid.uuid4())
    role = Column(Enum(UserRole), nullable=False)

    user_number = Column(String(20), nullable=False, unique=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)

    password_hash = Column(String(255), nullable=False)

    national_number = Column(String(10), nullable=False)
    phone_number = Column(String(20), nullable=False)

    # binary in MySQL ≈ Boolean in SQLAlchemy
    is_suspended = Column(Boolean, nullable=False, default=False)

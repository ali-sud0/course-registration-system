# app/models/semester.py

from sqlalchemy import Column, String, SmallInteger, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.db import Base


class Semester(Base):
    __tablename__ = "semesters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(20), unique=True, nullable=False)  # e.g., 1404-1
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    min_units = Column(SmallInteger, nullable=True)
    max_units = Column(SmallInteger, nullable=True)

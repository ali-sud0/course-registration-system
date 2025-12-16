# app/models/course.py
from sqlalchemy import Column, String, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.db import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    course_code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    professor = Column(String(100), nullable=True, default=None)
    units = Column(SmallInteger, nullable=False)
    grp = Column(SmallInteger, nullable=True, default=0)
    capacity = Column(SmallInteger, nullable=True, default=0)
    
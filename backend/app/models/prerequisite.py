# app/models/prerequisite.py
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.db import Base

class Prerequisite(Base):
    __tablename__ = "prerequisites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    prerequisite_course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)

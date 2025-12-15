#app/models/course_offering.py

from sqlalchemy import Column, String, SmallInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.db import Base


class CourseOffering(Base):
    __tablename__ = "course_offerings"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id"),
        nullable=False
    )

    professor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    semester_id = Column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id"),
        nullable=False
    )

    capacity = Column(SmallInteger)
    classroom = Column(String(20))
    exam_date = Column(DateTime)

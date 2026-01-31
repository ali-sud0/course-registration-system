import enum
import uuid

from sqlalchemy import Column, ForeignKey, Enum
from sqlalchemy.dialects.postgresql.base import UUID

from app.core.db import Base


class EnrollmentStatus(enum.Enum):
    enrolled = "enrolled"
    dropped = "dropped"
    passed = "passed"
    failed = "failed"


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    offering_id = Column(
        UUID(as_uuid=True),
        ForeignKey("course_offerings.id"),
        nullable=False
    )

    status = Column(
        Enum(EnrollmentStatus),
        nullable=False,
        default=EnrollmentStatus.enrolled
    )

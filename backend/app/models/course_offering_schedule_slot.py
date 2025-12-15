from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.db import Base


class CourseOfferingScheduleSlot(Base):
    __tablename__ = "course_offering_schedule_slots"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    course_offering_id = Column(
        UUID(as_uuid=True),
        ForeignKey("course_offerings.id"),
        nullable=False
    )

    schedule_slot_id = Column(
        UUID(as_uuid=True),
        ForeignKey("schedule_slots.id"),
        nullable=False
    )

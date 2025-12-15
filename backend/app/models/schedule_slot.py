#app/models/schedule_slot.py

from sqlalchemy import Column, String, Time
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.db import Base


class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    # Example values: "sat", "sun", "mon", ...
    day_of_week = Column(String(10), nullable=False)

    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

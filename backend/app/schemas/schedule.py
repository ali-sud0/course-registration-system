# app/schemas/schedule.py

from datetime import time
from uuid import UUID

from pydantic import BaseModel


class ScheduleSlotItem(BaseModel):
    """One time slot in the weekly schedule for a visual timetable."""
    day_of_week: str
    start_time: time
    end_time: time
    course_name: str
    classroom: str | None
    offering_id: UUID
    enrollment_id: UUID

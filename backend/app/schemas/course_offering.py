# app/schemas/course_offering.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class CourseOfferingBase(BaseModel):
    course_id: UUID
    professor_id: UUID
    semester_id: UUID
    capacity: int | None = None
    classroom: str | None = None
    exam_date: datetime | None = None


class CourseOfferingCreate(CourseOfferingBase):
    slot_ids: list[UUID]

class CourseOfferingUpdate(BaseModel):
    professor_id: UUID | None = None
    capacity: int | None = None
    classroom: str | None = None
    exam_date: datetime | None = None
    slot_ids: list[UUID] | None = None


class CourseOfferingOut(CourseOfferingBase):
    id: UUID
    group_number: int  # auto-generated, immutable
    slot_ids: list[UUID] = []
    course_name: str = ""
    professor_name: str = ""

    class Config:
        from_attributes = True


class CourseOfferingForStudent(CourseOfferingOut):
    """Extended schema for student view with course/professor names for display."""
    course_name: str = ""
    professor_name: str = ""

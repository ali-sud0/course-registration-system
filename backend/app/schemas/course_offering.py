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
    pass


class CourseOfferingUpdate(BaseModel):
    course_id: UUID | None = None
    professor_id: UUID | None = None
    semester_id: UUID | None = None
    capacity: int | None = None
    classroom: str | None = None
    exam_date: datetime | None = None


class CourseOfferingOut(CourseOfferingBase):
    id: UUID

    class Config:
        from_attributes = True

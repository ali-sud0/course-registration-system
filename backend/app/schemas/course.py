# app/schemas/course.py
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class CourseBase(BaseModel):
    course_code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=100)
    professor: Optional[str] = Field(None, max_length=100)
    units: int = 0
    capacity: int = 0
    grp: int = 0


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    course_code: str | None = None
    name: str | None = Field(None, max_length=100)
    professor: Optional[str] | None = Field(None, max_length=100)
    units: int | None = None
    capacity: int | None = None
    grp: int | None = None


class CourseOut(CourseBase):
    id: UUID

    class Config:
        from_attributes = True

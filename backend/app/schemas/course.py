# app/schemas/course.py
from pydantic import BaseModel, Field
from uuid import UUID


class CourseBase(BaseModel):
    course_code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=100)
    units: int


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    course_code: str | None = None
    name: str | None = Field(None, max_length=100)
    units: int | None = None


class CourseOut(CourseBase):
    id: UUID

    class Config:
        from_attributes = True  # replaces orm_mode=True

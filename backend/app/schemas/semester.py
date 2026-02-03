from pydantic import BaseModel
from uuid import UUID
from datetime import date

# Base schema used for creating a semester
class SemesterBase(BaseModel):
    name: str
    start_date: date | None = None
    end_date: date | None = None
    min_units: int | None = None
    max_units: int | None = None
    is_active: bool = False

# Schema for creating a semester
class SemesterCreate(SemesterBase):
    pass

# Schema for updating a semester
class SemesterUpdate(BaseModel):
    name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    min_units: int | None = None
    max_units: int | None = None
    is_active: bool | None = None

# Schema for returning semester info
class SemesterOut(SemesterBase):
    id: UUID

    class Config:
        orm_mode = True

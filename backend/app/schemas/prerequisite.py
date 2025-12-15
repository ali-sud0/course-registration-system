# app/schemas/prerequisite.py

from pydantic import BaseModel
from uuid import UUID

# Base schema with shared fields
class PrerequisiteBase(BaseModel):
    course_id: UUID
    prerequisite_course_id: UUID

# Used for creation
class PrerequisiteCreate(PrerequisiteBase):
    pass

# Used for updates (fields optional)
class PrerequisiteUpdate(BaseModel):
    course_id: UUID | None = None
    prerequisite_course_id: UUID | None = None

# Used for response
class PrerequisiteOut(PrerequisiteBase):
    id: UUID

    class Config:
        from_attributes = True

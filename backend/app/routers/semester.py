from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.semester import Semester
from app.schemas.semester import SemesterCreate, SemesterUpdate, SemesterOut
from app.core.db import get_db
from app.dependencies import require_role  # assuming you have role-based access

router = APIRouter(
    prefix="/semesters",
    tags=["semesters"]
)

# Update semester
@router.put("/{semester_id}", response_model=SemesterOut, dependencies=[Depends(require_role("Admin"))])
def update_semester(semester_id: UUID, data: SemesterUpdate, db: Session = Depends(get_db)):
    semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    # Update only provided fields
    if data.name is not None:
        semester.name = data.name
    if data.start_date is not None:
        semester.start_date = data.start_date
    if data.end_date is not None:
        semester.end_date = data.end_date
    if data.min_units is not None:
        semester.min_units = data.min_units
    if data.max_units is not None:
        semester.max_units = data.max_units

    db.commit()
    db.refresh(semester)
    return semester

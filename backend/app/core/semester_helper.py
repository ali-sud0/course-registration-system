# app/core/semester_helper.py
"""Helper to get the active (current) semester."""

from sqlalchemy.orm import Session

from app.models.semester import Semester


def get_active_semester(db: Session) -> Semester | None:
    """Return the semester marked as active (current term), or None."""
    return db.query(Semester).filter(Semester.is_active == True).first()

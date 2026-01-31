from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enrollment import Enrollment, EnrollmentStatus


def check_duplicate_enrollment(
    db: Session,
    student_id: UUID,
    offering_id: UUID,
):
    existing = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.offering_id == offering_id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

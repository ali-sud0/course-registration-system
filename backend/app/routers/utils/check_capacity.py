from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.course_offering import CourseOffering
from app.models.enrollment import Enrollment, EnrollmentStatus


def check_capacity(db: Session, offering: CourseOffering):
    if offering.capacity is None:
        return  # unlimited capacity

    enrolled_count = (
        db.query(Enrollment)
        .filter(
            Enrollment.offering_id == offering.id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .count()
    )

    if enrolled_count >= offering.capacity:
        raise HTTPException(status_code=400, detail="Course capacity is full")

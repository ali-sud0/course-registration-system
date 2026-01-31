from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.semester import Semester


def check_unit_limit(
    db: Session,
    student_id: UUID,
    semester: Semester,
):
    current_units = (
        db.query(Course.units)
        .join(CourseOffering)
        .join(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.status == EnrollmentStatus.enrolled,
            CourseOffering.semester_id == semester.id,
        )
        .scalar()
    ) or 0

    if semester.max_units is not None and current_units > semester.max_units:
        raise HTTPException(
            status_code=400,
            detail="Maximum unit limit exceeded",
        )

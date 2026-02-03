from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.semester import Semester


def check_unit_limit(
    db: Session,
    student_id: UUID,
    semester: Semester,
    new_offering: CourseOffering,
):
    """Check that enrolling in new_offering would not exceed max_units."""
    current_units = (
        db.query(func.coalesce(func.sum(Course.units), 0))
        .select_from(Enrollment)
        .join(CourseOffering, CourseOffering.id == Enrollment.offering_id)
        .join(Course, Course.id == CourseOffering.course_id)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.status == EnrollmentStatus.enrolled,
            CourseOffering.semester_id == semester.id,
        )
        .scalar()
    ) or 0

    new_course = db.query(Course).filter(Course.id == new_offering.course_id).first()
    new_units = new_course.units if new_course else 0
    total_after_enroll = current_units + new_units

    if semester.max_units is not None and total_after_enroll > semester.max_units:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum unit limit exceeded (max: {semester.max_units}, would have: {total_after_enroll})",
        )

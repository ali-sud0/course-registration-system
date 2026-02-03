from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.course_offering import CourseOffering
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.prerequisite import Prerequisite


def check_prerequisites(
    db: Session,
    student_id: UUID,
    course_id: UUID,
):
    prerequisites = (
        db.query(Prerequisite)
        .filter(Prerequisite.course_id == course_id)
        .all()
    )

    for prereq in prerequisites:
        passed = (
            db.query(Enrollment)
            .join(CourseOffering)
            .filter(
                Enrollment.student_id == student_id,
                CourseOffering.course_id == prereq.prerequisite_course_id,
                Enrollment.status == EnrollmentStatus.passed,
            )
            .first()
        )

        if not passed:
            raise HTTPException(
                status_code=400,
                detail="Prerequisite course not passed",
            )

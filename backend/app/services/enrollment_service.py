# app/services/enrollment_service.py
"""Enrollment business logic - kept separate from API layer."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.semester import Semester
from app.core.semester_helper import get_active_semester
from app.routers.utils.check_capacity import check_capacity
from app.routers.utils.check_duplicate_enrollment import check_duplicate_enrollment
from app.routers.utils.check_prerequisites import check_prerequisites
from app.routers.utils.check_time_conflict import check_time_conflict
from app.routers.utils.check_unit_limit import check_unit_limit


def enroll_student(db: Session, student_id: UUID, offering_id: UUID) -> Enrollment:
    """Enroll a student in a course offering. Raises HTTPException on validation failure."""
    offering = db.query(CourseOffering).filter(CourseOffering.id == offering_id).first()
    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    semester = db.query(Semester).filter(Semester.id == offering.semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    check_duplicate_enrollment(db, student_id, offering_id)
    check_capacity(db, offering)
    check_prerequisites(db, student_id, offering.course_id)
    check_time_conflict(db, student_id, offering_id)
    check_unit_limit(db, student_id, semester, offering)

    enrollment = Enrollment(
        student_id=student_id,
        offering_id=offering_id,
        status=EnrollmentStatus.enrolled,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def drop_course(db: Session, student_id: UUID, enrollment_id: UUID) -> None:
    """Drop a course for a student. Raises HTTPException on validation failure."""
    enrollment = (
        db.query(Enrollment)
        .join(CourseOffering, CourseOffering.id == Enrollment.offering_id)
        .filter(
            Enrollment.id == enrollment_id,
            Enrollment.student_id == student_id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    offering = db.query(CourseOffering).filter(CourseOffering.id == enrollment.offering_id).first()
    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    active_semester = get_active_semester(db)
    if not active_semester or offering.semester_id != active_semester.id:
        raise HTTPException(
            status_code=400,
            detail="Can only drop courses from the current term",
        )

    if active_semester.min_units is not None:
        remaining_units = (
            db.query(func.coalesce(func.sum(Course.units), 0))
            .select_from(Enrollment)
            .join(CourseOffering, CourseOffering.id == Enrollment.offering_id)
            .join(Course, Course.id == CourseOffering.course_id)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.status == EnrollmentStatus.enrolled,
                Enrollment.id != enrollment_id,
                CourseOffering.semester_id == active_semester.id,
            )
            .scalar()
        ) or 0
        if remaining_units > 0 and remaining_units < active_semester.min_units:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot drop: would fall below minimum units (min: {active_semester.min_units}, would have: {remaining_units})",
            )

    enrollment.status = EnrollmentStatus.dropped
    db.commit()


def professor_remove_student(db: Session, professor_id: UUID, enrollment_id: UUID) -> None:
    """Remove a student from a course (by professor). Raises HTTPException on validation failure."""
    enrollment = (
        db.query(Enrollment)
        .join(CourseOffering, CourseOffering.id == Enrollment.offering_id)
        .filter(
            Enrollment.id == enrollment_id,
            CourseOffering.professor_id == professor_id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    offering = db.query(CourseOffering).filter(CourseOffering.id == enrollment.offering_id).first()
    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    active_semester = get_active_semester(db)
    if not active_semester or offering.semester_id != active_semester.id:
        raise HTTPException(
            status_code=400,
            detail="Can only remove students from courses in the current term",
        )

    enrollment.status = EnrollmentStatus.dropped
    db.commit()

# app/routers/enrollment.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.db import get_db
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.schedule_slot import ScheduleSlot
from app.models.user import User, UserRole
from app.dependencies import get_current_user, require_role
from app.schemas.schedule import ScheduleSlotItem
from app.services.enrollment_service import (
    enroll_student,
    drop_course as service_drop_course,
    professor_remove_student as service_professor_remove_student,
)

router = APIRouter(
    prefix="/enrollments",
    tags=["enrollments"],
)


@router.post("/", dependencies=[Depends(require_role(UserRole.Student.name))])
def enroll_in_course(
    offering_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return enroll_student(db, current_user.id, offering_id)


@router.delete("/{enrollment_id}", dependencies=[Depends(require_role("Student"))])
def drop_course(
    enrollment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service_drop_course(db, current_user.id, enrollment_id)
    return {"message": "Course dropped successfully"}


@router.get("/me", dependencies=[Depends(require_role("Student"))])
def my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .all()
    )


@router.get(
    "/me/schedule",
    response_model=list[ScheduleSlotItem],
    dependencies=[Depends(require_role("Student"))],
)
def my_weekly_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return weekly schedule (structured for visual timetable) of enrolled courses."""
    enrollments = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .all()
    )
    result = []
    for enr in enrollments:
        offering = db.query(CourseOffering).filter(CourseOffering.id == enr.offering_id).first()
        if not offering:
            continue
        course = db.query(Course).filter(Course.id == offering.course_id).first()
        course_name = course.name if course else ""
        slots = (
            db.query(ScheduleSlot)
            .join(CourseOfferingScheduleSlot)
            .filter(CourseOfferingScheduleSlot.course_offering_id == offering.id)
            .all()
        )
        for slot in slots:
            result.append(
                ScheduleSlotItem(
                    day_of_week=slot.day_of_week,
                    start_time=slot.start_time,
                    end_time=slot.end_time,
                    course_name=course_name,
                    classroom=offering.classroom,
                    offering_id=offering.id,
                    enrollment_id=enr.id,
                )
            )
    return result



@router.delete(
    "/{enrollment_id}/by-professor",
    dependencies=[Depends(require_role("Professor"))],
)
def professor_remove_student(
    enrollment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service_professor_remove_student(db, current_user.id, enrollment_id)
    return {"message": "Student removed from course"}


@router.get("/", dependencies=[Depends(require_role("Admin"))])
def list_all_enrollments(db: Session = Depends(get_db)):
    return db.query(Enrollment).all()


@router.patch("/{enrollment_id}", dependencies=[Depends(require_role("Admin"))])
def update_enrollment_status(
    enrollment_id: UUID,
    status: EnrollmentStatus,
    db: Session = Depends(get_db),
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.status = status
    db.commit()
    db.refresh(enrollment)
    return enrollment
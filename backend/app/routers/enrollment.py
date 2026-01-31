# app/routers/enrollment.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.db import get_db
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.course_offering import CourseOffering
from app.models.user import User, UserRole
from app.dependencies import get_current_user, require_role
from app.routers.utils.check_capacity import check_capacity
from app.routers.utils.check_duplicate_enrollment import check_duplicate_enrollment
from app.routers.utils.check_prerequisites import check_prerequisites
from app.routers.utils.check_time_conflict import check_time_conflict
from app.routers.utils.check_unit_limit import check_unit_limit

router = APIRouter(
    prefix="/enrollments",
    tags=["enrollments"],
)

# @router.post("/", dependencies=[Depends(require_role(UserRole.Student.name))])
# def enroll_in_course(
#     offering_id: UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     # check offering exists
#     offering = db.query(CourseOffering).filter(CourseOffering.id == offering_id).first()
#     if not offering:
#         raise HTTPException(status_code=404, detail="Course offering not found")
#
#     # check duplicate enrollment
#     existing = (
#         db.query(Enrollment)
#         .filter(
#             Enrollment.student_id == current_user.id,
#             Enrollment.offering_id == offering_id,
#             Enrollment.status == EnrollmentStatus.enrolled,
#         )
#         .first()
#     )
#     if existing:
#         raise HTTPException(status_code=400, detail="Already enrolled in this course")
#
#     enrollment = Enrollment(
#         student_id=current_user.id,
#         offering_id=offering_id,
#         status=EnrollmentStatus.enrolled,
#     )
#
#     db.add(enrollment)
#     db.commit()
#     db.refresh(enrollment)
#     return enrollment

@router.post("/", dependencies=[Depends(require_role(UserRole.Student.name))])
def enroll_in_course(
    offering_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offering = db.query(CourseOffering).filter(CourseOffering.id == offering_id).first()
    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    check_duplicate_enrollment(db, current_user.id, offering_id)
    check_capacity(db, offering)
    check_prerequisites(db, current_user.id, offering.course_id)
    check_time_conflict(db, current_user.id, offering_id)
    check_unit_limit(db, current_user.id, offering.semester)

    enrollment = Enrollment(
        student_id=current_user.id,
        offering_id=offering_id,
        status=EnrollmentStatus.enrolled,
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.delete("/{enrollment_id}", dependencies=[Depends(require_role("Student"))])
def drop_course(
    enrollment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.id == enrollment_id,
            Enrollment.student_id == current_user.id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.status = EnrollmentStatus.dropped
    db.commit()

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



@router.delete(
    "/{enrollment_id}/by-professor",
    dependencies=[Depends(require_role("Professor"))],
)
def professor_remove_student(
    enrollment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enrollment = (
        db.query(Enrollment)
        .join(CourseOffering)
        .filter(
            Enrollment.id == enrollment_id,
            CourseOffering.professor_id == current_user.id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.status = EnrollmentStatus.dropped
    db.commit()

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
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.schedule_slot import ScheduleSlot

# def check_time_conflict(
#     db: Session,
#     student_id: UUID,
#     offering_id: UUID,
# ):
#     # slots of the new offering
#     new_slots = (
#         db.query(ScheduleSlot)
#         .join(CourseOfferingScheduleSlot)
#         .filter(CourseOfferingScheduleSlot.course_offering_id == offering_id)
#         .all()
#     )
#
#     # slots of student's current enrollments
#     existing_slots = (
#         db.query(ScheduleSlot)
#         .join(CourseOfferingScheduleSlot)
#         .join(CourseOffering)
#         .join(Enrollment)
#         .filter(
#             Enrollment.student_id == student_id,
#             Enrollment.status == EnrollmentStatus.enrolled,
#         )
#         .all()
#     )
#
#     for new in new_slots:
#         for existing in existing_slots:
#             if new.day_of_week == existing.day_of_week:
#                 if not (
#                     new.end_time <= existing.start_time
#                     or new.start_time >= existing.end_time
#                 ):
#                     raise HTTPException(
#                         status_code=400,
#                         detail="Schedule time conflict detected",
#                     )


def check_time_conflict(
    db: Session,
    student_id: UUID,
    offering_id: UUID,
):
    # slot IDs of the new offering
    new_slot_ids = (
        db.query(CourseOfferingScheduleSlot.schedule_slot_id)
        .filter(CourseOfferingScheduleSlot.course_offering_id == offering_id)
        .subquery()
    )

    # check if student already has any enrolled offering using same slots
    conflict = (
        db.query(Enrollment)
        .join(CourseOffering)
        .join(CourseOfferingScheduleSlot)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.status == EnrollmentStatus.enrolled,
            CourseOfferingScheduleSlot.schedule_slot_id.in_(new_slot_ids),
        )
        .first()
    )

    if conflict:
        raise HTTPException(
            status_code=400,
            detail="Schedule time conflict detected",
        )

# app/routers/course_offering.py
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.semester_helper import get_active_semester
from app.dependencies import require_role, get_current_user
from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.schedule_slot import ScheduleSlot
from app.models.semester import Semester
from app.models.user import User, UserRole
from app.schemas.course_offering import (
    CourseOfferingCreate,
    CourseOfferingUpdate,
    CourseOfferingOut,
    CourseOfferingForStudent,
)


router = APIRouter(
    prefix="/course-offerings",
    tags=["course-offerings"],
)


@router.post(
    "/",
    response_model=CourseOfferingOut,
    dependencies=[Depends(require_role("Admin"))],
)
def create_course_offering(
    data: CourseOfferingCreate,
    db: Session = Depends(get_db),
):
    # 1️⃣ Validate foreign keys

    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    professor = (
        db.query(User)
        .filter(
            User.id == data.professor_id,
            User.role == UserRole.Professor,
        )
        .first()
    )
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    semester = db.query(Semester).filter(Semester.id == data.semester_id).first()
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    # 2️⃣ Validate schedule slots

    slots = (
        db.query(ScheduleSlot)
        .filter(ScheduleSlot.id.in_(data.slot_ids))
        .all()
    )

    if len(slots) != len(data.slot_ids):
        raise HTTPException(
            status_code=404,
            detail="One or more schedule slots not found",
        )

    # 3️⃣ Compute next group number (per course + semester)

    max_group = (
        db.query(func.max(CourseOffering.group_number))
        .filter(
            CourseOffering.course_id == data.course_id,
            CourseOffering.semester_id == data.semester_id,
        )
        .scalar()
    )

    next_group_number = (max_group or 0) + 1

    # 4️⃣ Create CourseOffering

    offering = CourseOffering(
        course_id=data.course_id,
        professor_id=data.professor_id,
        semester_id=data.semester_id,
        group_number=next_group_number,
        capacity=data.capacity,
        classroom=data.classroom,
        exam_date=data.exam_date,
    )

    db.add(offering)
    db.flush()  # get offering.id safely

    # 5️⃣ Create link table rows

    for slot in slots:
        db.add(
            CourseOfferingScheduleSlot(
                course_offering_id=offering.id,
                schedule_slot_id=slot.id,
            )
        )

    # 6️⃣ Commit once

    db.commit()
    db.refresh(offering)

    return offering


# @router.get(
#     "/",
#     response_model=list[CourseOfferingOut],
#     dependencies=[Depends(require_role("Admin"))],
# )
# def list_course_offerings(db: Session = Depends(get_db)):
#     return db.query(CourseOffering).all()

@router.get(
    "/",
    response_model=list[CourseOfferingOut],
    dependencies=[Depends(require_role("Admin"))],
)
def list_course_offerings(db: Session = Depends(get_db)):
    # 1️⃣ Fetch all course offerings
    offerings = db.query(CourseOffering).all()

    # 2️⃣ Fetch all (course_offering_id, schedule_slot_id) pairs
    rows = db.query(
        CourseOfferingScheduleSlot.course_offering_id,
        CourseOfferingScheduleSlot.schedule_slot_id
    ).all()

    # 3️⃣ Build a mapping: course_offering_id -> list of slot_ids
    slots_map = {}
    for course_offering_id, schedule_slot_id in rows:
        slots_map.setdefault(course_offering_id, []).append(schedule_slot_id)

    # 4️⃣ Build response
    result = []
    for o in offerings:
        # Use from_orm to copy ORM fields
        offering_out = CourseOfferingOut.from_orm(o).model_copy(
            update={"slot_ids": slots_map.get(o.id, [])}  # add the slot_ids
        )
        result.append(offering_out)

    return result


@router.get(
    "/for-current-term",
    response_model=list[CourseOfferingForStudent],
    dependencies=[Depends(require_role("Student"))],
)
def list_offerings_for_current_term(
    course_name: Optional[str] = Query(None, description="Filter by course name"),
    professor_name: Optional[str] = Query(None, description="Filter by professor name"),
    db: Session = Depends(get_db),
):
    """Student-facing: list course offerings for the active (current) semester with optional search."""
    active_semester = get_active_semester(db)
    if not active_semester:
        return []

    query = (
        db.query(CourseOffering, Course.name.label("course_name"), User.first_name, User.last_name)
        .join(Course, Course.id == CourseOffering.course_id)
        .join(User, User.id == CourseOffering.professor_id)
        .filter(CourseOffering.semester_id == active_semester.id)
    )

    if course_name:
        query = query.filter(Course.name.ilike(f"%{course_name}%"))
    if professor_name:
        prof_filter = f"%{professor_name}%"
        query = query.filter(
            (User.first_name.ilike(prof_filter)) | (User.last_name.ilike(prof_filter))
        )

    rows = query.all()

    # Fetch slot_ids
    offering_ids = [r[0].id for r in rows]
    slots_rows = (
        db.query(
            CourseOfferingScheduleSlot.course_offering_id,
            CourseOfferingScheduleSlot.schedule_slot_id,
        )
        .filter(CourseOfferingScheduleSlot.course_offering_id.in_(offering_ids))
        .all()
    )
    slots_map = {}
    for oid, sid in slots_rows:
        slots_map.setdefault(oid, []).append(sid)

    result = []
    for offering, cname, pfirst, plast in rows:
        prof_name = f"{pfirst} {plast}".strip()
        out = CourseOfferingOut.from_orm(offering).model_copy(
            update={"slot_ids": slots_map.get(offering.id, [])}
        )
        result.append(
            CourseOfferingForStudent(
                **out.model_dump(),
                course_name=cname,
                professor_name=prof_name,
            )
        )
    return result


@router.put(
    "/{offering_id}",
    response_model=CourseOfferingOut,
    dependencies=[Depends(require_role("Admin"))],
)
def update_course_offering(
    offering_id: uuid.UUID,
    data: CourseOfferingUpdate,
    db: Session = Depends(get_db),
):
    offering = (
        db.query(CourseOffering)
        .filter(CourseOffering.id == offering_id)
        .first()
    )

    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    payload = data.dict(exclude_unset=True)

    # ❌ Disallow immutable fields
    immutable_fields = {"course_id", "semester_id"}
    forbidden = immutable_fields.intersection(payload.keys())

    if forbidden:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update immutable fields: {', '.join(forbidden)}",
        )

    # 1️⃣ Validate professor if updated
    if "professor_id" in payload:
        professor = (
            db.query(User)
            .filter(
                User.id == payload["professor_id"],
                User.role == UserRole.Professor,
            )
            .first()
        )
        if not professor:
            raise HTTPException(status_code=404, detail="Professor not found")

    # 2️⃣ Update scalar fields
    for field, value in payload.items():
        if field != "slot_ids":
            setattr(offering, field, value)

    db.flush()

    # 3️⃣ Update schedule slots if provided
    if "slot_ids" in payload:
        slots = (
            db.query(ScheduleSlot)
            .filter(ScheduleSlot.id.in_(payload["slot_ids"]))
            .all()
        )

        if len(slots) != len(payload["slot_ids"]):
            raise HTTPException(
                status_code=404,
                detail="One or more schedule slots not found",
            )

        db.query(CourseOfferingScheduleSlot).filter(
            CourseOfferingScheduleSlot.course_offering_id == offering.id
        ).delete()

        for slot in slots:
            db.add(
                CourseOfferingScheduleSlot(
                    course_offering_id=offering.id,
                    schedule_slot_id=slot.id,
                )
            )

    # 4️⃣ Commit once
    db.commit()
    db.refresh(offering)

    return offering




@router.delete(
    "/{offering_id}",
    dependencies=[Depends(require_role("Admin"))],
)
def delete_course_offering(
    offering_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    offering = (
        db.query(CourseOffering)
        .filter(CourseOffering.id == offering_id)
        .first()
    )

    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    # 1️⃣ Delete link table rows FIRST
    db.query(CourseOfferingScheduleSlot).filter(
        CourseOfferingScheduleSlot.course_offering_id == offering.id
    ).delete()

    # 2️⃣ Delete the course offering
    db.delete(offering)

    # 3️⃣ Commit ONCE
    db.commit()

    return {"message": "Course offering deleted successfully"}


@router.get(
    "/{offering_id}/students",
    dependencies=[Depends(require_role("Professor"))],
)
def students_in_offering(
    offering_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """View enrolled students for professor's course offering, sorted by last name."""
    offering = (
        db.query(CourseOffering)
        .filter(
            CourseOffering.id == offering_id,
            CourseOffering.professor_id == current_user.id,
        )
        .first()
    )

    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    return (
        db.query(Enrollment)
        .join(User, User.id == Enrollment.student_id)
        .filter(
            Enrollment.offering_id == offering_id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .order_by(User.last_name, User.first_name)
        .all()
    )

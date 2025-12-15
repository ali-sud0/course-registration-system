# app/routers/course_offering.py
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.dependencies import require_role
from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.schedule_slot import ScheduleSlot
from app.models.semester import Semester
from app.models.user import User, UserRole
from app.schemas.course_offering import (
    CourseOfferingCreate,
    CourseOfferingUpdate,
    CourseOfferingOut,
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
    # 1️⃣ Validate foreign keys FIRST

    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    professor = db.query(User).filter(
        User.id == data.professor_id,
        User.role == UserRole.Professor
    ).first()
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
        raise HTTPException(status_code=404, detail="One or more schedule slots not found")

    # 3️⃣ Create CourseOffering (SAFE now)
    offering = CourseOffering(
        course_id=data.course_id,
        professor_id=data.professor_id,
        semester_id=data.semester_id,
        capacity=data.capacity,
        classroom=data.classroom,
        exam_date=data.exam_date,
    )

    db.add(offering)
    db.flush()  # 🔥 important (get offering.id without committing)

    # 4️⃣ Create link table rows
    for slot in slots:
        link = CourseOfferingScheduleSlot(
            course_offering_id=offering.id,
            schedule_slot_id=slot.id,
        )
        db.add(link)

    # 5️⃣ Commit ONCE
    db.commit()
    db.refresh(offering)

    return offering


@router.get(
    "/",
    response_model=list[CourseOfferingOut],
    dependencies=[Depends(require_role("Admin"))],
)
def list_course_offerings(db: Session = Depends(get_db)):
    return db.query(CourseOffering).all()


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

    # 1️⃣ Validate foreign keys ONLY if they are being updated

    if "course_id" in payload:
        course = db.query(Course).filter(Course.id == payload["course_id"]).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

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

    if "semester_id" in payload:
        semester = (
            db.query(Semester)
            .filter(Semester.id == payload["semester_id"])
            .first()
        )
        if not semester:
            raise HTTPException(status_code=404, detail="Semester not found")

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

        # remove old links
        db.query(CourseOfferingScheduleSlot).filter(
            CourseOfferingScheduleSlot.course_offering_id == offering.id
        ).delete()

        # add new links
        for slot in slots:
            link = CourseOfferingScheduleSlot(
                course_offering_id=offering.id,
                schedule_slot_id=slot.id,
            )
            db.add(link)

    # 4️⃣ Commit ONCE
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


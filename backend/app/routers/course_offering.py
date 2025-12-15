# app/routers/course_offering.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.dependencies import require_role
from app.models.course_offering import CourseOffering
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
    offering = CourseOffering(**data.dict())

    db.add(offering)
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
    offering_id: str,
    data: CourseOfferingUpdate,
    db: Session = Depends(get_db),
):
    offering = db.query(CourseOffering).filter(CourseOffering.id == offering_id).first()
    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(offering, field, value)

    db.commit()
    db.refresh(offering)
    return offering


@router.delete(
    "/{offering_id}",
    dependencies=[Depends(require_role("Admin"))],
)
def delete_course_offering(
    offering_id: str,
    db: Session = Depends(get_db),
):
    offering = db.query(CourseOffering).filter(CourseOffering.id == offering_id).first()
    if not offering:
        raise HTTPException(status_code=404, detail="Course offering not found")

    db.delete(offering)
    db.commit()
    return {"message": "Course offering deleted successfully"}

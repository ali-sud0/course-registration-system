# app/routers/course.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.user import User, UserRole
from app.schemas.course import CourseCreate, CourseUpdate, CourseOut
# from app.core.auth import require_role  # already implemented
from app.dependencies import require_role, get_current_user  # already implemented


router = APIRouter(
    prefix="/courses",
    tags=["courses"],
)


# CREATE
@router.post("/", response_model=CourseOut, dependencies=[Depends(require_role("Admin"))])
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    # check unique course_code
    existing = db.query(Course).filter(Course.course_code == course.course_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")

    new_course = Course(
        course_code=course.course_code,
        name=course.name,
        units=course.units
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


# READ ALL
# @router.get("/", response_model=list[CourseOut], dependencies=[Depends(require_role("Admin"))])
# def list_courses(db: Session = Depends(get_db)):
#     return db.query(Course).all()

@router.get("/", response_model=list[CourseOut])
def list_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admin → all courses
    if current_user.role == UserRole.Admin:
        return db.query(Course).all()

    # Professor → courses they teach (via CourseOffering)
    if current_user.role == UserRole.Professor:
        return (
            db.query(Course)
            .join(CourseOffering, CourseOffering.course_id == Course.id)
            .filter(CourseOffering.professor_id == current_user.id)
            .distinct()
            .all()
        )

    # Everyone else → forbidden
    # Students should be able to see course names/codes so front-end can
    # display them when rendering offerings. Return all courses for students.
    if current_user.role == UserRole.Student:
        return db.query(Course).all()

    raise HTTPException(
        status_code=403,
        detail="You do not have permission to view courses",
    )


# UPDATE
@router.put("/{course_id}", response_model=CourseOut, dependencies=[Depends(require_role("Admin"))])
def update_course(course_id: str, data: CourseUpdate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if data.name is not None:
        course.name = data.name

    if data.units is not None:
        course.units = data.units

    if data.course_code is not None:
        course.course_code = data.course_code

    db.commit()
    db.refresh(course)
    return course


# DELETE
@router.delete("/{course_id}", dependencies=[Depends(require_role("Admin"))])
def delete_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}

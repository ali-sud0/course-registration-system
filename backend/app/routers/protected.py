# app/routers/protected.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4
from app.core.db import get_db
from app.dependencies import get_current_user, require_role
from app.schemas.auth import UserOut, UserCreate
from app.models.user import User, UserRole
from app.core.security import hash_password

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/", response_model=UserOut)
def read_me(current_user = Depends(get_current_user)):
    return current_user

@router.get("/enrollments", dependencies=[Depends(require_role("Student"))])
def my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's enrollments (student endpoint)"""
    return (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == current_user.id,
            Enrollment.status == EnrollmentStatus.enrolled,
        )
        .all()
    )

@router.get("/admin-only")
def admin_only(user = Depends(require_role("Admin"))):
    return {"msg": f"Hello Admin [{user.first_name} {user.last_name}]"}

@router.get("/professors", response_model=List[UserOut], dependencies=[Depends(require_role("Admin"))])
def list_professors(db: Session = Depends(get_db)):
    """List all professors - Admin only"""
    professors = db.query(User).filter(User.role == UserRole.Professor).all()
    return professors

@router.post("/professors", response_model=UserOut, dependencies=[Depends(require_role("Admin"))])
def create_professor(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new professor - Admin only"""
    # Check if user_number already exists
    existing_user = db.query(User).filter(User.user_number == user_data.user_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User number already exists")
    
    # Create new professor
    new_professor = User(
        id=str(uuid4()),
        role=UserRole.Professor,
        user_number=user_data.user_number,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        password_hash=hash_password(user_data.password),
        national_number=user_data.national_number,
        phone_number=user_data.phone_number,
        is_suspended=False
    )
    
    db.add(new_professor)
    db.commit()
    db.refresh(new_professor)
    return new_professor

@router.delete("/professors/{professor_id}", dependencies=[Depends(require_role("Admin"))])
def delete_professor(professor_id: str, db: Session = Depends(get_db)):
    """Delete a professor - Admin only"""
    professor = db.query(User).filter(
        User.id == professor_id,
        User.role == UserRole.Professor
    ).first()
    
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    
    db.delete(professor)
    db.commit()
    return {"message": "Professor deleted successfully"}

@router.get("/students", response_model=List[UserOut], dependencies=[Depends(require_role("Admin"))])
def list_students(db: Session = Depends(get_db)):
    """List all students - Admin only"""
    students = db.query(User).filter(User.role == UserRole.Student).all()
    return students

@router.delete("/students/{student_id}", dependencies=[Depends(require_role("Admin"))])
def delete_student(student_id: str, db: Session = Depends(get_db)):
    """Delete a student - Admin only"""
    student = db.query(User).filter(
        User.id == student_id,
        User.role == UserRole.Student
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
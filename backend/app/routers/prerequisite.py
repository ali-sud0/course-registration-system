# app/routers/prerequisite.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.prerequisite import Prerequisite
from app.routers.utils.prerequisiteHelper import has_cycle
from app.schemas.prerequisite import PrerequisiteCreate, PrerequisiteUpdate, PrerequisiteOut
from app.dependencies import require_role

router = APIRouter(
    prefix="/prerequisites",
    tags=["prerequisites"],
)

# CREATE
@router.post("/", response_model=PrerequisiteOut, dependencies=[Depends(require_role("Admin"))])
def create_prerequisite(data: PrerequisiteCreate, db: Session = Depends(get_db)):
    # prevent duplicates
    existing = db.query(Prerequisite).filter(
        Prerequisite.course_id == data.course_id,
        Prerequisite.prerequisite_course_id == data.prerequisite_course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Prerequisite already exists")

    # prevent a course being its own prerequisite
    if data.course_id == data.prerequisite_course_id:
        raise HTTPException(status_code=400, detail="A course cannot be its own prerequisite")

    # prevent circular dependency
    if has_cycle(db, start_id=data.course_id, target_id=data.prerequisite_course_id):
        raise HTTPException(status_code=400, detail="Adding this prerequisite would create a cycle")

    prereq = Prerequisite(**data.dict())
    db.add(prereq)
    db.commit()
    db.refresh(prereq)
    return prereq

# READ ALL
@router.get("/", response_model=list[PrerequisiteOut], dependencies=[Depends(require_role("Admin"))])
def list_prerequisites(db: Session = Depends(get_db)):
    return db.query(Prerequisite).all()

# UPDATE
@router.put("/{prerequisite_id}", response_model=PrerequisiteOut, dependencies=[Depends(require_role("Admin"))])
def update_prerequisite(prerequisite_id: str, data: PrerequisiteUpdate, db: Session = Depends(get_db)):
    prereq = db.query(Prerequisite).filter(Prerequisite.id == prerequisite_id).first()
    if not prereq:
        raise HTTPException(status_code=404, detail="Prerequisite not found")

    # Determine the final values after update
    new_course_id = data.course_id if data.course_id is not None else prereq.course_id
    new_prereq_id = data.prerequisite_course_id if data.prerequisite_course_id is not None else prereq.prerequisite_course_id

    # Prevent self-prerequisite
    if new_course_id == new_prereq_id:
        raise HTTPException(status_code=400, detail="A course cannot be its own prerequisite")

    # Prevent circular dependency
    if has_cycle(db, start_id=new_course_id, target_id=new_prereq_id):
        raise HTTPException(status_code=400, detail="Updating this prerequisite would create a cycle")

    # Apply updates
    prereq.course_id = new_course_id
    prereq.prerequisite_course_id = new_prereq_id

    db.commit()
    db.refresh(prereq)
    return prereq

# DELETE
@router.delete("/{prerequisite_id}", dependencies=[Depends(require_role("Admin"))])
def delete_prerequisite(prerequisite_id: str, db: Session = Depends(get_db)):
    prereq = db.query(Prerequisite).filter(Prerequisite.id == prerequisite_id).first()
    if not prereq:
        raise HTTPException(status_code=404, detail="Prerequisite not found")

    db.delete(prereq)
    db.commit()
    return {"message": "Prerequisite deleted successfully"}

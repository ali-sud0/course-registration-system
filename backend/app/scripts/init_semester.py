# app/scripts/init_semester.py
from sqlalchemy.orm import Session
import uuid
from datetime import date, timedelta

from app.core.db import SessionLocal, Base, engine
from app.models.semester import Semester


def seed_semester():
    """Ensure only semester '1404-1' exists and is active.

    This function will remove any other semesters from the database,
    create `1404-1` if missing, and set it as active with dates
    that include today.
    """
    db: Session = SessionLocal()

    today = date.today()

    # Deactivate all semesters except the target name to avoid FK delete issues
    TARGET_NAME = "1404-1"
    try:
        # Deactivate all other semesters
        others = db.query(Semester).filter(Semester.name != TARGET_NAME).all()
        for s in others:
            if s.is_active:
                s.is_active = False
                db.add(s)
        if others:
            db.commit()
            print(f"Deactivated {len(others)} other semester(s)")

        # Ensure TARGET_NAME exists and is active
        sem = db.query(Semester).filter(Semester.name == TARGET_NAME).first()
        if sem:
            sem.is_active = True
            sem.start_date = today
            sem.end_date = today + timedelta(days=100)
            sem.min_units = sem.min_units or 12
            sem.max_units = sem.max_units or 24
            db.add(sem)
            db.commit()
            db.refresh(sem)
            print(f"Updated existing semester {TARGET_NAME} and marked active")
        else:
            new_semester = Semester(
                id=uuid.uuid4(),
                name=TARGET_NAME,
                start_date=today,
                end_date=today + timedelta(days=100),
                min_units=12,
                max_units=24,
                is_active=True,
            )
            db.add(new_semester)
            db.commit()
            db.refresh(new_semester)
            print(f"Created and activated semester: {TARGET_NAME}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_semester()

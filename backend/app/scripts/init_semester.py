# app/scripts/init_semester.py
from sqlalchemy.orm import Session
import uuid
from datetime import date

from app.core.db import SessionLocal, Base, engine
from app.models.semester import Semester

def seed_semester():
    db: Session = SessionLocal()

    # Check if semester already exists
    existing = db.query(Semester).filter(Semester.name == "1404-1").first()
    if existing:
        print("Semester 1404-1 already exists")
        return

    semester = Semester(
        id=uuid.uuid4(),
        name="1404-1",
        start_date=date(2025, 9, 23),
        end_date=date(2025, 12, 22),
        min_units=12,
        max_units=24,
        is_active=True,
    )

    db.add(semester)
    db.commit()
    db.refresh(semester)
    print(f"Seeded semester: {semester.name}")

if __name__ == "__main__":
    seed_semester()

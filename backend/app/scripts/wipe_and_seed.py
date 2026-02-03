"""Wipe all data (destructive) and re-run seeders.

Use with caution. Run from `backend` directory with PYTHONPATH='.'

  PYTHONPATH='.' python3 app/scripts/wipe_and_seed.py

The script deletes rows in a foreign-key safe order, then calls the master seeder.
"""
import sys
import os

# make sure 'app' package is importable when run from backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.db import SessionLocal
from app.models.enrollment import Enrollment
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.course_offering import CourseOffering
from app.models.prerequisite import Prerequisite
from app.models.schedule_slot import ScheduleSlot
from app.models.course import Course
from app.models.token_metadata import TokenMetadata
from app.models.user import User
from app.models.semester import Semester

from app.scripts.seed_all import run_all_seeds


def wipe_db():
    db = SessionLocal()
    try:
        # Delete in FK-safe order
        counts = {}

        counts['enrollments'] = db.query(Enrollment).count()
        if counts['enrollments']:
            db.query(Enrollment).delete(synchronize_session=False)

        counts['course_offering_schedule_slots'] = db.query(CourseOfferingScheduleSlot).count()
        if counts['course_offering_schedule_slots']:
            db.query(CourseOfferingScheduleSlot).delete(synchronize_session=False)

        counts['course_offerings'] = db.query(CourseOffering).count()
        if counts['course_offerings']:
            db.query(CourseOffering).delete(synchronize_session=False)

        counts['prerequisites'] = db.query(Prerequisite).count()
        if counts['prerequisites']:
            db.query(Prerequisite).delete(synchronize_session=False)

        counts['schedule_slots'] = db.query(ScheduleSlot).count()
        if counts['schedule_slots']:
            db.query(ScheduleSlot).delete(synchronize_session=False)

        counts['courses'] = db.query(Course).count()
        if counts['courses']:
            db.query(Course).delete(synchronize_session=False)

        counts['token_metadata'] = db.query(TokenMetadata).count()
        if counts['token_metadata']:
            db.query(TokenMetadata).delete(synchronize_session=False)

        counts['users'] = db.query(User).count()
        if counts['users']:
            db.query(User).delete(synchronize_session=False)

        counts['semesters'] = db.query(Semester).count()
        if counts['semesters']:
            db.query(Semester).delete(synchronize_session=False)

        db.commit()

        print("Wipe summary:")
        for k, v in counts.items():
            print(f"  - {k}: removed {v}")

    except Exception as e:
        print("Error wiping DB:", e)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    print("Starting destructive wipe of all data...")
    wipe_db()
    print("Running seeders...")
    ok = run_all_seeds()
    if ok:
        print("Wipe and reseed completed successfully")
    else:
        print("Seeder reported failures; check output above")

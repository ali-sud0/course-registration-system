"""Cleanup script

Deletes all enrollments and removes course offerings that are not in the active semester.
Run from the `backend` directory::

  python3 app/scripts/cleanup_db.py

This script is destructive. It prints counts of removed rows.
"""
import sys
import os
from sqlalchemy.orm import Session

# allow running script directly (add project root to path)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.db import SessionLocal
from app.models.enrollment import Enrollment
from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.semester import Semester


def run_cleanup():
    db: Session = SessionLocal()
    try:
        active = db.query(Semester).filter(Semester.is_active == True).first()
        if not active:
            print("No active semester found. Aborting cleanup.")
            return

        active_id = active.id
        print(f"Active semester: {active.name} ({active_id})")

        # Purge all enrollments
        enroll_count = db.query(Enrollment).count()
        if enroll_count > 0:
            deleted = db.query(Enrollment).delete(synchronize_session=False)
            db.commit()
            print(f"Deleted {deleted} enrollment(s)")
        else:
            print("No enrollments to delete")

        # Find offerings not in active semester
        stale_offerings = db.query(CourseOffering).filter(CourseOffering.semester_id != active_id).all()
        stale_ids = [o.id for o in stale_offerings]
        if stale_ids:
            # Delete schedule-slot assignments for those offerings first
            so_deleted = db.query(CourseOfferingScheduleSlot).filter(CourseOfferingScheduleSlot.course_offering_id.in_(stale_ids)).delete(synchronize_session=False)
            # Delete the offerings themselves
            co_deleted = db.query(CourseOffering).filter(CourseOffering.id.in_(stale_ids)).delete(synchronize_session=False)
            db.commit()
            print(f"Deleted {so_deleted} course-offering schedule assignments and {co_deleted} stale course offering(s)")
        else:
            print("No stale course offerings found (all offerings are in the active semester)")

        print("Cleanup completed")
    except Exception as e:
        print("Error during cleanup:", e)
        db.rollback()
    finally:
        db.close()


if __name__ == '__main__':
    run_cleanup()

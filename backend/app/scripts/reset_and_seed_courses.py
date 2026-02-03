"""
Reset `course_offerings` and `courses` tables and seed them with sample data.

Usage:
  python3 app/scripts/reset_and_seed_courses.py

This script will:
 - delete enrollments, course_offering_schedule_slots, course_offerings, and courses
 - insert a set of sample courses (20-30)
 - create course offerings for the active semester, assign professors and schedule slots
"""
import os
import sys

# Ensure `app` package is importable when running the script from the repository root.
# This inserts the `backend` directory (which contains the `app` package) into sys.path.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from sqlalchemy.orm import Session
from uuid import uuid4
import random

from app.core.db import SessionLocal, Base, engine
from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.enrollment import Enrollment
from app.models.user import User, UserRole
from app.models.schedule_slot import ScheduleSlot
from app.models.prerequisite import Prerequisite
from app.models.semester import Semester
from app.core.semester_helper import get_active_semester


COURSES = [
    ("مهندسی نرم افزار", "7777452", 3),
    ("پایگاه داده‌ها", "7777453", 3),
    ("هوش مصنوعی", "7777454", 3),
    ("یادگیری ماشین", "7777455", 3),
    ("سیستم‌های عامل", "7777456", 4),
    ("شبکه‌های کامپیوتری", "7777457", 3),
    ("معماری کامپیوتر", "7777458", 3),
    ("ریاضیات گسسته", "7777459", 3),
    ("حسابان 1", "7777460", 3),
    ("حسابان 2", "7777461", 3),
    ("آمار و احتمال", "7777462", 3),
    ("الگوریتم‌ها", "7777463", 3),
    ("مهندسی نرم‌افزار پیشرفته", "7777464", 3),
    ("برنامه‌سازی وب", "7777465", 3),
    ("تجزیه و تحلیل مسائل", "7777466", 2),
    ("رایانش ابری", "7777467", 3),
    ("امنیت اطلاعات", "7777468", 3),
    ("پردازش تصویر", "7777469", 3),
    ("پردازش زبان طبیعی", "7777470", 3),
    ("مدیریت پروژه", "7777471", 2),
    ("طراحی واسط کاربری", "7777472", 2),
    ("برنامه‌نویسی شیءگرا", "7777473", 3),
    ("آزمایشگاه نرم‌افزار", "7777474", 1),
    ("مدل‌سازی داده", "7777475", 3),
    ("کارآموزی", "7777476", 1),
]


def reset_and_seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Delete dependent rows safely
        print('Deleting enrollments...')
        db.query(Enrollment).delete(synchronize_session=False)
        db.commit()

        print('Deleting course_offering_schedule_slots...')
        db.query(CourseOfferingScheduleSlot).delete(synchronize_session=False)
        db.commit()

        print('Deleting course_offerings...')
        db.query(CourseOffering).delete(synchronize_session=False)
        db.commit()

        print('Deleting prerequisites...')
        db.query(Prerequisite).delete(synchronize_session=False)
        db.commit()

        print('Deleting courses...')
        db.query(Course).delete(synchronize_session=False)
        db.commit()

        # Create courses
        print(f'Creating {len(COURSES)} courses...')
        created_courses = []
        for name, code, units in COURSES:
            course = Course(
                id=uuid4(),
                course_code=str(code),
                name=name,
                units=units,
            )
            db.add(course)
            created_courses.append(course)
        db.commit()

        # Ensure semester and professors exist
        active_sem = get_active_semester(db)
        if not active_sem:
            active_sem = db.query(Semester).first()
        if not active_sem:
            print('No semester found. Create a semester first.')
            return

        professors = db.query(User).filter(User.role == UserRole.Professor).all()
        if not professors:
            print('No professors found. Create professor users first.')
            return

        # Collect schedule slot ids
        slots = db.query(ScheduleSlot).all()
        slot_ids = [s.id for s in slots]
        if not slot_ids:
            print('No schedule slots found. Run init_schedule_slots.py first.')
            return

        # Create offerings: for each course create 1-2 groups
        print('Creating course offerings...')
        offering_count = 0
        for i, course in enumerate(created_courses):
            groups = 1 + (i % 2)  # alternate 1 or 2 groups
            for g in range(groups):
                prof = random.choice(professors)
                offering = CourseOffering(
                    id=uuid4(),
                    course_id=course.id,
                    professor_id=prof.id,
                    semester_id=active_sem.id,
                    group_number=g + 1,
                    capacity=25 + (i % 10),
                    classroom=f"R-{(i%10)+1:02d}",
                )
                db.add(offering)
                db.flush()

                # Assign 1-2 random schedule slots
                assigned = random.sample(slot_ids, k=1 + (i % 2))
                for sid in assigned:
                    link = CourseOfferingScheduleSlot(
                        id=uuid4(),
                        course_offering_id=offering.id,
                        schedule_slot_id=sid,
                    )
                    db.add(link)

                offering_count += 1
        db.commit()

        print(f'✅ Created {len(created_courses)} courses and {offering_count} offerings')

    except Exception as e:
        print('Error during reset and seed:', e)
        db.rollback()
    finally:
        db.close()


if __name__ == '__main__':
    reset_and_seed()

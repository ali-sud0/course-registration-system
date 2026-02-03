"""
Initialize mock courses and course offerings.
Creates sample courses and generates course offerings with the professors in the system.
"""

from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta

from app.core.db import SessionLocal, Base, engine
from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.user import User, UserRole
from app.models.semester import Semester


def gen_uuid():
    return str(uuid.uuid4())


def init_mock_courses_and_offerings():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        courses_data = [
            {
                "course_code": "CS101",
                "name": "مبانی برنامه‌نویسی",
                "units": 3,
            },
            {
                "course_code": "CS201",
                "name": "ساختمان داده‌ها",
                "units": 4,
            },
            {
                "course_code": "MATH101",
                "name": "ریاضیات مدرسه",
                "units": 3,
            },
            {
                "course_code": "PHYS101",
                "name": "فیزیک عمومی",
                "units": 4,
            },
        ]

        existing_courses = db.query(Course).count()
        if existing_courses > 0:
            print(f"Courses already exist ({existing_courses} courses). Skipping course creation.")
        else:
            for course_data in courses_data:
                course = Course(
                    id=gen_uuid(),
                    course_code=course_data["course_code"],
                    name=course_data["name"],
                    units=course_data["units"],
                )
                db.add(course)
            db.commit()
            print(f"✅ Created {len(courses_data)} courses")

        # Purge schedule slots first (foreign key constraint)
        db.query(CourseOfferingScheduleSlot).delete(synchronize_session=False)
        db.commit()
        
        # Then purge course offerings table
        db.query(CourseOffering).delete(synchronize_session=False)
        db.commit()
        print("✅ Purged course offerings table")

        # Get all courses and professors
        courses = db.query(Course).all()
        professors = db.query(User).filter(User.role == UserRole.Professor).all()
        # Use active/current semester (seed_semester now creates a current active semester)
        semester = db.query(Semester).filter(Semester.is_active == True).first()

        if not courses:
            print("❌ No courses found")
            return

        if not professors:
            print("❌ No professors found")
            return

        if not semester:
            print("❌ No semester found")
            return

        # Create course offerings
        offerings_created = 0
        for i, course in enumerate(courses):
            # Assign professor (cycle through available professors)
            professor = professors[i % len(professors)]

            offering = CourseOffering(
                id=gen_uuid(),
                course_id=course.id,
                professor_id=professor.id,
                semester_id=semester.id,
                group_number=1,
                capacity=30,
                classroom=f"Room {i+1:02d}",
            )
            db.add(offering)
            offerings_created += 1

        db.commit()

        print(f"✅ Created {offerings_created} course offerings")
        print("\nOfferings:")
        for offering in db.query(CourseOffering).all():
            prof = db.query(User).filter(User.id == offering.professor_id).first()
            course = db.query(Course).filter(Course.id == offering.course_id).first()
            print(
                f"  - {course.course_code} ({course.name}) -> {prof.first_name} {prof.last_name}"
            )

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_mock_courses_and_offerings()

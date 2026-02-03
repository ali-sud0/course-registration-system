"""
Seed 20 comprehensive courses with realistic computer science and engineering curriculum.
"""

from sqlalchemy.orm import Session
import uuid

from app.core.db import SessionLocal, Base, engine
from app.models.course import Course


def gen_uuid():
    return str(uuid.uuid4())


def seed_courses():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    
    try:
        courses_data = [
            # Foundational Programming
            {
                "course_code": "CS101",
                "name": "مبانی برنامه‌نویسی",
                "units": 3,
            },
            {
                "course_code": "CS102",
                "name": "برنامه‌نویسی پیشرفته",
                "units": 4,
            },
            # Data Structures and Algorithms
            {
                "course_code": "CS201",
                "name": "ساختمان داده‌ها",
                "units": 4,
            },
            {
                "course_code": "CS202",
                "name": "طراحی الگوریتم‌ها",
                "units": 3,
            },
            # Database Systems
            {
                "course_code": "CS301",
                "name": "سیستم‌های پایگاه داده",
                "units": 4,
            },
            {
                "course_code": "CS302",
                "name": "مدل‌سازی داده‌ها",
                "units": 3,
            },
            # Web Development
            {
                "course_code": "CS310",
                "name": "توسعه وب - سمت سرور",
                "units": 3,
            },
            {
                "course_code": "CS311",
                "name": "توسعه وب - سمت کاربر",
                "units": 3,
            },
            # Software Engineering
            {
                "course_code": "CS401",
                "name": "مهندسی نرم‌افزار",
                "units": 4,
            },
            {
                "course_code": "CS402",
                "name": "تست و کنترل کیفیت",
                "units": 3,
            },
            # Artificial Intelligence and Machine Learning
            {
                "course_code": "CS450",
                "name": "هوش مصنوعی",
                "units": 3,
            },
            {
                "course_code": "CS451",
                "name": "یادگیری ماشینی",
                "units": 4,
            },
            # System and Networks
            {
                "course_code": "CS501",
                "name": "سیستم‌های عامل",
                "units": 4,
            },
            {
                "course_code": "CS502",
                "name": "شبکه‌های رایانه‌ای",
                "units": 3,
            },
            # Security
            {
                "course_code": "CS510",
                "name": "امنیت رایانه‌ای",
                "units": 3,
            },
            {
                "course_code": "CS511",
                "name": "رمزنگاری",
                "units": 3,
            },
            # Mathematics
            {
                "course_code": "MATH101",
                "name": "ریاضیات ۱",
                "units": 4,
            },
            {
                "course_code": "MATH102",
                "name": "ریاضیات گسسته",
                "units": 3,
            },
            # Physics
            {
                "course_code": "PHYS101",
                "name": "فیزیک عمومی ۱",
                "units": 4,
            },
            {
                "course_code": "PHYS102",
                "name": "فیزیک عمومی ۲",
                "units": 4,
            },
        ]

        # Check if courses already exist
        existing_count = db.query(Course).count()
        if existing_count >= 20:
            print(f"✅ {existing_count} courses already exist. Skipping course creation.")
            return

        created_count = 0
        for course_data in courses_data:
            # Check if this course already exists
            existing = db.query(Course).filter(
                Course.course_code == course_data["course_code"]
            ).first()
            
            if existing:
                print(f"⚠️  Course {course_data['course_code']} already exists. Skipping...")
                continue

            course = Course(
                id=gen_uuid(),
                course_code=course_data["course_code"],
                name=course_data["name"],
                units=course_data["units"],
            )
            
            db.add(course)
            created_count += 1

        db.commit()
        print(f"✅ Created {created_count} course(s)")
        print("   Courses can now be assigned to professors for offerings")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating courses: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_courses()

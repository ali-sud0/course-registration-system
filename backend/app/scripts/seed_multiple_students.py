"""
Seed 10 students with realistic data for testing and demonstration.
"""

from sqlalchemy.orm import Session
import uuid

from app.core.db import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.core.security import hash_password


def gen_uuid():
    return str(uuid.uuid4())


def seed_students():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    
    try:
        students_data = [
            {
                "user_number": "std001",
                "first_name": "محسن",
                "last_name": "شاهپور",
                "password": "std001",
                "national_number": "2222222201",
                "phone_number": "09160000001",
            },
            {
                "user_number": "std002",
                "first_name": "زهرا",
                "last_name": "کاظمی",
                "password": "std002",
                "national_number": "2222222202",
                "phone_number": "09160000002",
            },
            {
                "user_number": "std003",
                "first_name": "کیوان",
                "last_name": "پاسخ",
                "password": "std003",
                "national_number": "2222222203",
                "phone_number": "09160000003",
            },
            {
                "user_number": "std004",
                "first_name": "سمیه",
                "last_name": "میرزایی",
                "password": "std004",
                "national_number": "2222222204",
                "phone_number": "09160000004",
            },
            {
                "user_number": "std005",
                "first_name": "امید",
                "last_name": "اسدپور",
                "password": "std005",
                "national_number": "2222222205",
                "phone_number": "09160000005",
            },
            {
                "user_number": "std006",
                "first_name": "نیما",
                "last_name": "علیزاده",
                "password": "std006",
                "national_number": "2222222206",
                "phone_number": "09160000006",
            },
            {
                "user_number": "std007",
                "first_name": "فرناز",
                "last_name": "موسوی",
                "password": "std007",
                "national_number": "2222222207",
                "phone_number": "09160000007",
            },
            {
                "user_number": "std008",
                "first_name": "بهنام",
                "last_name": "سلطانی",
                "password": "std008",
                "national_number": "2222222208",
                "phone_number": "09160000008",
            },
            {
                "user_number": "std009",
                "first_name": "آرمان",
                "last_name": "جعفری",
                "password": "std009",
                "national_number": "2222222209",
                "phone_number": "09160000009",
            },
            {
                "user_number": "std010",
                "first_name": "پریا",
                "last_name": "حسن‌زاده",
                "password": "std010",
                "national_number": "2222222210",
                "phone_number": "09160000010",
            },
        ]

        # Check if students already exist
        existing_count = db.query(User).filter(User.role == UserRole.Student).count()
        if existing_count >= 10:
            print(f"✅ {existing_count} students already exist. Skipping student creation.")
            return

        created_count = 0
        for student_data in students_data:
            # Check if this student already exists
            existing = db.query(User).filter(
                User.user_number == student_data["user_number"]
            ).first()
            
            if existing:
                print(f"⚠️  Student {student_data['user_number']} already exists. Skipping...")
                continue

            student = User(
                id=gen_uuid(),
                role=UserRole.Student,
                user_number=student_data["user_number"],
                first_name=student_data["first_name"],
                last_name=student_data["last_name"],
                password_hash=hash_password(student_data["password"]),
                national_number=student_data["national_number"],
                phone_number=student_data["phone_number"],
                is_suspended=False
            )
            
            db.add(student)
            created_count += 1

        db.commit()
        print(f"✅ Created {created_count} student(s)")
        print("   Students can now enroll in courses and test the system")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating students: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_students()

"""
Initialize mock students and teachers in the database.
Run this script to populate the database with test users.
Credentials will be saved to backend/scripts/MOCK_CREDENTIALS.txt
"""

from sqlalchemy.orm import Session
import uuid
from pathlib import Path

from app.core.db import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.core.security import hash_password


def gen_uuid():
    return str(uuid.uuid4())


def init_mock_users():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    credentials_file = Path(__file__).parent / "MOCK_CREDENTIALS.txt"
    
    try:
        # Check if mock users already exist
        existing_student = db.query(User).filter(
            User.user_number.like("student_%")
        ).first()
        
        existing_teacher = db.query(User).filter(
            User.user_number.like("teacher_%")
        ).first()
        
        if existing_student or existing_teacher:
            print("Mock users already exist in database. Skipping creation.")
            return
        
        credentials = []
        credentials.append("=" * 70)
        credentials.append("MOCK CREDENTIALS FOR TESTING")
        credentials.append("=" * 70)
        credentials.append("")
        
        # Create 5 mock teachers
        credentials.append("TEACHERS (5)")
        credentials.append("-" * 70)
        
        teacher_data = [
            {"first": "علی", "last": "محمدی", "phone": "09110000001"},
            {"first": "فاطمه", "last": "احمدی", "phone": "09110000002"},
            {"first": "محمد", "last": "علی‌زاده", "phone": "09110000003"},
            {"first": "زهرا", "last": "حسنی", "phone": "09110000004"},
            {"first": "حسن", "last": "رضایی", "phone": "09110000005"},
        ]
        
        for idx, data in enumerate(teacher_data, 1):
            user_number = f"teacher_{idx:02d}"
            password = f"teacher{idx:02d}"
            
            teacher = User(
                id=gen_uuid(),
                role=UserRole.Professor,
                user_number=user_number,
                first_name=data["first"],
                last_name=data["last"],
                password_hash=hash_password(password),
                national_number=f"000{idx:07d}",
                phone_number=data["phone"],
                is_suspended=False
            )
            
            db.add(teacher)
            credentials.append(f"Teacher {idx}: {data['first']} {data['last']}")
            credentials.append(f"  Username: {user_number}")
            credentials.append(f"  Password: {password}")
            credentials.append(f"  National ID: {teacher.national_number}")
            credentials.append("")
        
        # Create 10 mock students
        credentials.append("")
        credentials.append("STUDENTS (10)")
        credentials.append("-" * 70)
        
        student_data = [
            {"first": "علیرضا", "last": "کریمی", "phone": "09120000001"},
            {"first": "مریم", "last": "شاهین", "phone": "09120000002"},
            {"first": "سارا", "last": "موسوی", "phone": "09120000003"},
            {"first": "بهرام", "last": "ترک", "phone": "09120000004"},
            {"first": "نازنین", "last": "قادری", "phone": "09120000005"},
            {"first": "امیر", "last": "فرهادی", "phone": "09120000006"},
            {"first": "لیدا", "last": "صادقی", "phone": "09120000007"},
            {"first": "رضا", "last": "پیری", "phone": "09120000008"},
            {"first": "پریوش", "last": "میرعلایی", "phone": "09120000009"},
            {"first": "جلال", "last": "عباسی", "phone": "09120000010"},
        ]
        
        for idx, data in enumerate(student_data, 1):
            user_number = f"student_{idx:02d}"
            password = f"student{idx:02d}"
            
            student = User(
                id=gen_uuid(),
                role=UserRole.Student,
                user_number=user_number,
                first_name=data["first"],
                last_name=data["last"],
                password_hash=hash_password(password),
                national_number=f"100{idx:07d}",
                phone_number=data["phone"],
                is_suspended=False
            )
            
            db.add(student)
            credentials.append(f"Student {idx}: {data['first']} {data['last']}")
            credentials.append(f"  Username: {user_number}")
            credentials.append(f"  Password: {password}")
            credentials.append(f"  National ID: {student.national_number}")
            credentials.append("")
        
        # Commit all users
        db.commit()
        
        # Write credentials to file
        credentials.append("=" * 70)
        credentials.append("How to use:")
        credentials.append("  1. Go to http://localhost:8000/login")
        credentials.append("  2. Enter the Username and Password from above")
        credentials.append("  3. You will be logged in as that user")
        credentials.append("=" * 70)
        
        credentials_text = "\n".join(credentials)
        
        with open(credentials_file, "w", encoding="utf-8") as f:
            f.write(credentials_text)
        
        print(f"\n✅ Created 5 teachers and 10 students")
        print(f"✅ Credentials saved to: {credentials_file}")
        print(f"\n{credentials_text}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_mock_users()

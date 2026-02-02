"""
Seed 10 professors with realistic data for testing and demonstration.
"""

from sqlalchemy.orm import Session
import uuid

from app.core.db import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.core.security import hash_password


def gen_uuid():
    return str(uuid.uuid4())


def seed_professors():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    
    try:
        professors_data = [
            {
                "user_number": "prof001",
                "first_name": "محمد",
                "last_name": "احمدی",
                "password": "prof001",
                "national_number": "1111111101",
                "phone_number": "09120000001",
            },
            {
                "user_number": "prof002",
                "first_name": "فاطمه",
                "last_name": "علوی",
                "password": "prof002",
                "national_number": "1111111102",
                "phone_number": "09120000002",
            },
            {
                "user_number": "prof003",
                "first_name": "علی",
                "last_name": "محمودی",
                "password": "prof003",
                "national_number": "1111111103",
                "phone_number": "09120000003",
            },
            {
                "user_number": "prof004",
                "first_name": "مریم",
                "last_name": "حسینی",
                "password": "prof004",
                "national_number": "1111111104",
                "phone_number": "09120000004",
            },
            {
                "user_number": "prof005",
                "first_name": "حسن",
                "last_name": "رضایی",
                "password": "prof005",
                "national_number": "1111111105",
                "phone_number": "09120000005",
            },
            {
                "user_number": "prof006",
                "first_name": "سارا",
                "last_name": "کریمی",
                "password": "prof006",
                "national_number": "1111111106",
                "phone_number": "09120000006",
            },
            {
                "user_number": "prof007",
                "first_name": "رضا",
                "last_name": "تقوی",
                "password": "prof007",
                "national_number": "1111111107",
                "phone_number": "09120000007",
            },
            {
                "user_number": "prof008",
                "first_name": "نسرین",
                "last_name": "نوری",
                "password": "prof008",
                "national_number": "1111111108",
                "phone_number": "09120000008",
            },
            {
                "user_number": "prof009",
                "first_name": "بهرام",
                "last_name": "عباسی",
                "password": "prof009",
                "national_number": "1111111109",
                "phone_number": "09120000009",
            },
            {
                "user_number": "prof010",
                "first_name": "الهام",
                "last_name": "شریفی",
                "password": "prof010",
                "national_number": "1111111110",
                "phone_number": "09120000010",
            },
        ]

        # Check if professors already exist
        existing_count = db.query(User).filter(User.role == UserRole.Professor).count()
        if existing_count >= 10:
            print(f"✅ {existing_count} professors already exist. Skipping professor creation.")
            return

        created_count = 0
        for prof_data in professors_data:
            # Check if this professor already exists
            existing = db.query(User).filter(
                User.user_number == prof_data["user_number"]
            ).first()
            
            if existing:
                print(f"⚠️  Professor {prof_data['user_number']} already exists. Skipping...")
                continue

            professor = User(
                id=gen_uuid(),
                role=UserRole.Professor,
                user_number=prof_data["user_number"],
                first_name=prof_data["first_name"],
                last_name=prof_data["last_name"],
                password_hash=hash_password(prof_data["password"]),
                national_number=prof_data["national_number"],
                phone_number=prof_data["phone_number"],
                is_suspended=False
            )
            
            db.add(professor)
            created_count += 1

        db.commit()
        print(f"✅ Created {created_count} professor(s)")
        print("   Professors can be used for course assignments and testing")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating professors: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_professors()

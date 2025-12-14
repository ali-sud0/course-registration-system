from sqlalchemy.orm import Session
import uuid

from app.core.db import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.core.security import hash_password


def gen_uuid():
    return str(uuid.uuid4())


def init_professor():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        student_exists = db.query(User).filter(
            User.role == UserRole.Student
        ).first()

        if student_exists:
            print(
                f"Some student already exists: user_number={student_exists.user_number}"
            )
            return

        student_user = User(
            id=gen_uuid(),
            role=UserRole.Student,
            user_number="esi",
            first_name="Esmail",
            last_name="Alvani",
            password_hash=hash_password("esi"),
            national_number="2222222222",
            phone_number="09160000000",
            is_suspended=False
        )

        db.add(student_user)
        db.commit()

        print(f"Default student created (user_number='{student_user.user_number}', password='esi')")

    finally:
        db.close()


if __name__ == "__main__":
    init_professor()

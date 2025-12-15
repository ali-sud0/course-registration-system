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
        professor_exists = db.query(User).filter(
            User.role == UserRole.Professor
        ).first()

        if professor_exists:
            print(
                f"Some professor already exists: user_number={professor_exists.user_number}"
            )
            return

        professor_user = User(
            id=gen_uuid(),
            role=UserRole.Professor,
            user_number="prof",
            first_name="John",
            last_name="Doe",
            password_hash=hash_password("prof"),
            national_number="1111111111",
            phone_number="09120000000",
            is_suspended=False
        )

        db.add(professor_user)
        db.commit()

        print(f"Default professor created (user_number='{professor_user.user_number}', password='prof')")

    finally:
        db.close()


if __name__ == "__main__":
    init_professor()

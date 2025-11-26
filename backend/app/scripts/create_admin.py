# scripts/create_admin.py
from app.db import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

admin_number = "0000"  # fixed admin user_number
admin = db.query(User).filter(User.user_number == admin_number).first()
if not admin:
    user = User(
        user_number=admin_number,
        first_name="Super",
        last_name="Admin",
        role=UserRole.Admin,
        password_hash=hash_password("SuperSecret123"),
        national_number="0000000000",
        phone_number="0000000000",
        is_suspended=False
    )
    db.add(user)
    db.commit()
    print("Admin created")
else:
    print("Admin already exists")
db.close()

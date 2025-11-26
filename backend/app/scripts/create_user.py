# scripts/create_user.py
from app.db import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()
u = db.query(User).filter(User.username == "alice").first()
if not u:
    user = User(username="alice", full_name="Alice Example", role="Admin", password_hash=hash_password("secret123"))
    db.add(user)
    db.commit()
    print("Created user alice / secret123")
else:
    print("User already exists")
db.close()

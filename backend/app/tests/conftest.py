import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.db import Base

from app.models.user import User
from app.models.course import Course
from app.models.semester import Semester
from app.models.course_offering import CourseOffering
from app.models.schedule_slot import ScheduleSlot
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot

# SQLite in-memory test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Now create all tables
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

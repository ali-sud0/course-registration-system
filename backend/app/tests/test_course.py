import uuid
from app.models.course import Course

def test_create_course(db_session):
    # 1️create a course instance
    course = Course(
        course_code="CS101",
        name="Introduction to Computer Science",
        units=3
    )

    # 2️add to DB
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)

    # 3️assert that it was saved
    assert course.id is not None  # UUID generated
    assert course.course_code == "CS101"
    assert course.name == "Introduction to Computer Science"
    assert course.units == 3

    # 4️fetch from DB and assert
    fetched = db_session.query(Course).filter_by(course_code="CS101").first()
    assert fetched is not None
    assert fetched.id == course.id

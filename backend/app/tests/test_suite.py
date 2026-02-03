"""Comprehensive test suite for course registration system."""

from app.core.db import SessionLocal
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.semester import Semester
from app.models.schedule_slot import ScheduleSlot
from app.models.course_offering import CourseOffering
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.prerequisite import Prerequisite
from app.core.security import hash_password, verify_password
from app.core.semester_helper import get_active_semester
from app.services.enrollment_service import enroll_student, drop_course
from datetime import date, timedelta
from uuid import uuid4


class TestResult:
    def __init__(self, name: str):
        self.name = name
        self.passed = False
        self.error = None

    def __repr__(self):
        status = "✓ PASS" if self.passed else "✗ FAIL"
        msg = f"{status} - {self.name}"
        if self.error:
            msg += f"\n      Error: {self.error}"
        return msg


def run_test(db, test_func, test_name):
    """Run a single test and return result."""
    result = TestResult(test_name)
    try:
        test_func(db)
        result.passed = True
    except Exception as e:
        result.error = str(e)
    finally:
        # Always rollback to prevent test pollution
        try:
            db.rollback()
        except:
            pass
    return result


# ==== MODEL TESTS ====

def test_user_creation(db):
    """Test creating and retrieving users."""
    unique_id = str(uuid4())[:8]
    user = User(
        id=str(uuid4()),
        role=UserRole.Student,
        user_number=f"test_user_{unique_id}",
        first_name="Test",
        last_name="User",
        password_hash=hash_password("password123"),
        national_number=str(uuid4())[:10],
        phone_number="09120000000",
        is_suspended=False
    )
    db.add(user)
    db.commit()
    
    retrieved = db.query(User).filter(User.id == user.id).first()
    assert retrieved is not None, "User not found after creation"
    assert retrieved.first_name == "Test"


def test_password_hashing(db):
    """Test password hashing and verification."""
    pwd = "secure_password"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed), "Password verification failed"
    assert not verify_password("wrong_password", hashed), "Wrong password verified"


def test_course_creation(db):
    """Test creating and retrieving courses."""
    unique_id = str(uuid4())[:8]
    course = Course(
        id=str(uuid4()),
        course_code=f"TST{unique_id}",
        name="Test Course",
        units=3
    )
    db.add(course)
    db.commit()
    
    retrieved = db.query(Course).filter(Course.id == course.id).first()
    assert retrieved is not None
    assert retrieved.units == 3


def test_semester_creation(db):
    """Test semester creation and active status."""
    unique_id = str(uuid4())[:8]
    semester = Semester(
        id=str(uuid4()),
        name=f"test_sem_{unique_id}",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=100),
        min_units=12,
        max_units=24,
        is_active=False
    )
    db.add(semester)
    db.commit()
    
    retrieved = db.query(Semester).filter(Semester.id == semester.id).first()
    assert retrieved is not None
    assert retrieved.min_units == 12


def test_schedule_slot_creation(db):
    """Test schedule slot creation."""
    from datetime import time
    slot = ScheduleSlot(
        id=str(uuid4()),
        day_of_week="sat",
        start_time=time(8, 0),
        end_time=time(10, 0)
    )
    db.add(slot)
    db.commit()
    
    retrieved = db.query(ScheduleSlot).filter(ScheduleSlot.day_of_week == "sat").first()
    assert retrieved is not None


# ==== INTEGRATION TESTS ====

def test_course_offering_creation(db):
    """Test creating course offering with professor and course."""
    unique_id = str(uuid4())[:8]
    prof = User(
        id=str(uuid4()),
        role=UserRole.Professor,
        user_number=f"prof_test_{unique_id}",
        first_name="Prof",
        last_name="Test",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09120000000"
    )
    course = Course(
        id=str(uuid4()),
        course_code=f"OFFER{unique_id}",
        name="Offering Test Course",
        units=4
    )
    
    active_sem = db.query(Semester).filter(Semester.is_active == True).first()
    assert active_sem is not None, "No active semester found"
    
    db.add(prof)
    db.add(course)
    db.commit()
    
    offering = CourseOffering(
        id=str(uuid4()),
        course_id=course.id,
        professor_id=prof.id,
        semester_id=active_sem.id,
        group_number=1,
        capacity=30
    )
    db.add(offering)
    db.commit()
    
    retrieved = db.query(CourseOffering).filter(CourseOffering.id == offering.id).first()
    assert retrieved is not None
    assert retrieved.capacity == 30


def test_enrollment_creation(db):
    """Test creating an enrollment."""
    unique_id = str(uuid4())[:8]
    student = User(
        id=str(uuid4()),
        role=UserRole.Student,
        user_number=f"enroll_test_{unique_id}",
        first_name="Student",
        last_name="Test",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09160000000"
    )
    course = Course(
        id=str(uuid4()),
        course_code=f"ENROLL{unique_id}",
        name="Enrollment Test",
        units=3
    )
    prof = User(
        id=str(uuid4()),
        role=UserRole.Professor,
        user_number=f"prof_enroll_{unique_id}",
        first_name="Prof",
        last_name="Enroll",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09120000000"
    )
    
    active_sem = db.query(Semester).filter(Semester.is_active == True).first()
    
    db.add_all([student, course, prof])
    db.commit()
    
    offering = CourseOffering(
        id=str(uuid4()),
        course_id=course.id,
        professor_id=prof.id,
        semester_id=active_sem.id,
        group_number=1,
        capacity=30
    )
    db.add(offering)
    db.commit()
    
    enrollment = Enrollment(
        id=str(uuid4()),
        student_id=student.id,
        offering_id=offering.id,
        status=EnrollmentStatus.enrolled
    )
    db.add(enrollment)
    db.commit()
    
    retrieved = db.query(Enrollment).filter(Enrollment.id == enrollment.id).first()
    assert retrieved is not None
    assert retrieved.status == EnrollmentStatus.enrolled


def test_prerequisite_creation(db):
    """Test creating prerequisite relationships."""
    unique_id = str(uuid4())[:8]
    course1 = Course(
        id=str(uuid4()),
        course_code=f"PREREQ{unique_id}_BASE",
        name="Base Course",
        units=3
    )
    course2 = Course(
        id=str(uuid4()),
        course_code=f"PREREQ{unique_id}_ADV",
        name="Advanced Course",
        units=4
    )
    
    db.add_all([course1, course2])
    db.commit()
    
    prereq = Prerequisite(
        id=str(uuid4()),
        course_id=course2.id,
        prerequisite_course_id=course1.id
    )
    db.add(prereq)
    db.commit()
    
    retrieved = db.query(Prerequisite).filter(Prerequisite.course_id == course2.id).first()
    assert retrieved is not None
    assert retrieved.prerequisite_course_id == course1.id


# ==== BUSINESS LOGIC TESTS ====

def test_get_active_semester(db):
    """Test get_active_semester helper."""
    active = get_active_semester(db)
    assert active is not None, "No active semester found"
    assert active.is_active == True


def test_capacity_validation(db):
    """Test that enrollment respects capacity."""
    from app.routers.utils.check_capacity import check_capacity
    from fastapi import HTTPException
    
    unique_id = str(uuid4())[:8]
    prof = User(
        id=str(uuid4()),
        role=UserRole.Professor,
        user_number=f"cap_prof_{unique_id}",
        first_name="Prof",
        last_name="Cap",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09120000000"
    )
    course = Course(
        id=str(uuid4()),
        course_code=f"CAP{unique_id}",
        name="Capacity Test",
        units=3
    )
    active_sem = db.query(Semester).filter(Semester.is_active == True).first()
    
    db.add_all([prof, course])
    db.commit()
    
    # Create offering with capacity 1
    offering = CourseOffering(
        id=str(uuid4()),
        course_id=course.id,
        professor_id=prof.id,
        semester_id=active_sem.id,
        group_number=1,
        capacity=1
    )
    db.add(offering)
    db.commit()
    
    # First student should pass
    student1 = User(
        id=str(uuid4()),
        role=UserRole.Student,
        user_number=f"cap_std_{unique_id}",
        first_name="Student",
        last_name="One",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09160000000"
    )
    db.add(student1)
    db.commit()
    
    check_capacity(db, offering)  # Should pass
    
    # Add enrollment to fill capacity
    enr = Enrollment(
        id=str(uuid4()),
        student_id=student1.id,
        offering_id=offering.id,
        status=EnrollmentStatus.enrolled
    )
    db.add(enr)
    db.commit()
    
    # Second student should fail
    try:
        check_capacity(db, offering)
        assert False, "Capacity check should have raised exception"
    except HTTPException:
        pass  # Expected


def test_unit_limit_validation(db):
    """Test unit limit enforcement."""
    from app.routers.utils.check_unit_limit import check_unit_limit
    from fastapi import HTTPException
    
    unique_id = str(uuid4())[:8]
    student = User(
        id=str(uuid4()),
        role=UserRole.Student,
        user_number=f"unit_std_{unique_id}",
        first_name="Student",
        last_name="Units",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09160000000"
    )
    prof = User(
        id=str(uuid4()),
        role=UserRole.Professor,
        user_number=f"unit_prof_{unique_id}",
        first_name="Prof",
        last_name="Units",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09120000000"
    )
    active_sem = db.query(Semester).filter(Semester.is_active == True).first()
    
    # Create course with 26 units (exceeds max_units of 24)
    course = Course(
        id=str(uuid4()),
        course_code=f"UNIT{unique_id}",
        name="Unit Test",
        units=26
    )
    
    db.add_all([student, prof, course])
    db.commit()
    
    offering = CourseOffering(
        id=str(uuid4()),
        course_id=course.id,
        professor_id=prof.id,
        semester_id=active_sem.id,
        group_number=1,
        capacity=30
    )
    db.add(offering)
    db.commit()
    
    # Should raise exception (26 > 24 max)
    try:
        check_unit_limit(db, student.id, active_sem, offering)
        assert False, "Unit limit check should have raised exception"
    except HTTPException:
        pass  # Expected


def test_enrollment_flow(db):
    """Test complete enrollment flow: enroll and drop."""
    unique_id = str(uuid4())[:8]
    student = User(
        id=str(uuid4()),
        role=UserRole.Student,
        user_number=f"flow_std_{unique_id}",
        first_name="Student",
        last_name="Flow",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09160000000"
    )
    prof = User(
        id=str(uuid4()),
        role=UserRole.Professor,
        user_number=f"flow_prof_{unique_id}",
        first_name="Prof",
        last_name="Flow",
        password_hash=hash_password("pwd"),
        national_number=str(uuid4())[:10],
        phone_number="09120000000"
    )
    # Course with 4 units (to be dropped later)
    course1 = Course(
        id=str(uuid4()),
        course_code=f"FLOW{unique_id}_A",
        name="Flow Test A",
        units=4
    )
    # Course with 20 units (to maintain min after dropping course1)
    course2 = Course(
        id=str(uuid4()),
        course_code=f"FLOW{unique_id}_B",
        name="Flow Test B",
        units=20
    )
    active_sem = db.query(Semester).filter(Semester.is_active == True).first()
    
    db.add_all([student, prof, course1, course2])
    db.commit()
    
    offering1 = CourseOffering(
        id=str(uuid4()),
        course_id=course1.id,
        professor_id=prof.id,
        semester_id=active_sem.id,
        group_number=1,
        capacity=30
    )
    offering2 = CourseOffering(
        id=str(uuid4()),
        course_id=course2.id,
        professor_id=prof.id,
        semester_id=active_sem.id,
        group_number=1,
        capacity=30
    )
    db.add_all([offering1, offering2])
    db.commit()
    
    # Enroll in both courses
    enrollment1 = enroll_student(db, student.id, offering1.id)
    assert enrollment1.status == EnrollmentStatus.enrolled
    
    enrollment2 = enroll_student(db, student.id, offering2.id)
    assert enrollment2.status == EnrollmentStatus.enrolled
    
    # Verify both enrolled
    check1 = db.query(Enrollment).filter(Enrollment.id == enrollment1.id).first()
    assert check1.status == EnrollmentStatus.enrolled
    
    check2 = db.query(Enrollment).filter(Enrollment.id == enrollment2.id).first()
    assert check2.status == EnrollmentStatus.enrolled
    
    # Drop the 4-unit course (still have 20 units, which meets minimum)
    drop_course(db, student.id, enrollment1.id)
    
    # Verify dropped
    check = db.query(Enrollment).filter(Enrollment.id == enrollment1.id).first()
    assert check.status == EnrollmentStatus.dropped


# ==== TEST REGISTRY ====

TESTS = [
    ("Model: User Creation", test_user_creation),
    ("Model: Password Hashing", test_password_hashing),
    ("Model: Course Creation", test_course_creation),
    ("Model: Semester Creation", test_semester_creation),
    ("Model: Schedule Slot Creation", test_schedule_slot_creation),
    ("Integration: Course Offering", test_course_offering_creation),
    ("Integration: Enrollment Creation", test_enrollment_creation),
    ("Integration: Prerequisites", test_prerequisite_creation),
    ("Logic: Active Semester", test_get_active_semester),
    ("Logic: Capacity Validation", test_capacity_validation),
    ("Logic: Unit Limit Validation", test_unit_limit_validation),
    ("Flow: Complete Enrollment", test_enrollment_flow),
]

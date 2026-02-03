"""
Seed comprehensive course offerings and prerequisite relationships.
Assigns courses to professors and creates prerequisite chains for realistic curriculum flow.
"""

from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from app.core.db import SessionLocal, Base, engine
from app.models.course import Course
from app.models.course_offering import CourseOffering
from app.models.course_offering_schedule_slot import CourseOfferingScheduleSlot
from app.models.user import User, UserRole
from app.models.semester import Semester
from app.models.schedule_slot import ScheduleSlot
from app.models.prerequisite import Prerequisite


def gen_uuid():
    return str(uuid.uuid4())


def seed_offerings_and_prerequisites():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    
    try:
        # Get all courses, professors, and active semester
        courses = db.query(Course).all()
        professors = db.query(User).filter(User.role == UserRole.Professor).all()
        semester = db.query(Semester).filter(Semester.is_active == True).first()
        schedule_slots = db.query(ScheduleSlot).all()

        if not courses:
            print("❌ No courses found. Run seed_multiple_courses.py first.")
            return

        if not professors:
            print("❌ No professors found. Run seed_multiple_professors.py first.")
            return

        if not semester:
            print("❌ No active semester found. Run init_semester.py first.")
            return

        if not schedule_slots:
            print("❌ No schedule slots found. Run init_schedule_slots.py first.")
            return

        # Define prerequisite relationships (course_code -> list of prerequisite course_codes)
        prerequisite_map = {
            "CS102": ["CS101"],  # Advanced programming requires basic programming
            "CS201": ["CS101"],  # Data structures requires basic programming
            "CS202": ["CS201"],  # Algorithms requires data structures
            "CS301": ["CS201"],  # Database systems requires data structures
            "CS302": ["CS301"],  # Data modeling requires database systems
            "CS310": ["CS101"],  # Web backend requires basic programming
            "CS311": ["CS310"],  # Web frontend requires web backend
            "CS401": ["CS201", "CS102"],  # Software engineering requires programming + data structures
            "CS402": ["CS401"],  # QA requires software engineering
            "CS450": ["MATH102", "CS201"],  # AI requires discrete math + data structures
            "CS451": ["CS450"],  # Machine learning requires AI
            "CS501": ["CS201"],  # OS requires data structures
            "CS502": ["CS501"],  # Networks requires OS
            "CS510": ["CS501", "CS502"],  # Security requires OS + Networks
            "CS511": ["CS510"],  # Cryptography requires security
            "MATH102": ["MATH101"],  # Discrete math requires math 1
            "PHYS102": ["PHYS101"],  # Physics 2 requires physics 1
        }

        # Create course offerings (assign courses to professors with schedule slots)
        offerings_created = 0
        existing_offerings = db.query(CourseOffering).count()
        
        if existing_offerings > 0:
            print(f"⚠️  {existing_offerings} course offerings already exist. Skipping offerings creation.")
        else:
            for i, course in enumerate(courses):
                # Cycle through available professors
                professor = professors[i % len(professors)]
                
                # Cycle through schedule slots (2 slots per offering)
                slot_indices = [(i * 2) % len(schedule_slots), (i * 2 + 1) % len(schedule_slots)]
                
                offering = CourseOffering(
                    id=gen_uuid(),
                    course_id=course.id,
                    professor_id=professor.id,
                    semester_id=semester.id,
                    capacity=30,
                    enrolled_count=0,
                    semester_status="planned"
                )
                
                db.add(offering)
                db.flush()  # Flush to get the offering ID
                
                # Assign schedule slots to this offering
                for slot_idx in slot_indices:
                    slot = schedule_slots[slot_idx]
                    offering_slot = CourseOfferingScheduleSlot(
                        id=gen_uuid(),
                        course_offering_id=offering.id,
                        schedule_slot_id=slot.id
                    )
                    db.add(offering_slot)
                
                offerings_created += 1
            
            db.commit()
            print(f"✅ Created {offerings_created} course offering(s)")

        # Create prerequisite relationships
        prerequisites_created = 0
        existing_prereqs = db.query(Prerequisite).count()
        
        if existing_prereqs > 0:
            print(f"⚠️  {existing_prereqs} prerequisite relationships already exist. Skipping prerequisites creation.")
        else:
            course_map = {course.course_code: course.id for course in courses}
            
            for course_code, prereq_codes in prerequisite_map.items():
                if course_code not in course_map:
                    continue
                
                course_id = course_map[course_code]
                
                for prereq_code in prereq_codes:
                    if prereq_code not in course_map:
                        print(f"⚠️  Prerequisite course {prereq_code} not found. Skipping...")
                        continue
                    
                    prereq_id = course_map[prereq_code]
                    
                    # Check if prerequisite already exists
                    existing = db.query(Prerequisite).filter(
                        Prerequisite.course_id == course_id,
                        Prerequisite.prerequisite_course_id == prereq_id
                    ).first()
                    
                    if existing:
                        continue
                    
                    prerequisite = Prerequisite(
                        id=gen_uuid(),
                        course_id=course_id,
                        prerequisite_course_id=prereq_id
                    )
                    
                    db.add(prerequisite)
                    prerequisites_created += 1
            
            db.commit()
            print(f"✅ Created {prerequisites_created} prerequisite relationship(s)")

        print("\n✅ Offerings and prerequisites seeding completed successfully!")
        print(f"   - {offerings_created} course offerings created")
        print(f"   - {prerequisites_created} prerequisite relationships established")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding offerings and prerequisites: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_offerings_and_prerequisites()

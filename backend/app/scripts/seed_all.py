#!/usr/bin/env python3
"""
Master seeding script - runs all seed scripts in the correct order.
This script initializes the complete system with sample data for testing and demonstration.

Usage:
    python3 seed_all.py

The script will:
1. Create database tables (via SQLAlchemy)
2. Seed the semester configuration
3. Seed schedule slots (time slots for classes)
4. Create an admin user
5. Create 10 professors
6. Create 10 students
7. Create 20 courses
8. Create course offerings and prerequisite relationships
"""

import sys
import os

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.scripts.init_semester import seed_semester
from app.scripts.init_schedule_slots import init_schedule_slots
from app.scripts.init_admin import init_admin
from app.scripts.seed_multiple_professors import seed_professors
from app.scripts.seed_multiple_students import seed_students
from app.scripts.seed_multiple_courses import seed_courses
from app.scripts.seed_offerings_and_prerequisites import seed_offerings_and_prerequisites


def run_all_seeds():
    """Run all seed scripts in order"""
    print("=" * 70)
    print("Course Registration System - Complete Database Seeding")
    print("=" * 70)
    print()

    steps = [
        ("Seeding Semester", seed_semester),
        ("Seeding Schedule Slots", init_schedule_slots),
        ("Seeding Admin User", init_admin),
        ("Seeding 10 Professors", seed_professors),
        ("Seeding 10 Students", seed_students),
        ("Seeding 20 Courses", seed_courses),
        ("Seeding Course Offerings & Prerequisites", seed_offerings_and_prerequisites),
    ]

    completed = 0
    failed = 0

    for step_name, step_func in steps:
        try:
            print(f"\n📋 Step {completed + 1}/{len(steps)}: {step_name}")
            print("-" * 70)
            step_func()
            completed += 1
        except Exception as e:
            print(f"❌ Failed at step: {step_name}")
            print(f"   Error: {e}")
            failed += 1
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 70)
    print("Seeding Summary")
    print("=" * 70)
    print(f"✅ Completed: {completed}/{len(steps)} steps")
    if failed > 0:
        print(f"❌ Failed: {failed}/{len(steps)} steps")
    else:
        print("✅ All seeding completed successfully!")

    print("\nSystem is ready for testing! 🎉")
    print("\nDefault Test Credentials:")
    print("  Admin:      user_number='admin',     password='admin'")
    print("  Professor:  user_number='prof001',   password='prof001'")
    print("  Student:    user_number='std001',    password='std001'")
    print("\nMore credentials are available for prof002-prof010 and std002-std010")
    print("=" * 70)

    return failed == 0


if __name__ == "__main__":
    success = run_all_seeds()
    sys.exit(0 if success else 1)

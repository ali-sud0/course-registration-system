# app/main.py
from fastapi import FastAPI
from app.core.db import engine, Base
from app.routers import auth, protected, prerequisite, semester, course_offering, enrollment
from app.routers import course
from app.routers import schedule_slots
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path

import app.models
from app.tests.test_runner import run_tests

# print(">>> Creating tables...")
# print(">>> Known tables:", Base.metadata.tables.keys())

# create DB tables
Base.metadata.create_all(bind=engine)


# Startup event - run tests when server starts
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run tests
    print("\n" + "="*70)
    print("SERVER STARTUP - Running Unit Tests")
    print("="*70)
    tests_passed = run_tests()
    
    if not tests_passed:
        print("\n⚠️  WARNING: Some tests failed, but server is continuing...")
    
    yield
    
    # Shutdown: cleanup if needed
    print("\nServer shutting down...")


app = FastAPI(title="CRS Backend with JWT Auth", lifespan=lifespan)

origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve HTML templates FIRST (before API routes)
templates_path = Path(__file__).parent / "templates"

@app.get("/")
async def root():
    """Serve home page"""
    return FileResponse(str(templates_path / "index.html"), media_type="text/html")

@app.get("/login")
async def login_page():
    """Serve login page"""
    return FileResponse(str(templates_path / "login.html"), media_type="text/html")

# ADMIN ROUTES
@app.get("/admin/courses")
async def admin_courses_page():
    """Serve courses page for admin"""
    return FileResponse(str(templates_path / "admin-courses.html"), media_type="text/html")

@app.get("/admin/course-offerings")
async def admin_course_offerings_page():
    """Serve course offerings page for admin"""
    return FileResponse(str(templates_path / "admin-course-offerings.html"), media_type="text/html")

@app.get("/admin/professors")
async def admin_professors_page():
    """Serve professors page for admin"""
    return FileResponse(str(templates_path / "admin-professors.html"), media_type="text/html")

@app.get("/admin/students")
async def admin_students_page():
    """Serve students page for admin"""
    return FileResponse(str(templates_path / "admin-students.html"), media_type="text/html")

@app.get("/admin/settings")
async def admin_settings_page():
    """Serve settings page for admin"""
    return FileResponse(str(templates_path / "admin-settings.html"), media_type="text/html")

# PROFESSOR ROUTES
@app.get("/professors/courses")
async def professor_courses_page():
    """Serve courses page for professor"""
    return FileResponse(str(templates_path / "courses.html"), media_type="text/html")

@app.get("/professors/my-offered-courses")
async def professor_offered_courses_page():
    """Serve professor's courses with enrollments"""
    return FileResponse(str(templates_path / "professor-courses.html"), media_type="text/html")

@app.get("/professors/settings")
async def professor_settings_page():
    """Serve settings page for professor"""
    return FileResponse(str(templates_path / "settings.html"), media_type="text/html")

# STUDENT ROUTES
@app.get("/students/courses")
async def student_courses_page():
    """Serve courses page for student"""
    return FileResponse(str(templates_path / "students-courses.html"), media_type="text/html")

@app.get("/students/course-offerings")
async def student_course_offerings_page():
    """Serve course offerings page for student"""
    return FileResponse(str(templates_path / "students-course-offerings.html"), media_type="text/html")

@app.get("/students/enrollment")
async def student_enrollment_page():
    """Serve enrollment page for students"""
    return FileResponse(str(templates_path / "students-enrollment.html"), media_type="text/html")

@app.get("/students/schedule")
async def student_schedule_page():
    """Serve student schedule/timetable page"""
    return FileResponse(str(templates_path / "schedule.html"), media_type="text/html")

@app.get("/students/settings")
async def student_settings_page():
    """Serve settings page for student"""
    return FileResponse(str(templates_path / "settings.html"), media_type="text/html")

# Keep old /page/* routes for backward compatibility
@app.get("/page/courses")
async def courses_page():
    """Serve courses page"""
    return FileResponse(str(templates_path / "courses.html"), media_type="text/html")

@app.get("/page/course-offerings")
async def course_offerings_page():
    """Serve course offerings page"""
    return FileResponse(str(templates_path / "offerings.html"), media_type="text/html")

@app.get("/page/settings")
async def settings_page():
    """Serve settings page"""
    return FileResponse(str(templates_path / "settings.html"), media_type="text/html")

@app.get("/page/professors")
async def professors_page():
    """Serve professors page"""
    return FileResponse(str(templates_path / "professors.html"), media_type="text/html")

@app.get("/page/students")
async def students_page():
    """Serve students page"""
    return FileResponse(str(templates_path / "students.html"), media_type="text/html")

@app.get("/page/enroll")
async def enroll_page():
    """Serve enrollment page for students"""
    return FileResponse(str(templates_path / "enroll.html"), media_type="text/html")

@app.get("/page/schedule")
async def schedule_page():
    """Serve student schedule/timetable page"""
    return FileResponse(str(templates_path / "schedule.html"), media_type="text/html")

@app.get("/page/professor-courses")
async def professor_courses_page_legacy():
    """Serve professor's courses with enrollments"""
    return FileResponse(str(templates_path / "professor-courses.html"), media_type="text/html")

@app.get("/admin/dashboard")
async def admin_dashboard_page():
    """Serve admin dashboard"""
    return FileResponse(str(templates_path / "admin-dashboard.html"), media_type="text/html")

@app.get("/professors/dashboard")
async def professor_dashboard_page():
    """Serve professor dashboard"""
    return FileResponse(str(templates_path / "professor-dashboard.html"), media_type="text/html")

@app.get("/students/dashboard")
async def student_dashboard_page():
    """Serve student dashboard"""
    return FileResponse(str(templates_path / "student-dashboard.html"), media_type="text/html")

# Include API routers
app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(course.router)
app.include_router(prerequisite.router)
app.include_router(semester.router)
app.include_router(course_offering.router)
app.include_router(enrollment.router)
app.include_router(schedule_slots.router)

# Serve static files (CSS, JS, images, fonts) - must be last
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")
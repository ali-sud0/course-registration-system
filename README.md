# Course Registration System — Backend Setup Guide

## Overview

This guide provides complete step-by-step instructions to set up and run the **Course Registration System** backend on your machine. The system is a modern REST API built with FastAPI that manages course registration, enrollments, user authentication, and schedule management for an educational institution.

Whether you're setting up the system for demonstration, testing, or development, this guide will walk you through every step required to get the backend running with sample data.

**Estimated setup time:** 15-20 minutes (depending on internet speed)

---

## Technology Stack

### Backend Framework & Web Server
- **FastAPI**: Modern async Python web framework for building REST APIs
- **Uvicorn**: ASGI web server for running FastAPI applications (with auto-reload in development)

### Database & ORM
- **PostgreSQL**: Relational database for courses, users, enrollments, semesters, etc.
- **SQLAlchemy**: Python ORM for database abstraction and model definitions
- **psycopg2-binary**: PostgreSQL adapter for Python

### Authentication & Security
- **JWT (JSON Web Tokens)**: Bearer token-based authentication
  - Access tokens: short-lived tokens for API requests
  - Refresh tokens: long-lived tokens for obtaining new access tokens
- **Password hashing**: Secure password storage (bcrypt-based)
- **Role-Based Access Control (RBAC)**: Three roles
  - Admin: full system access
  - Professor: manage courses and view enrollments
  - Student: enroll in courses and view schedule

### Data Validation
- **Pydantic**: Schema validation for request/response models

### Frontend (Static assets served by backend)
- **HTML5**: Templating for all pages
- **CSS3**: Custom styling
- **Vanilla JavaScript**: Client-side logic and API communication

### Complete Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| Backend Server | FastAPI + Uvicorn |
| Database Driver | SQLAlchemy + psycopg2-binary |
| Database | PostgreSQL 12+ |
| Authentication | JWT (HS256) + bcrypt |
| Authorization | Role-Based Access Control |
| Data Validation | Pydantic |
| Frontend | HTML5 + CSS3 + Vanilla JavaScript |
| Deployment | Python venv, pip, git |

---

## Prerequisites & System Requirements

Ensure your system has the following before starting:

- **Python 3.10 or higher** - Check: `python3 --version`
- **PostgreSQL Server 12+** - Check: `psql --version`
- **Git** - For cloning the repository
- **pip** - Python package manager (comes with Python)
- **At least 500MB free disk space**
- **Administrator/sudo access** on your machine

### Supported Operating Systems
- ✅ **Linux** (Ubuntu 20.04+, Debian 11+, etc.)
- ✅ **macOS** (10.14+)
- ✅ **Windows** (via WSL2 recommended, or native Python)

---

## Complete Installation Guide - Step by Step

### Step 1: Install PostgreSQL Database Server

PostgreSQL is the database that stores all system data.

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-client
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### On macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### On Windows:
1. Download installer: https://www.postgresql.org/download/windows/
2. Run the installer
3. Follow the setup wizard
4. Remember the `postgres` user password

#### Verify PostgreSQL is installed and running:
```bash
psql --version
# Output should show: psql (PostgreSQL) 12.x or higher
```

---

### Step 2: Create the Database and Database User

PostgreSQL requires a database and user account for the application.

**Run these commands:**

**On Linux/macOS:**
```bash
sudo -u postgres psql
```

**On Windows:**
```bash
psql -U postgres
```

**Then execute these SQL commands in the PostgreSQL prompt:**

```sql
-- Create database user/role with password
CREATE ROLE postgres WITH LOGIN PASSWORD '123456';

-- Create the database owned by postgres user
CREATE DATABASE "courseRegistrationSystem" OWNER postgres;

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE "courseRegistrationSystem" TO postgres;

-- Exit psql prompt
\q
```

**Verify the database was created:**
```bash
psql -U postgres -d courseRegistrationSystem -h localhost -c "\dt"
```

You should see an empty database (tables will be created by the application).

---

### Step 3: Clone the Repository

```bash
git clone https://github.com/ali-sud0/course-registration-system.git
cd course-registration-system/backend
```

---

### Step 4: Create and Activate Python Virtual Environment

A virtual environment isolates this project's dependencies from your system Python.

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On Linux/macOS:
source venv/bin/activate

# On Windows (Command Prompt):
venv\Scripts\activate

# On Windows (PowerShell):
venv\Scripts\Activate.ps1
```

You should see `(venv)` prefix in your terminal prompt.

---

### Step 5: Install Python Dependencies

With the virtual environment active, install all required packages:

```bash
# Upgrade pip (recommended)
pip install --upgrade pip

# Install all dependencies from requirements.txt
pip install -r requirements.txt
```

**Key packages installed:**
- `fastapi==0.121.3` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy==2.0.44` - Database ORM
- `psycopg2-binary==2.9.11` - PostgreSQL driver
- `python-jose==3.5.0` - JWT token handling
- `passlib==1.7.4` - Password hashing
- `pydantic==2.12.4` - Data validation

Installation takes 2-3 minutes.

---

### Step 6: Verify Database Connection (Optional)

The backend connects to PostgreSQL using a connection string in `app/core/db.py`.

**Default connection settings:**
```python
DATABASE_URL = "postgresql://postgres:123456@localhost/courseRegistrationSystem"
```

**If your setup differs**, edit this file and update:
- `postgres` - Your database user (if different)
- `123456` - Your database password (if different)
- `localhost` - Your database host (if not local)
- `courseRegistrationSystem` - Your database name (if different)

```bash
# Edit with your favorite editor
nano app/core/db.py
# or
code app/core/db.py  # VS Code
```

---

### Step 7: Initialize Database and Seed Sample Data

The system includes comprehensive seeding scripts that create the database schema and populate it with sample data for testing.

**Run the master seed script** (this is the easiest method):

```bash
python3 app/scripts/seed_all.py
```

This single command will:
1. ✅ Create all database tables
2. ✅ Seed semester configuration
3. ✅ Create class schedule time slots
4. ✅ Create 1 admin user
5. ✅ Create 10 professor accounts
6. ✅ Create 10 student accounts
7. ✅ Create 20 comprehensive courses
8. ✅ Create course offerings (assign courses to professors)
9. ✅ Create prerequisite relationships between courses

**Expected output:**
```
======================================================================
Course Registration System - Complete Database Seeding
======================================================================

📋 Step 1/7: Seeding Semester
----------------------------------------------------------------------
✅ Seeded semester: 1404-1

📋 Step 2/7: Seeding Schedule Slots
----------------------------------------------------------------------
✅ Schedule slots initialized successfully

📋 Step 3/7: Seeding Admin User
----------------------------------------------------------------------
✅ Default admin created with user_number='admin' and password='admin'

📋 Step 4/7: Seeding 10 Professors
----------------------------------------------------------------------
✅ Created 10 professor(s)

📋 Step 5/7: Seeding 10 Students
----------------------------------------------------------------------
✅ Created 10 student(s)

📋 Step 6/7: Seeding 20 Courses
----------------------------------------------------------------------
✅ Created 20 course(s)

📋 Step 7/7: Seeding Course Offerings & Prerequisites
----------------------------------------------------------------------
✅ Created 20 course offering(s)
✅ Created 16 prerequisite relationship(s)

======================================================================
All seeding completed successfully!
System is ready for testing! 🎉
======================================================================
```

#### If you prefer to run scripts individually:

```bash
# 1. Initialize semester
python3 app/scripts/init_semester.py

# 2. Initialize schedule slots
python3 app/scripts/init_schedule_slots.py

# 3. Create admin user
python3 app/scripts/init_admin.py

# 4. Create 10 professors
python3 app/scripts/seed_multiple_professors.py

# 5. Create 10 students
python3 app/scripts/seed_multiple_students.py

# 6. Create 20 courses
python3 app/scripts/seed_multiple_courses.py

# 7. Create course offerings and prerequisites
python3 app/scripts/seed_offerings_and_prerequisites.py
```

---

### Step 8: Start the Backend Server

With the database initialized and seeded, start the FastAPI development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

The server is now running! 🎉

---

### Step 9: Test the Backend

Open a new terminal (keep the server running) and test the login endpoint:

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_number":"admin","password":"admin"}'
```

**Expected response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user_id": "...",
  "role": "Admin"
}
```

✅ If you see this, the backend is working correctly!

---

## Available Test User Credentials

The seeding process creates the following accounts:

### Admin Account
```
Username: admin
Password: admin
```

### Professor Accounts (10 total)
```
prof001 / prof001
prof002 / prof002
prof003 / prof003
prof004 / prof004
prof005 / prof005
prof006 / prof006
prof007 / prof007
prof008 / prof008
prof009 / prof009
prof010 / prof010
```

### Student Accounts (10 total)
```
std001 / std001
std002 / std002
std003 / std003
std004 / std004
std005 / std005
std006 / std006
std007 / std007
std008 / std008
std009 / std009
std010 / std010
```

---

## Accessing the System

### Interactive API Documentation
Once the server is running, open these in your browser:

- **Swagger UI (Interactive):** http://127.0.0.1:8000/docs
- **ReDoc (Beautiful Docs):** http://127.0.0.1:8000/redoc

These allow you to test all API endpoints directly in your browser!

### Frontend Web Interface
- **Main Interface:** http://127.0.0.1:8000

Log in using any of the test credentials above and explore the system!

### Key API Endpoints
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /semesters/active/current` - Get active semester
- `GET /courses` - List all courses
- `GET /course-offerings` - List course offerings
- `POST /enrollments` - Enroll in a course
- `GET /users/profile` - Get your profile

---

## Database Schema Overview

The system creates these main tables:

- **users** - Admin, Professor, and Student accounts
- **courses** - Course definitions (CS101, etc.)
- **course_offerings** - Course instances assigned to professors
- **enrollments** - Student enrollments in course offerings
- **semesters** - Academic semesters (1404-1, etc.)
- **schedule_slots** - Time slots for classes
- **prerequisites** - Course prerequisite relationships

---

## Project File Structure

```
backend/
├── app/
│   ├── main.py                          # FastAPI application entry point
│   ├── dependencies.py                  # Shared dependencies
│   ├── core/
│   │   ├── db.py                       # Database configuration
│   │   ├── security.py                 # Password hashing & authentication
│   │   └── semester_helper.py          # Semester utilities
│   ├── models/                         # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── course_offering.py
│   │   ├── enrollment.py
│   │   ├── semester.py
│   │   ├── schedule_slot.py
│   │   └── prerequisite.py
│   ├── schemas/                        # Pydantic request/response schemas
│   ├── routers/                        # API endpoint routes
│   │   ├── auth.py                    # Login/refresh endpoints
│   │   ├── course.py                  # Course endpoints
│   │   ├── course_offering.py
│   │   ├── enrollment.py              # Enrollment endpoints
│   │   ├── semester.py
│   │   └── utils/                     # Helper functions
│   ├── scripts/                        # Data seeding scripts ⭐
│   │   ├── seed_all.py                # Master seeding script
│   │   ├── init_semester.py           # Seed semester
│   │   ├── init_schedule_slots.py     # Seed time slots
│   │   ├── init_admin.py              # Seed admin user
│   │   ├── seed_multiple_professors.py # Seed 10 professors
│   │   ├── seed_multiple_students.py   # Seed 10 students
│   │   ├── seed_multiple_courses.py    # Seed 20 courses
│   │   └── seed_offerings_and_prerequisites.py
│   ├── services/                       # Business logic
│   │   └── enrollment_service.py
│   ├── static/                         # Static assets
│   │   ├── css/                       # Stylesheets
│   │   ├── js/                        # JavaScript files
│   │   ├── images/                    # Images and logos
│   │   └── font/                      # Custom fonts
│   ├── templates/                      # HTML pages
│   │   ├── login.html
│   │   ├── student-dashboard.html
│   │   ├── professor-dashboard.html
│   │   ├── admin-dashboard.html
│   │   └── ... (other pages)
│   └── tests/                          # Unit and integration tests
├── requirements.txt                    # Python dependencies
├── README.md                           # This file
└── run_tests.sh                        # Test runner script
```

---

## Troubleshooting

### PostgreSQL Connection Error
**Error:** `could not connect to server: Connection refused`

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Linux/macOS
   sudo systemctl status postgresql
   
   # macOS with Homebrew
   brew services list | grep postgresql
   ```

2. Check connection settings in `app/core/db.py`

3. Verify the database exists:
   ```bash
   psql -U postgres -l | grep courseRegistrationSystem
   ```

### psycopg2 Installation Error
**Error:** `ModuleNotFoundError: No module named 'psycopg2'`

**Solution:**
```bash
pip install psycopg2-binary --force-reinstall
```

### Database Table Errors
**Error:** `(psycopg2.errors.UndefinedTable)`

**Solution:** Run the seed script:
```bash
python3 app/scripts/seed_all.py
```

### Port 8000 Already in Use
**Error:** `Address already in use`

**Solutions:**
```bash
# Option 1: Kill the process
lsof -i :8000
kill -9 <PID>

# Option 2: Use a different port
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

### Virtual Environment Not Activated
**Problem:** `(venv)` doesn't appear in your prompt

**Solution:**
```bash
# Make sure you're in the backend directory
cd course-registration-system/backend

# Activate again
source venv/bin/activate  # Linux/macOS
# OR
venv\Scripts\activate  # Windows
```

### Module Import Errors
**Error:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
```bash
# Make sure you're in the backend/ directory
cd course-registration-system/backend

# Make sure venv is activated
source venv/bin/activate  # Linux/macOS
```

---

## Advanced Configuration

### Using Environment Variables

Instead of editing `app/core/db.py`, use environment variables:

```bash
# Set before running
export DATABASE_URL="postgresql://postgres:123456@localhost/courseRegistrationSystem"

# Then run
uvicorn app.main:app --reload
```

### Production Deployment

For production use multiple workers:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Database Backup

```bash
# Backup database
pg_dump -U postgres courseRegistrationSystem > backup.sql

# Restore from backup
psql -U postgres courseRegistrationSystem < backup.sql
```

### Clear and Reseed Everything

```bash
# Stop the server (Ctrl+C)

# Drop and recreate the database
sudo -u postgres psql
DROP DATABASE IF EXISTS "courseRegistrationSystem";
CREATE DATABASE "courseRegistrationSystem" OWNER postgres;
\q

# Re-run seeding
python3 app/scripts/seed_all.py

# Start server again
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## Running Tests

The project includes unit and integration tests:

```bash
# Run all tests
python3 -m pytest app/tests/

# Run with verbose output
python3 -m pytest app/tests/ -v

# Run a specific test file
python3 -m pytest app/tests/test_api.py -v
```

Or use the provided test script:

```bash
bash run_tests.sh
```

---

## Quick Reference Commands

### Complete Fresh Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed the database
python3 app/scripts/seed_all.py

# 3. Start the server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# 4. In another terminal, test it
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_number":"admin","password":"admin"}'
```

### Common Commands
```bash
# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Run database seeds
python3 app/scripts/seed_all.py

# Start development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Run tests
python3 -m pytest app/tests/

# Deactivate virtual environment
deactivate
```

---

## Summary

You now have a fully functional Course Registration System backend with:

- ✅ PostgreSQL database configured
- ✅ Database schema created
- ✅ 1 Admin user
- ✅ 10 Professors
- ✅ 10 Students
- ✅ 20 Courses
- ✅ Course offerings with schedule slots
- ✅ Prerequisite relationships
- ✅ FastAPI server running
- ✅ Interactive API documentation

**The system is ready for testing and demonstration!** 🎉

---

## Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review the terminal output for error messages
3. Check PostgreSQL logs:
   ```bash
   sudo tail -f /var/log/postgresql/postgresql.log
   ```
4. Review the API documentation at http://127.0.0.1:8000/docs

---

## Next Steps

1. ✅ Backend is running
2. 📝 Log in to http://127.0.0.1:8000 with test credentials
3. 🧪 Test creating courses and enrolling students
4. 📚 Explore API documentation at http://127.0.0.1:8000/docs
5. 💻 Set up frontend (if separate) to communicate with backend

---

## Documentation Files

- **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** - How to test the system
- **[IMPLEMENTATION_VERIFICATION.md](../IMPLEMENTATION_VERIFICATION.md)** - Verification checklist
- **[TIME_SLOTS_INTEGRATION_COMPLETE.md](../TIME_SLOTS_INTEGRATION_COMPLETE.md)** - Schedule details
- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - Frontend setup
- **[POSTMAN_TESTING.md](./POSTMAN_TESTING.md)** - Postman API testing guide

---

## License

See the LICENSE file in the project root.

---

**Last Updated:** February 2026  
**System Version:** 1.0  
**Python Version Required:** 3.10+  
**PostgreSQL Version Required:** 12+

# Course Registration System — Backend Setup Guide

## Overview

This guide provides complete step-by-step instructions to set up and run the **Course Registration System** backend on your machine. The system is a modern REST API built with FastAPI that manages course registration, enrollments, user authentication, and schedule management for an educational institution.

Whether you're setting up the system for demonstration, testing, or development, this guide will walk you through every step required to get the backend running with sample data.

**Estimated setup time:** 15-20 minutes

---

## Technology Stack

**Backend Framework & Web Server**

- **FastAPI**: Modern async Python web framework for building REST APIs
- **Uvicorn**: ASGI web server for running FastAPI applications (with auto-reload in development)

**Database & ORM**

- **PostgreSQL**: Primary relational database for course data, users, enrollments, semesters, etc.
- **SQLAlchemy**: Python ORM for database abstraction and model definitions
- **psycopg2-binary**: PostgreSQL adapter for Python

**Authentication & Security**

- **JWT (JSON Web Tokens)**: Bearer token-based authentication
  - Access tokens: short-lived tokens for API requests
  - Refresh tokens: long-lived tokens for obtaining new access tokens
- **Password hashing**: Secure password storage (bcrypt-based via FastAPI security utilities)
- **Role-Based Access Control (RBAC)**: Three roles enforced at endpoint level
  - Admin: full system access
  - Professor: manage courses and view enrollments
  - Student: enroll in courses and view schedule

**Data Validation & Serialization**

- **Pydantic**: Schema validation, request/response models (request bodies and API responses)

**Frontend (Static assets served by backend)**

- **HTML5**: Templating for course registration, login, and settings pages
- **CSS3**: Styling (custom styles in `static/css/`)
- **Vanilla JavaScript**: Client-side logic for form handling, API communication, and dynamic UI updates

**Full Project Tech Stack Summary**

| Component | Technology |
|-----------|-----------|
| Backend Server | FastAPI + Uvicorn |
| ORM & Database Driver | SQLAlchemy + psycopg2-binary |
| Database | PostgreSQL |
| Authentication | JWT (HS256) + bcrypt |
| Authorization | Role-Based Access Control (Admin/Professor/Student) |
| Request/Response Validation | Pydantic |
| Frontend UI | HTML5 + CSS3 + Vanilla JavaScript |
| Frontend API Communication | Fetch API + Bearer Token in Authorization header |
| Frontend UI | HTML5 + CSS3 + Vanilla JavaScript |
| Frontend API Communication | Fetch API + Bearer Token in Authorization header |
| Build/Deployment | Python venv, pip, git |

---

## Prerequisites & System Requirements

Before you begin, ensure your system has the following:

- **Python 3.10 or higher** (check with `python3 --version`)
- **PostgreSQL Server 12+** (check with `psql --version`)
- **Git** (for cloning the repository)
- **pip** (Python package manager, comes with Python)
- **At least 500MB free disk space**
- **Administrator/sudo access** on your machine

### Supported Operating Systems
- ✅ Linux (Ubuntu 20.04+, Debian 11+, etc.)
- ✅ macOS (10.14+)
- ✅ Windows (via WSL2 recommended, or native Python)

---

## Installation Guide - Complete Step by Step

### Step 1: Install PostgreSQL Database Server

PostgreSQL is required to store all course, user, enrollment, and system data.

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-client
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**On Windows:**
- Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run the installer and follow the setup wizard
- Remember the password you set for the `postgres` user

**Verify PostgreSQL is running:**
```bash
psql --version
```

---

### Step 2: Create the Database and Database User

The system uses a PostgreSQL database named `courseRegistrationSystem` with a user account `postgres`.

Open a PostgreSQL terminal and run these commands:

**On Linux/macOS:**
```bash
# Open PostgreSQL command line as the system postgres user
sudo -u postgres psql

# Inside psql, create the role (user) and database:
```

**Then run these SQL commands** (works on all systems):
```sql
-- Create the database user/role (if not already created)
CREATE ROLE postgres WITH LOGIN PASSWORD '123456';

-- Create the database owned by postgres user
CREATE DATABASE "courseRegistrationSystem" OWNER postgres;

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON DATABASE "courseRegistrationSystem" TO postgres;

-- Exit psql
\q
```

**Verify the database was created:**
```bash
psql -U postgres -d courseRegistrationSystem -h localhost -c "\dt"
```

You should see a mostly empty database (tables will be created by the application).

---

### Step 3: Clone the Repository

```bash
# create DB tables (these scripts call SQLAlchemy create_all)
python3 app/scripts/init_semester.py
python3 app/scripts/init_admin.py
python3 app/scripts/init_prof.py
python3 app/scripts/init_student.py
python3 app/scripts/init_schedule_slots.py
```

- The default admin credentials created by `init_admin.py` are `user_number=admin` and `password=admin`.

#### 8) Run the backend server (development)

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

#### 9) Quick smoke checks

- Login (replace with your curl or Postman):

```bash
curl -X POST http://127.0.0.1:8000/auth/login -H "Content-Type: application/json" -d '{"user_number":"admin","password":"admin"}'
```

- Fetch active semester (requires token in Authorization header):

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://127.0.0.1:8000/semesters/active/current
```

There is a small smoke-test script added at `backend/scripts/smoke_test_update_semester.py` (optional) that logs in as the seeded admin, fetches active semester and tries a PUT update. Run it from `backend/` with the venv active:

```bash
python3 scripts/smoke_test_update_semester.py
```

## Notes & Troubleshooting

- If Uvicorn fails because `psycopg2` is missing, install `psycopg2-binary` in the venv: `pip install psycopg2-binary`.
- If you get SQL errors about missing columns, it usually means the DB schema isn't up-to-date. The quick fix is to run the seed scripts above or add the missing column manually (see code). Consider adding proper migrations (Alembic) for production projects.
- The project currently has a hardcoded DB URL in `app/core/db.py`. For multi-environment usage prefer environment variables and/or a config file.
- CORS: The backend allows origins used by the frontend during development; if you run the frontend on another port, update allowed origins in `app/main.py`.

That's it — after these steps the backend should be running and reachable at `http://127.0.0.1:8000`.


Postman Testing Guide — Backend API

Purpose

This document explains how to test the backend API with Postman (or any HTTP client) without the frontend. It lists endpoints, required roles, headers, example requests and expected responses for the core functionality of the Course Registration System.

Prerequisites

- Backend running locally at http://127.0.0.1:8000 (see `backend/README.md` for setup)
- A seeded admin user exists (default `user_number=admin`, `password=admin`) or other users created via seed scripts
- Postman or curl installed

Authentication (obtain tokens)

1) Login (retrieve access token)

- Method: POST
- URL: http://127.0.0.1:8000/auth/login
- Body (JSON):
  {
    "user_number": "admin",
    "password": "admin"
  }
- Response: JSON containing `access_token` and `refresh_token`.

Note: Use the `access_token` in the `Authorization` header for protected endpoints:

Header:
  Authorization: Bearer <ACCESS_TOKEN>

If access token expires, use `POST /auth/refresh` with body `{ "refresh_token": "..." }` to obtain a new access token.

Common headers for requests

- Content-Type: application/json
- Authorization: Bearer <ACCESS_TOKEN> (when required)

Endpoint Reference (with examples)

1) Me / Protected

- GET /me/
  - Description: returns current authenticated user information
  - Requires: valid access token

- GET /me/admin-only
  - Description: test-only endpoint restricted to Admin role
  - Requires: Admin token

2) Courses

- GET /courses
  - Description: list courses. Admin sees all; Professor sees courses they teach.
  - Requires: authenticated user (Admin or Professor)

- POST /courses
  - Description: create a new course (Admin only)
  - Requires: Admin token
  - Body example:
    {
      "course_code": "CS101",
      "name": "Intro to CS",
      "units": 3
    }

- PUT /courses/{course_id}
  - Description: update course (Admin only)
  - Body: partial CourseUpdate fields

- DELETE /courses/{course_id}
  - Description: delete a course (Admin only)

3) Course Offerings

- POST /course-offerings
  - Description: create a course offering (Admin only)
  - Body example:
    {
      "course_id": "<course-uuid>",
      "professor_id": "<professor-uuid>",
      "semester_id": "<semester-uuid>",
      "slot_ids": ["<slot-uuid>", "<slot-uuid>"],
      "capacity": 30,
      "classroom": "B1",
      "exam_date": "2025-12-10"
    }

- GET /course-offerings
  - Description: list all course offerings (Admin only)

- GET /course-offerings/for-current-term
  - Description: student-facing list for the active semester (Student role required)
  - Query params (optional): `course_name`, `professor_name`

- PUT /course-offerings/{offering_id}
  - Description: update offering (Admin only). `course_id` and `semester_id` are immutable.
  - Body: fields from CourseOfferingUpdate; to change slots, include `slot_ids` array.

- DELETE /course-offerings/{offering_id}
  - Description: delete offering (Admin only)

- GET /course-offerings/{offering_id}/students
  - Description: Professor-only endpoint to list enrolled students for their offering
  - Requires: Professor token and professor must own the offering

4) Semesters

- GET /semesters/
  - Description: list all semesters (public)

- GET /semesters/{semester_id}
  - Description: get specific semester (public)

- GET /semesters/active/current
  - Description: get the currently active semester (returns null if none)
  - Requires: authentication for consistent behavior in some flows (safe to call without token in many setups)

- PUT /semesters/{semester_id}
  - Description: update semester properties (Admin only)
  - Body example (partial update):
    {
      "min_units": 12,
      "max_units": 24
    }
  - Notes: If `is_active` is set true, other semesters are automatically deactivated.

5) Prerequisites

- POST /prerequisites
  - Description: create a prerequisite relation (Admin only)
  - Body example:
    {
      "course_id": "<course-uuid>",
      "prerequisite_course_id": "<course-uuid>"
    }
  - Validations: rejects duplicates, self-prerequisite, or circular dependencies

- GET /prerequisites/
  - Description: list prerequisites (Admin only)

- PUT /prerequisites/{prerequisite_id}
  - Description: update prerequisite (Admin only)

- DELETE /prerequisites/{prerequisite_id}
  - Description: delete prerequisite (Admin only)

6) Enrollments (Student / Professor / Admin flows)

- POST /enrollments?offering_id=<offering-uuid>
  - Description: Student enrolls in offering (Student role required)
  - Example using query param: POST /enrollments?offering_id=4c27ee38-...

- DELETE /enrollments/{enrollment_id}
  - Description: Student drops their enrollment (Student role required)

- GET /enrollments/me
  - Description: Student's current enrollments (Student role required)

- GET /enrollments/me/schedule
  - Description: Student's weekly schedule (Student role required)

- DELETE /enrollments/{enrollment_id}/by-professor
  - Description: Professor removes a student from an enrollment (Professor role required)

- GET /enrollments/ (Admin only)
  - Description: list all enrollments in the system

- PATCH /enrollments/{enrollment_id}?status=<status>
  - Description: Admin can update enrollment status to `enrolled`, `dropped`, etc.

7) Schedule slots and supporting data

- GET /schedule-slots
  - Description: list available schedule slots (time/day combinations)
  - Use to obtain `slot_id` values for creating or updating offerings

- GET /users/professors
  - Note: The frontend expects this endpoint to populate professor dropdowns. If your backend does not expose a `/users` router, obtain professor IDs from the DB or add a simple endpoint that returns users with `role == Professor`.

8) Token refresh

- POST /auth/refresh
  - Body: `{ "refresh_token": "<REFRESH_TOKEN>" }`
  - Response: returns (usually) a new access token

Testing tips and Postman collection ideas

- Create an environment in Postman with variables:
  - base_url = http://127.0.0.1:8000
  - access_token = (set after login)

- Create a single folder for each role (Admin / Professor / Student). Each folder should contain the sequence of calls required for that role.

- Example sequence for Admin smoke test:
  1. POST {{base_url}}/auth/login → save `access_token` to environment
  2. GET {{base_url}}/semesters/active/current → note `id`
  3. PUT {{base_url}}/semesters/{{id}} with `{ "min_units": 12, "max_units": 24 }`
  4. POST {{base_url}}/courses to create a course
  5. POST {{base_url}}/course-offerings to create an offering using the created course and a professor id
  6. GET {{base_url}}/course-offerings to inspect created offering

- Example Student flow:
  1. POST /auth/login (student credentials)
  2. GET /course-offerings/for-current-term to find offerings
  3. POST /enrollments?offering_id=<offering-id> to enroll
  4. GET /enrollments/me to verify enrollment

Error handling and common failures

- 401 Unauthorized: missing/invalid token or expired access token. Use refresh token or log in again.
- 403 Forbidden: role-based access denied. Ensure you are using a token with the correct role (Admin/Professor/Student).
- 404 Not Found: wrong resource id (UUID) or resource not created. Verify IDs via list endpoints.
- 400 Bad Request: validation errors (e.g., violating prerequisites or invalid data types)
- 500 Internal Server Error: indicates server-side bug or DB schema mismatch. Check backend logs.

Useful SQL queries for troubleshooting (run as postgres user)

- List semesters:
  SELECT id, name, is_active, min_units, max_units FROM semesters;

- List users and roles:
  SELECT id, user_number, role FROM users;

- List courses:
  SELECT id, course_code, name, units FROM courses;

- List schedule slots:
  SELECT id, day_of_week, start_time, end_time FROM schedule_slots;

Notes

- The API enforces role-based access. Seed scripts create users (admin/professors/students) — check `app/scripts/`.
- Some frontend endpoints (e.g., `/users/professors`) might not be implemented; use the DB or add lightweight endpoints as needed for testing.
- Consider saving a Postman Collection that mirrors these requests for quicker testing.

Appendix: Quick curl examples

Login (admin):

```bash
curl -s -X POST http://127.0.0.1:8000/auth/login -H 'Content-Type: application/json' -d '{"user_number":"admin","password":"admin"}'
```

Get active semester (with token):

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://127.0.0.1:8000/semesters/active/current
```

Admin update semester:

```bash
curl -X PUT http://127.0.0.1:8000/semesters/<SEM_ID> -H "Authorization: Bearer <ACCESS_TOKEN>" -H "Content-Type: application/json" -d '{"min_units":12,"max_units":24}'
```

Enroll as student (example):

```bash
curl -X POST "http://127.0.0.1:8000/enrollments?offering_id=<OFFERING_ID>" -H "Authorization: Bearer <STUDENT_TOKEN>"
```

If you'd like, I can also:

- Generate a Postman Collection (JSON) that you can import directly into Postman with prefilled example requests and environment variables.
- Add a small helper endpoint `/users/professors` to return professor list for ease of testing.


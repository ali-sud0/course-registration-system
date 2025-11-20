# 📘 Data Model Documentation

This document describes the database design for the Course Registration System  
(سیستم انتخاب واحد دانشگاه)

The ERD diagram shows all core entities, attributes, and relationships.

---

# 📊 ERD Diagram

> File: `docs/CRS_ERD.png`

---

# 📚 Entities

## 1. User

Represents all authenticated users in the system, including students, professors, and admins.

| Field           | Type                                | Constraints      |
| --------------- | ----------------------------------- | ---------------- |
| id              | uuid                                | PK, NOT NULL     |
| role            | enum('Professor','Student','Admin') | NOT NULL         |
| user_number     | varchar(20)                         | NOT NULL         |
| first_name      | varchar(50)                        | NOT NULL         |
| last_name       | varchar(50)                        | NOT NULL         |
| password_hash   | varchar(255)                       | NOT NULL         |
| national_number | varchar(10)                        | NOT NULL         |
| phone_number    | varchar(20)                        | NOT NULL         |
| is_suspended    | binary                              | 1 = suspended    |

**Relationships:**

- One User → Many TokenMetadata records  
- One User → Many Enrollments  
- One User (as Professor) → Many CourseOfferings  

---

## 2. TokenMetadata

Stores metadata about refresh tokens without storing the token value itself.

| Field      | Type     | Constraints           |
| ---------- | -------- | --------------------- |
| id         | uuid     | PK, NOT NULL          |
| user_id    | uuid     | FK → User.id          |
| issued_at  | datetime | NOT NULL              |
| expires_at | datetime | NOT NULL              |
| revoked    | binary   | default: 0 (valid)    |

---

## 3. Course

Master definition of a course independent of the semester.

| Field       | Type         | Constraints      |
| ----------- | ------------ | ---------------- |
| id          | uuid         | PK, NOT NULL     |
| course_code | varchar(20)  | UNIQUE, NOT NULL |
| name        | varchar(100) | NOT NULL         |
| units       | tinyint      | NOT NULL         |

**Relationships:**

- One Course → Many CourseOfferings  
- One Course → Many Prerequisites (self-reference)

---

## 4. Semester

Represents an academic term (e.g., 1404-1).

| Field      | Type        | Constraints        |
| ---------- | ----------- | ------------------ |
| id         | uuid        | PK, NOT NULL       |
| name       | varchar(20) | UNIQUE, NOT NULL   |
| start_date | date        | optional           |
| end_date   | date        | optional           |
| min_units  | tinyint     | optional           |
| max_units  | tinyint     | optional           |

---

## 5. ScheduleSlot

Represents a time block during a week.

| Field       | Type        | Constraints      |
| ----------- | ----------- | ---------------- |
| id          | uuid        | PK, NOT NULL     |
| day_of_week | varchar(10) | NOT NULL         |
| start_time  | time        | NOT NULL         |
| end_time    | time        | NOT NULL         |

---

## 6. CourseOffering

A course offered in a semester, taught by a professor.

| Field        | Type        | Constraints        |
| ------------ | ----------- | ------------------ |
| id           | uuid        | PK, NOT NULL       |
| course_id    | uuid        | FK → Course.id     |
| professor_id | uuid        | FK → User.id       |
| semester_id  | uuid        | FK → Semester.id   |
| capacity     | tinyint     | optional           |
| classroom    | varchar(20) | optional           |
| exam_date    | datetime    | optional           |

**Relationships:**

- One CourseOffering → Many Enrollments  
- One CourseOffering → Many ScheduleSlots (via CourseOfferingScheduleSlot)

---

## 7. CourseOfferingScheduleSlot

Defines the many-to-many relationship between CourseOffering and ScheduleSlot.

| Field              | Type | Constraints                |
| ------------------ | ---- | -------------------------- |
| id                 | uuid | PK, NOT NULL               |
| course_offering_id | uuid | FK → CourseOffering.id     |
| schedule_slot_id   | uuid | FK → ScheduleSlot.id       |

---

## 8. Prerequisite

Maps a course to another course that must be completed first.

| Field                  | Type | Constraints      |
| ---------------------- | ---- | ---------------- |
| id                     | uuid | PK, NOT NULL     |
| course_id              | uuid | FK → Course.id   |
| prerequisite_course_id | uuid | FK → Course.id   |

---

## 9. Enrollment

Represents a student’s enrollment in a course offering.

| Field       | Type                                         | Constraints                |
| ----------- | -------------------------------------------- | -------------------------- |
| id          | uuid                                         | PK, NOT NULL               |
| student_id  | uuid                                         | FK → User.id               |
| offering_id | uuid                                         | FK → CourseOffering.id     |
| status      | enum('enrolled','dropped','passed','failed') | NOT NULL                   |

---

# 🔗 Relationship Summary

- **User** 1—∞ **TokenMetadata**
- **User** 1—∞ **Enrollment**
- **User (Professor)** 1—∞ **CourseOffering**
- **Course** 1—∞ **CourseOffering**
- **Course** 1—∞ **Prerequisite** (self-reference)
- **Semester** 1—∞ **CourseOffering**
- **CourseOffering** 1—∞ **Enrollment**
- **CourseOffering** 1—∞ **CourseOfferingScheduleSlot**
- **ScheduleSlot** 1—∞ **CourseOfferingScheduleSlot**

---

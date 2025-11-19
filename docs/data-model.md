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

| Field         | Type                                | Constraints |
| ------------- | ----------------------------------- | ----------- |
| id            | char(36)                            | PK          |
| role          | enum('Professor','Student','Admin') | NOT NULL    |
| password_hash | varchar(255)                        | NOT NULL    |
| first_name    | varchar(50)                         | NOT NULL    |
| last_name     | varchar(50)                         | NOT NULL    |
| phone_number  | varchar(20)                         | NOT NULL    |

**Relationships:**

* One User → One Student
* One User → One Professor

---

## 2. JWT_tokens

Stores refresh tokens for active sessions.

| Field         | Type         | Constraints      |
| ------------- | ------------ | ---------------- |
| id            | char(36)     | PK               |
| user_id       | char(36)     | FK → User.id     |
| refresh_token | varchar(255) | UNIQUE, NOT NULL |
| issued_at     | datetime     | NOT NULL         |
| expires_at    | datetime     | NOT NULL         |
| revoked       | boolean      | default: false   |

---

## 3. Student

Represents student-specific information.

| Field            | Type        | Constraints      |
| ---------------- | ----------- | ---------------- |
| id               | char(36)    | PK               |
| user_id          | char(36)    | FK → User.id     |
| student_number   | varchar(20) | UNIQUE, NOT NULL |
| education_status | boolean     | optional         |

**Relationships:**

* One Student → Many Enrollments

---

## 4. Professor

Represents instructors teaching course offerings.

| Field            | Type        | Constraints      |
| ---------------- | ----------- | ---------------- |
| id               | char(36)    | PK               |
| user_id          | char(36)    | FK → User.id     |
| personnel_number | varchar(20) | UNIQUE, NOT NULL |

**Relationships:**

* One Professor → Many CourseOfferings

---

## 5. Course

Master definition of a course independent of the semester.

| Field       | Type         | Constraints      |
| ----------- | ------------ | ---------------- |
| id          | char(36)     | PK               |
| course_code | varchar(20)  | UNIQUE, NOT NULL |
| name        | varchar(100) | NOT NULL         |
| units       | int          | NOT NULL         |

**Relationships:**

* One Course → Many CourseOfferings
* One Course → Many Prerequisites (self-reference)

---

## 6. Semester

Represents an academic term (e.g., 1404-1).

| Field      | Type        | Constraints          |
| ---------- | ----------- | -------------------- |
| id         | char(36)    | PK                   |
| name       | varchar(20) | UNIQUE, NOT NULL     |
| rule_id    | char(36)    | FK → SemesterRule.id |
| start_date | date        | optional             |
| end_date   | date        | optional             |

---

## 7. SemesterRule

Defines minimum and maximum allowed credit units.

| Field     | Type     | Constraints |
| --------- | -------- | ----------- |
| id        | char(36) | PK          |
| min_units | int      | optional    |
| max_units | int      | optional    |

---

## 8. ScheduleSlot

Represents a time block during the week.

| Field       | Type        | Constraints |
| ----------- | ----------- | ----------- |
| id          | char(36)    | PK          |
| day_of_week | varchar(10) | NOT NULL    |
| start_time  | time        | NOT NULL    |
| end_time    | time        | NOT NULL    |

---

## 9. CourseOffering

A course offered in a semester, taught by a professor.

| Field        | Type        | Constraints       |
| ------------ | ----------- | ----------------- |
| id           | char(36)    | PK                |
| course_id    | char(36)    | FK → Course.id    |
| professor_id | char(36)    | FK → Professor.id |
| semester_id  | char(36)    | FK → Semester.id  |
| capacity     | int         | NOT NULL          |
| classroom    | varchar(20) | NOT NULL          |
| exam_date    | datetime    | optional          |

**Relationships:**

* One CourseOffering → Many Enrollments
* One CourseOffering → Many ScheduleSlots (via CourseOfferingScheduleSlot)

---

## 10. CourseOfferingScheduleSlot

Associates a course offering with one or more schedule slots.

| Field              | Type     | Constraints            |
| ------------------ | -------- | ---------------------- |
| id                 | char(36) | PK                     |
| course_offering_id | char(36) | FK → CourseOffering.id |
| schedule_slot_id   | char(36) | FK → ScheduleSlot.id   |

---

## 11. Prerequisite

Maps a course to another course that must be completed first.

| Field                  | Type     | Constraints    |
| ---------------------- | -------- | -------------- |
| id                     | char(36) | PK             |
| course_id              | char(36) | FK → Course.id |
| prerequisite_course_id | char(36) | FK → Course.id |

---

## 12. Enrollment

Represents a student’s enrollment in a course offering.

| Field       | Type                                         | Constraints            |
| ----------- | -------------------------------------------- | ---------------------- |
| id          | char(36)                                     | PK                     |
| student_id  | char(36)                                     | FK → Student.id        |
| offering_id | char(36)                                     | FK → CourseOffering.id |
| status      | enum('enrolled','dropped','passed','failed') | NOT NULL               |
| grade       | float                                        | optional               |

---

# 🔗 Relationship Summary

* **User** 1—1 **Student**
* **User** 1—1 **Professor**
* **Student** 1—∞ **Enrollment**
* **Course** 1—∞ **CourseOffering**
* **CourseOffering** 1—∞ **Enrollment**
* **Professor** 1—∞ **CourseOffering**
* **Semester** 1—∞ **CourseOffering**
* **Course** 1—∞ **Prerequisite** (self-reference)
* **CourseOffering** 1—∞ **CourseOfferingScheduleSlot**
* **ScheduleSlot** 1—∞ **CourseOfferingScheduleSlot**

---
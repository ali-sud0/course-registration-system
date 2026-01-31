from datetime import time
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.db import SessionLocal, Base, engine
from app.models.schedule_slot import ScheduleSlot


SCHEDULE_SLOTS = [
    # sat
    ("85f9ac87-4165-4d3e-87a7-cf8295bf7997", "sat", time(8, 0), time(10, 0)),
    ("fbc03343-2a6e-4524-963d-dd075256371e", "sat", time(10, 0), time(12, 0)),
    ("92dd1906-243a-4465-8a3f-33b931ce3545", "sat", time(14, 0), time(16, 0)),
    ("56cb9a42-d5ce-4e57-a23d-b8c6aed3dbe1", "sat", time(16, 0), time(18, 0)),

    # sun
    ("71815112-12b3-44de-8b24-5bc6cd4142d1", "sun", time(8, 0), time(10, 0)),
    ("7216511d-1b23-47f4-9368-a88e0a2ef522", "sun", time(10, 0), time(12, 0)),
    ("4eac2245-a79e-4b93-bbf4-41c91cd46433", "sun", time(14, 0), time(16, 0)),
    ("3bd1d9cc-a94d-42eb-92d9-f5f8affcc039", "sun", time(16, 0), time(18, 0)),

    # mon
    ("4a62d084-373d-4e6f-9fc3-c1593b2be91d", "mon", time(8, 0), time(10, 0)),
    ("923ddc38-2088-4ccd-af63-bb7bf9b88bb4", "mon", time(10, 0), time(12, 0)),
    ("7233c527-a19d-4076-9349-887ffffca9cc", "mon", time(14, 0), time(16, 0)),
    ("d8e9976a-dc77-4478-9706-e450415ff2d1", "mon", time(16, 0), time(18, 0)),

    # tue
    ("a7b8a1a3-fb0c-44cf-b50f-a1f9ad1d4993", "tue", time(8, 0), time(10, 0)),
    ("ff15dfcf-2736-42a9-b60c-3d3f4a0fe817", "tue", time(10, 0), time(12, 0)),
    ("075b3c1b-e4dd-48db-abf4-609243e5a26c", "tue", time(14, 0), time(16, 0)),
    ("3b41b822-00ce-47b4-b4e4-b42cc1e41697", "tue", time(16, 0), time(18, 0)),

    # wed
    ("9834cf74-8524-471f-9090-9999489469c3", "wed", time(8, 0), time(10, 0)),
    ("484338a2-af1c-406b-a781-a967bcc16947", "wed", time(10, 0), time(12, 0)),
    ("ec604073-6443-4e3e-9be1-869c716e01f9", "wed", time(14, 0), time(16, 0)),
    ("67a295d7-ea24-4229-8153-f0fe15a9a356", "wed", time(16, 0), time(18, 0)),
]


def init_schedule_slots():
    # create tables if not exist
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # if at least one slot exists, assume seeding already done
        exists = db.query(ScheduleSlot).first()
        if exists:
            print("Schedule slots already initialized")
            return

        for slot_id, day, start, end in SCHEDULE_SLOTS:
            slot = ScheduleSlot(
                id=UUID(slot_id),
                day_of_week=day,
                start_time=start,
                end_time=end
            )
            db.add(slot)

        db.commit()
        print("Schedule slots initialized successfully")

    finally:
        db.close()


if __name__ == "__main__":
    init_schedule_slots()

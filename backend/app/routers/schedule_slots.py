from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.schedule_slot import ScheduleSlot

router = APIRouter()


@router.get("/schedule-slots")
def list_schedule_slots(db: Session = Depends(get_db)):
    """Return all predefined schedule slots.

    Returns a list of simple dicts with fields: id, day_of_way, start_time, end_time
    """
    slots = db.query(ScheduleSlot).all()
    result = []
    for s in slots:
        result.append({
            "id": str(s.id),
            "day_of_week": s.day_of_week,
            "start_time": s.start_time.strftime("%H:%M"),
            "end_time": s.end_time.strftime("%H:%M"),
        })
    return result

import uuid
from sqlalchemy.orm import Session
from app.models.prerequisite import Prerequisite


def has_cycle(db: Session, start_id: uuid.UUID, target_id: uuid.UUID) -> bool:
    """
    Check if adding an edge start_id -> target_id creates a cycle.
    """
    visited = set()

    def dfs(course_id: uuid.UUID) -> bool:
        if course_id == start_id:
            return True  # cycle detected
        if course_id in visited:
            return False
        visited.add(course_id)
        # get all prerequisites of this course
        prereqs = db.query(Prerequisite.prerequisite_course_id)\
                    .filter(Prerequisite.course_id == course_id).all()
        for (prereq_id,) in prereqs:
            if dfs(prereq_id):
                return True
        return False

    return dfs(target_id)

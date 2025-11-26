# app/routers/protected.py
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user, require_role
from app.schemas.auth import UserOut

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/", response_model=UserOut)
def read_me(current_user = Depends(get_current_user)):
    return current_user

@router.get("/admin-only")
def admin_only(user = Depends(require_role("Admin"))):
    return {"msg": f"Hello Admin [{user.first_name} {user.last_name}]"}
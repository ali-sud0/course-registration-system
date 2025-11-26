# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.core.db import get_db
from app.models.user import User
from app.models.token_metadata import TokenMetadata
from app.core import security

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_number == data.user_number).first()

    if not user:
        raise HTTPException(401, "Invalid credentials")

    if not security.verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    if user.is_suspended:
        raise HTTPException(403, "User account is suspended")

    access = security.create_access_token(subject=user.id)
    refresh = security.create_refresh_token(subject=user.id)

    # extract refresh token expiration
    payload = security.decode_token(refresh)
    expires_at = datetime.utcfromtimestamp(payload["exp"])

    # store in DB
    rec = TokenMetadata(
        user_id=user.id,
        token=refresh,
        expires_at=expires_at,
    )
    db.add(rec)
    db.commit()

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = security.decode_token(req.refresh_token)
    except:
        raise HTTPException(401, "Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid token type")

    user_id = payload.get("sub")

    record = db.query(TokenMetadata).filter(
        TokenMetadata.token == req.refresh_token,
        TokenMetadata.revoked == False
    ).first()

    if not record:
        raise HTTPException(401, "Refresh token revoked or unknown")

    new_access = security.create_access_token(subject=user_id)

    return {
        "access_token": new_access,
        "refresh_token": req.refresh_token,
        "token_type": "bearer",
    }

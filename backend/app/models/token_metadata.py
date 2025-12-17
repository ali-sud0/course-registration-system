# app/models/token_metadata.py
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql.base import UUID

from app.core.db import Base
import uuid

class TokenMetadata(Base):
    __tablename__ = "token_metadata"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    token = Column(String, nullable=False, unique=True)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime, nullable=False)

    revoked = Column(Boolean, nullable=False, default=False)

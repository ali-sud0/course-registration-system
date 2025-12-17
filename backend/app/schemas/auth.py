from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    user_number: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: UUID
    role: str
    user_number: str
    first_name: str
    last_name: str
    phone_number: str
    national_number: str
    is_suspended: bool

    model_config = ConfigDict(from_attributes=True)
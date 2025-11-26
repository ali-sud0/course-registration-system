from pydantic import BaseModel


class LoginRequest(BaseModel):
    user_number: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    role: str
    user_number: str
    first_name: str
    last_name: str
    phone_number: str
    national_number: str
    is_suspended: bool

    class Config:
        from_attributes = True
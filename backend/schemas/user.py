from typing import Optional
from pydantic import BaseModel, EmailStr


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: str

    model_config = {"from_attributes": True}


class MemberOut(BaseModel):
    id: int
    user_id: int
    role: str
    joined_at: str
    user_name: str
    user_email: str

    model_config = {"from_attributes": True}

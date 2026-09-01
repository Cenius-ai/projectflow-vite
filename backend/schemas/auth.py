from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    user: UserOut

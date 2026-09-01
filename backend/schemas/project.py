from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    created_by_user_id: int
    created_at: str

    model_config = {"from_attributes": True}


class ProjectWithTaskCount(BaseModel):
    id: int
    name: str
    description: str
    created_by_user_id: int
    created_at: str
    total_tasks: int

    model_config = {"from_attributes": True}

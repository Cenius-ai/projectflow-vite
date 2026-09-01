from typing import Optional
from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    order: Optional[int] = None
    assignee_id: Optional[int] = None


class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    status: str
    order: int
    assignee_id: Optional[int] = None
    assignee_name: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}

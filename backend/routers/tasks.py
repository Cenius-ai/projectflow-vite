import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case

from database import get_session
from models import Project, ProjectMember, Task, User
from auth import get_current_user
from schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/api", tags=["tasks"])


async def _check_project_membership(
    project_id: int, user_id: int, db: AsyncSession
) -> None:
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project not found")


def _task_to_out(task: Task, assignee_name: Optional[str] = None) -> TaskOut:
    return TaskOut(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        order=task.order,
        assignee_id=task.assignee_id,
        assignee_name=assignee_name,
        created_at=task.created_at.isoformat() if task.created_at else "",
        updated_at=task.updated_at.isoformat() if task.updated_at else "",
    )


@router.get("/projects/{project_id}/tasks", response_model=list[TaskOut])
async def list_tasks(
    project_id: int,
    status_filter: Optional[str] = Query(None, alias="status"),
    sort_by: str = Query("order"),
    sort_dir: str = Query("asc"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    await _check_project_membership(project_id, current_user.id, db)

    query = (
        select(Task, User.name.label("assignee_name"))
        .outerjoin(User, Task.assignee_id == User.id)
        .where(Task.project_id == project_id)
    )

    if status_filter:
        query = query.where(Task.status == status_filter)

    if search:
        query = query.where(Task.title.ilike(f"%{search}%"))

    # Apply sorting
    sort_column = Task.order
    if sort_by == "title":
        sort_column = Task.title
    elif sort_by == "status":
        sort_column = Task.status
    elif sort_by == "created_at":
        sort_column = Task.created_at

    if sort_dir == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    result = await db.execute(query)
    rows = result.all()

    tasks = []
    for task, assignee_name in rows:
        tasks.append(_task_to_out(task, assignee_name))

    return tasks


@router.post("/projects/{project_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: int,
    body: TaskCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    await _check_project_membership(project_id, current_user.id, db)

    # Auto-assign order: max order in project + 1
    max_order_result = await db.execute(
        select(func.max(Task.order)).where(Task.project_id == project_id)
    )
    max_order = max_order_result.scalar() or 0

    task = Task(
        project_id=project_id,
        title=body.title,
        description=body.description,
        status=body.status,
        order=max_order + 1,
        assignee_id=body.assignee_id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    assignee_name = None
    if task.assignee_id:
        user_result = await db.execute(select(User.name).where(User.id == task.assignee_id))
        assignee_name = user_result.scalar()

    return _task_to_out(task, assignee_name)


@router.put("/tasks/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: int,
    body: TaskUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="task not found")

    # Verify membership
    await _check_project_membership(task.project_id, current_user.id, db)

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    if body.status is not None:
        task.status = body.status
    if body.order is not None:
        task.order = body.order
    if body.assignee_id is not None:
        task.assignee_id = body.assignee_id

    task.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(task)

    assignee_name = None
    if task.assignee_id:
        user_result = await db.execute(select(User.name).where(User.id == task.assignee_id))
        assignee_name = user_result.scalar()

    return _task_to_out(task, assignee_name)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="task not found")

    await _check_project_membership(task.project_id, current_user.id, db)
    await db.delete(task)
    await db.commit()

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_session
from models import Project, ProjectMember, Task, User
from auth import get_current_user
from schemas.project import ProjectWithTaskCount

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=list[ProjectWithTaskCount])
async def get_dashboard(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Get all projects where user is a member
    result = await db.execute(
        select(Project, func.count(Task.id).label("total_tasks"))
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .outerjoin(Task, Task.project_id == Project.id)
        .where(ProjectMember.user_id == current_user.id)
        .group_by(Project.id)
        .order_by(Project.created_at.desc())
    )
    rows = result.all()

    projects = []
    for project, total_tasks in rows:
        projects.append(
            ProjectWithTaskCount(
                id=project.id,
                name=project.name,
                description=project.description,
                created_by_user_id=project.created_by_user_id,
                created_at=project.created_at.isoformat(),
                total_tasks=total_tasks,
            )
        )

    return projects

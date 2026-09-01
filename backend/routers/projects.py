import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_session
from models import Project, ProjectMember, User
from auth import get_current_user
from schemas.project import ProjectCreate, ProjectOut, ProjectWithTaskCount

router = APIRouter(prefix="/api", tags=["projects"])


@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=body.name,
        description=body.description,
        created_by_user_id=current_user.id,
    )
    db.add(project)
    await db.flush()

    # Add creator as a project member with "owner" role
    member = ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role="owner",
    )
    db.add(member)
    await db.commit()
    await db.refresh(project)

    return ProjectOut(
        id=project.id,
        name=project.name,
        description=project.description,
        created_by_user_id=project.created_by_user_id,
        created_at=project.created_at.isoformat(),
    )


@router.get("/projects/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Check membership
    member_result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
        )
    )
    if member_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project not found")

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project not found")

    return ProjectOut(
        id=project.id,
        name=project.name,
        description=project.description,
        created_by_user_id=project.created_by_user_id,
        created_at=project.created_at.isoformat(),
    )

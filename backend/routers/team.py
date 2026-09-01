from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_session
from models import ProjectMember, User
from auth import get_current_user
from schemas.user import MemberOut

router = APIRouter(prefix="/api", tags=["team"])


@router.get("/projects/{project_id}/members", response_model=list[MemberOut])
async def get_members(
    project_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Verify membership
    member_check = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
        )
    )
    if member_check.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project not found")

    result = await db.execute(
        select(ProjectMember, User.name, User.email)
        .join(User, ProjectMember.user_id == User.id)
        .where(ProjectMember.project_id == project_id)
        .order_by(ProjectMember.joined_at)
    )
    rows = result.all()

    members = []
    for member, user_name, user_email in rows:
        members.append(
            MemberOut(
                id=member.id,
                user_id=member.user_id,
                role=member.role,
                joined_at=member.joined_at.isoformat(),
                user_name=user_name,
                user_email=user_email,
            )
        )

    return members

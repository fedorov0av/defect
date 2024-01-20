from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.role import Role
from db.database import get_db


role_router = APIRouter()

@role_router.post("/roles/")
async def get_roles(session: AsyncSession = Depends(get_db)):
    result: list[Role] = await Role.get_all_roles(session)
    role_l = list()
    for role in result:
        role_l.append(
            {
                'role_id': role.role_id,
                'role_name': role.role_name,
            }
        )
    return role_l
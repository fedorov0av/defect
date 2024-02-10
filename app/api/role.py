from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.role import Role
from db.database import get_db
from app.middleware.auth import check_auth_api


role_router = APIRouter()

@role_router.post("/roles/")
async def get_roles(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
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
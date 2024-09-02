from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.system import System
from db.database import get_db

from app.middleware.auth import check_auth_api


system_router = APIRouter()

@system_router.post("/systems/")
async def get_divisions(request: Request, response: Response, session: AsyncSession = Depends(get_db)) -> list[dict]:
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    result: list[System] = await System.get_all_system(session)
    system_l = list()
    for system in result:
        system_l.append(
            {
                'system_id': system.system_id,
                'system_name': system.system_name,
                'system_kks': system.system_kks,
            }
        )
    return system_l

@system_router.post("/systems_with_kks/")
async def get_divisions(request: Request, response: Response, session: AsyncSession = Depends(get_db)) -> list[dict]:
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    result: list[System] = await System.get_all_system_with_kss(session)
    system_l = list()
    for system in result:
        system_l.append(
            {
                'system_id': system.system_id,
                'system_name': system.system_name,
                'system_kks': system.system_kks,
            }
        )
    return system_l
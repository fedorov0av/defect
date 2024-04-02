from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.division import Division
from db.database import get_db

from app.middleware.auth import check_auth_api


division_router = APIRouter()

@division_router.post("/divisions/")
async def get_divisions(request: Request, response: Response, session: AsyncSession = Depends(get_db)) -> list[dict]:
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    result: list[Division] = await Division.get_all_division(session)
    division_l = list()
    for division in result:
        division_l.append(
            {
                'division_id': division.division_id,
                'division_name': division.division_name,
            }
        )
    return division_l
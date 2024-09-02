from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from app.middleware.auth import check_auth_api
from config import AD

other_router = APIRouter()

@other_router.post("/get_operating_mode/")
async def get_operating_mode(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    return {
                'operating_mode': 'AD' if AD else 'BD' # включен режим AD?
            }
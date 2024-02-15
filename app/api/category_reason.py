from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.category_reason import CategoryReason
from db.database import get_db
from app.middleware.auth import check_auth_api


category_reason_router = APIRouter()

@category_reason_router.post("/get_categories_reason/")
async def get_categories_reason(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    categories_reason: list[CategoryReason] = await CategoryReason.get_all_categories_reason(session)
    result = list()
    for category_reason in categories_reason:
        result.append(
            {
                'category_reason_code': category_reason.category_reason_code,
                'category_reason_name': category_reason.category_reason_name,
            }
        )
    return result
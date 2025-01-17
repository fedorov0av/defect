from fastapi import APIRouter, Response, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.defect_reason_core import CategoryCoreReason
from db.defect_reason_direct import CategoryDirectReason
from db.database import get_db
from app.middleware.auth import check_auth_api


category_reason_router = APIRouter()

@category_reason_router.post("/get_categories_core_reason/")
async def get_categories_reason(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    categories_reason: list[CategoryCoreReason] = await CategoryCoreReason.get_all_categories_core_reason(session)
    result = list()
    for category_reason in categories_reason:
        result.append(
            {
                'category_reason_code': category_reason.category_reason_code,
                'category_reason_name': category_reason.category_reason_name,
            }
        )
    return result

@category_reason_router.post("/get_categories_direct_reason/")
async def get_categories_reason(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    categories_reason: list[CategoryDirectReason] = await CategoryDirectReason.get_all_categories_direct_reason(session)
    result = list()
    for category_reason in categories_reason:
        result.append(
            {
                'category_reason_code': category_reason.category_reason_code,
                'category_reason_name': category_reason.category_reason_name,
            }
        )
    return result
from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.category_defect import CategoryDefect
from db.database import get_db
from app.middleware.auth import check_auth_api


category_defect_router = APIRouter()

@category_defect_router.post("/get_categories_defect/")
async def get_categories_reason(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    categories_defect: list[CategoryDefect] = await CategoryDefect.get_all_categories_defect(session)
    result = list()
    for category_defect in categories_defect:
        result.append(
            {
                'category_defect_id': category_defect.category_defect_id,
                'category_defect_name': category_defect.category_defect_name,
            }
        )
    return result
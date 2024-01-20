from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from db.type_defect import TypeDefect
from db.database import get_db


type_defect_router = APIRouter()

@type_defect_router.post("/type_defect/")
async def get_type_defect(session: AsyncSession = Depends(get_db)):
    result: list[TypeDefect] = await TypeDefect.get_type_defects(session)
    type_defect_l = list()
    for type_defect in result:
        type_defect_l.append(
            {
                'type_defect_id': type_defect.type_defect_id,
                'type_defect_name': type_defect.type_defect_name,
            }
        )
    return type_defect_l
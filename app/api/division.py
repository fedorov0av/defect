from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.division import Division
from db.database import get_db


division_router = APIRouter()

@division_router.post("/divisions/")
async def get_divisions(session: AsyncSession = Depends(get_db)):
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
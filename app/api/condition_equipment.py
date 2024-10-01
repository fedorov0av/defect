from fastapi import APIRouter, Response, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.condition_equipment import ConditionEquipment
from db.database import get_db


condition_equipment_router = APIRouter()

@condition_equipment_router.post("/condition_equipment/")
async def get_condition_equipment(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    result: list[ConditionEquipment] = await ConditionEquipment.get_all_condition_equipment(session)
    condition_equipment_l = list()
    for condition_equipment in result:
        condition_equipment_l.append(
            {
                'condition_equipment_id': condition_equipment.condition_equipment_id,
                'condition_equipment_name': condition_equipment.condition_equipment_name,
            }
        )
    return condition_equipment_l
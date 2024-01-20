from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.history_defect import History
from db.defect import Defect
from db.database import get_db
from app.schemas.defect import Defect_id


history_router = APIRouter()

@history_router.post("/history_by_defect/")
async def get_history_by_defect(defect_id: Defect_id, session: AsyncSession = Depends(get_db)):
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    result: list[History] = await History.get_history_by_defect(session, defect)
    history_l = list()
    for history in result:
        history_l.append(
            {
                'history_id': history.history_id,
                'history_date': history.history_created_at.strftime("%d.%m.%Y %H:%M:%S"),
                'history_status': history.history_status.status_defect_name,
                'history_user': history.history_user,
                'history_comment': history.history_comment,
            }
        )
    return history_l
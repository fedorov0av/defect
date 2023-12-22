from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id, decode_token

from datetime import timedelta
from typing import Union, Optional

from db.user import User
from db.history_defect import History
from db.defect import Defect
from db.status_defect import StatusDefect

from db.type_defect import TypeDefect
from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound
from app.schemas.user import User_p
from app.schemas.defect import Defect_id
from app.schemas.status_defect import StatusDefect_name


status_defect_router = APIRouter()

@status_defect_router.post("/update_status_defect/")
async def update_status_defects(defect_id: Defect_id, status_name: StatusDefect_name, request: Request, session: AsyncSession = Depends(get_db)):
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))

    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)

    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect.defect_id,
                                            defect_status_id = status_defect.status_defect_id)

    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        comment=status_name.status_defect_name
        )
    return defect

@status_defect_router.post("/statuses_defect/")
async def get_divisions(session: AsyncSession = Depends(get_db)):
    result: list[StatusDefect] = await StatusDefect.get_all_status_defect(session)
    statuses_l = list()
    for status in result:
        statuses_l.append(
            {
                'status_defect_id': status.status_defect_id,
                'status_defect_name': status.status_defect_name,
            }
        )
    return statuses_l

@status_defect_router.post("/get_status_defect/")
async def get_divisions(status_name: StatusDefect_name, session: AsyncSession = Depends(get_db)):
    result: StatusDefect = await StatusDefect.get_status_defect_by_name(session, status_name.status_defect_name)
    return result
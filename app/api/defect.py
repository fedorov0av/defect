from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id, decode_token


from datetime import timedelta, datetime
from typing import Union, Optional
import asyncio

from db.user import User
from db.role import Role
from db.defect import Defect
from db.division import Division
from db.system import System
from db.status_defect import StatusDefect
from db.type_defect import TypeDefect
from db.history_defect import History

from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound, MissingGreenlet, IntegrityError
from app.schemas.user import User_p, User_id
from app.schemas.defect import New_defect_p, Defect_id
from app.schemas.status_defect import StatusDefect_name
from app.schemas.other import Date_p

STATUS_REGISTRATION = 1
STATUS_CONFIRM = 2


defect_router = APIRouter()


@defect_router.post("/defect/add")
async def add_new_defect(defect_p: New_defect_p, request: Request, session: AsyncSession = Depends(get_db)):
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    try:
        await System.add_system(session, defect_p.defect_system_name, defect_p.defect_system_kks)
        system = await System.get_system_by_kks(session, defect_p.defect_system_kks)
    except IntegrityError:
        system: System = await System.get_system_by_kks(session, defect_p.defect_system_kks)
    defect_type: TypeDefect = await TypeDefect.get_defect_by_name(session, defect_p.defect_type_defect_name)
    defect_status: StatusDefect = await StatusDefect.get_status_defect_by_id(session, STATUS_REGISTRATION)
    defect = await Defect.add_defect(
        session=session,
        defect_registrator=user,
        defect_description=defect_p.defect_description,
        defect_system=system,
        defect_location=defect_p.defect_location,
        defect_type=defect_type,
        defect_status=defect_status,
        defect_division=user.user_division
    )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=defect_status,
        )
    return defect


@defect_router.post("/defects/")
async def get_defects(session: AsyncSession = Depends(get_db)):
    result: list[Defect] = await Defect.get_all_defect(session)
    defect_l = list()
    for defect in result:
        defect_l.append(
            {
                "defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at,
                'defect_registrar': defect.defect_registrar.user_surname,
                'defect_owner_surname': defect.defect_owner.user_surname if defect.defect_owner else None,
                'defect_owner': defect.defect_system.system_name,
                'defect_repair_manager': defect.defect_repair_manager,
                'defect_worker': defect.defect_worker,
                'defect_planned_finish_date': defect.defect_planned_finish_date,
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,
            }
        )
    return defect_l

@defect_router.post("/get_defect/")
async def get_defects(defect_id: Defect_id, session: AsyncSession = Depends(get_db)):
    defect: Defect = await Defect.get_defect_by_id(session=session, defect_id=defect_id.defect_id)
    return  {
                "defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at,
                'defect_registrar': defect.defect_registrar.user_surname,
                'defect_owner_surname': defect.defect_owner.user_surname if defect.defect_owner else None,
                'defect_owner': defect.defect_system.system_name,
                'defect_repair_manager': defect.defect_repair_manager,
                'defect_worker': defect.defect_worker,
                'defect_planned_finish_date': defect.defect_planned_finish_date,
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,
            }

@defect_router.post("/confirm_defect/")
async def get_defects(defect_id: Defect_id,
                      status_name: StatusDefect_name,
                      repair_manager_id: User_id,
                      defect_planned_finish_date_str: Date_p,
                      request: Request,
                      session: AsyncSession = Depends(get_db)):
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    repair_manager = await User.get_user_by_id(session, int(repair_manager_id.user_id))
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    defect_planned_finish_date = datetime.strptime(defect_planned_finish_date_str.date, "%Y-%m-%d").date() #    2023-12-23
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)

    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect.defect_id,
                                            defect_status_id = status_defect.status_defect_id,
                                            defect_repair_manager_id=repair_manager.user_id,
                                            defect_planned_finish_date = defect_planned_finish_date)
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        )
    return defect
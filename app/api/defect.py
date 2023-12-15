from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id, decode_token

from datetime import timedelta
from typing import Union, Optional

from db.user import User
from db.role import Role
from db.defect import Defect
from db.division import Division
from db.type_defect import TypeDefect

from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound
from app.schemas.user import User_p
from app.schemas.defect import New_defect_p


defect_router = APIRouter()

@defect_router.post("/defects/")
async def get_defects(session: AsyncSession = Depends(get_db)):
    result: list[Defect] = await Defect.get_all_defect(session)
    defects_l = list()
    for defect in result:
        defects_l.append(
            {
                'division_id': defect.defect_id,
                'defect_registrator': defect.defect_registrar.user_surname,

            }
        )
    return defects_l

@defect_router.post("/defect/add")
async def add_new_user(defect_p: New_defect_p, session: AsyncSession = Depends(get_db)):
    division = await Division.get_division_by_name(session, defect_p.defect_division_name)
    registrator = await User.get_user_by_id(session, defect_p.defect_registrator_id)
    defect_type = await TypeDefect.get_defect_by_name(defect_p.defect_type_defect_name)

    defect: Defect = await Defect.add_defect(
        session=session,
        defect_registrator=registrator,
        defect_description=defect_p.defect_description,
        defect_system=defect_p, ###
        defect_location=defect_p.defect_location,
        defect_type=defect_type,
        defect_status= defect_p, ###
        defect_division=division
        )
    return defect

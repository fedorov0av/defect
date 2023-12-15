from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id, decode_token

from datetime import timedelta
from typing import Union, Optional

from db.user import User
from db.role import Role
from db.type_defect import TypeDefect
from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound
from app.schemas.user import User_p

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
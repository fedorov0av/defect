from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id, decode_token

from datetime import timedelta
from typing import Union, Optional

from db.user import User
from db.role import Role
from db.division import Division
from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound
from app.schemas.user import User_p

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
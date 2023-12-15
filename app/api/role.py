from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id, decode_token

from datetime import timedelta
from typing import Union, Optional

from db.user import User
from db.role import Role
from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound
from app.schemas.user import User_p

role_router = APIRouter()

@role_router.post("/roles/")
async def get_roles(session: AsyncSession = Depends(get_db)):
    result: list[Role] = await Role.get_all_roles(session)
    role_l = list()
    for role in result:
        role_l.append(
            {
                'role_id': role.role_id,
                'role_name': role.role_name,
            }
        )
    return role_l
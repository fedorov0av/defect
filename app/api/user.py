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

user_router = APIRouter()

@user_router.post("/user/me")
async def read_current_user(request: Request, session: AsyncSession = Depends(get_db)):  
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    return {
            "user_id": user.user_id,
            "user_surname": user.user_surname,
            "user_name": user.user_name,
            "user_fathername": user.user_fathername,
            "user_position": user.user_position,
            "user_temp_password": user.user_temp_password,
            "user_role": user.user_role[-1].role_name,
            "user_division": user.user_division.division_name,
            "user_email": user.user_email
            }

@user_router.post("/user/add")
async def add_new_user(user_p: User_p, session: AsyncSession = Depends(get_db)):
    division = await Division.get_division_by_name(session, user_p.user_division)
    role = await Role.get_role_by_rolename(session, user_p.user_role)
    user: User = await User.add_user(
        session=session,
        user_name=user_p.user_name,
        user_fathername=user_p.user_fathername,
        user_surname=user_p.user_surname,
        user_position=user_p.user_position,
        user_division=division,
        user_password=user_p.password,
        user_role=role,
        user_email=user_p.email
        )
    return user

@user_router.post("/users/")
async def get_users(session: AsyncSession = Depends(get_db)):
    result: list[User] = await User.get_all_users(session)
    user_l = list()
    for user in result:
        user_l.append(
            {
                "user_id": user.user_id,
                'user_surname': user.user_surname,
                'user_name': user.user_name,
                'user_fathername': user.user_fathername,
                'user_position': user.user_position,
                'user_division': user.user_division.division_name,
                'user_role': user.user_role[-1].role_name,
                "user_email": user.user_email
            }
        )
    return user_l

@user_router.post("/user/{user_id}")
async def get_user(user_id: int, q: Union[str, None] = None, session: AsyncSession = Depends(get_db)):
    user: User = await User.get_user_by_id(session, user_id)
    return user
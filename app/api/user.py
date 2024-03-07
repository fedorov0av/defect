from fastapi import APIRouter, Depends, Request, Response
from utils.jwt import decrypt_user_id, decode_token
from sqlalchemy.ext.asyncio import AsyncSession

from db.user import User
from db.role import Role
from db.division import Division
from db.database import get_db

from app.schemas.user import User_p, User_id, User_update
from app.middleware.auth import check_auth_api


user_router = APIRouter()

@user_router.post("/user/me")
async def get_current_user(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
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
            "user_division_id": user.user_division.division_id,
            "user_email": user.user_email
            }

@user_router.post("/user/user_role")
async def get_current_user_role(request: Request, response: Response, session: AsyncSession = Depends(get_db)):  
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    return {
            "user_id": user.user_id,
            "user_role": user.user_role[-1].role_name,
            "user_division": user.user_division.division_name,
            }

@user_router.post("/user/add")
async def add_new_user(request: Request, response: Response, user_p: User_p, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
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

@user_router.post("/user/update")
async def update_user(request: Request, response: Response, user_update: User_update, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    user = await User.get_user_by_id(session, user_update.user_id)
    division = await Division.get_division_by_name(session, user_update.user_division)
    role = await Role.get_role_by_rolename(session, user_update.user_role)
    user: User = await User.update_user(
        session=session,
        user_id=user_update.user_id,
        user_name=user_update.user_name,
        user_fathername=user_update.user_fathername,
        user_surname=user_update.user_surname,
        user_position=user_update.user_position,
        user_division=division,
        user_role=role,
        user_email=user_update.email
        )
    return user
 
@user_router.post("/users/")
async def get_users(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
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
    """ user_l  = sorted(user_l, key=lambda x: x[2], reverse=True) """
    return user_l

@user_router.post("/user/")
async def get_user(request: Request, response: Response, user_id: User_id, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    user: User = await User.get_user_by_id(session, user_id.user_id)
    return {
                "user_id": user.user_id,
                'user_surname': user.user_surname,
                'user_name': user.user_name,
                'user_fathername': user.user_fathername,
                'user_position': user.user_position,
                'user_division': user.user_division.division_name,
                'user_role': user.user_role[-1].role_name,
                "user_email": user.user_email
            }

@user_router.post("/user/repair_managers")
async def get_repair_managers(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    role_repair_manager: Role = await Role.get_role_by_rolename(session, "Руководитель")
    result: list[User] = await User.get_user_by_role(session, role_repair_manager)
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

@user_router.post("/user/workers")
async def get_worker(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    role_worker: Role = await Role.get_role_by_rolename(session, "Исполнитель")
    result: list[User] = await User.get_user_by_role(session, role_worker)
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

@user_router.post("/user/registrators")
async def get_registrators(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    role_registrator: Role = await Role.get_role_by_rolename(session, "Регистратор")
    result: list[User] = await User.get_user_by_role(session, role_registrator)
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

@user_router.post("/users/emails")
async def get_users_emails(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    result: list[User] = await User.get_all_users(session)
    user_l = list()
    for user in result:
        user_l.append(
            user.user_email
        )
    return user_l
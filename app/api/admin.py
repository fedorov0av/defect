from fastapi import APIRouter, HTTPException, Response, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from config import AD
from app.schemas.admin import Password, UserMail
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id, decode_token
from app.middleware.auth import check_auth_api
from utils.ldap import LdapConnection
from db.database import get_db
from app.schemas.user import User_id

admin_router = APIRouter()

@admin_router.post("/get_user_info_by_mail", response_class=JSONResponse) # check me
async def auth(request: Request, 
               password: Password, 
               email: UserMail,
               response: Response, 
               session: AsyncSession = Depends(get_db),
               ):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    if AD:
        token_dec = await decode_token(request.cookies['jwt_refresh_token'])
        user_id = await decrypt_user_id(token_dec['subject']['userId'])
        ldap_connection = LdapConnection(session, user_id, password.password, auth=True)
        if await ldap_connection.check_user():
            pass
        else:
            raise HTTPException(status_code=403, detail="Invalid password")
    else:
        raise HTTPException(status_code=418, detail="mode AD disabled")
    try:
        user_LDAP = await ldap_connection.get_user_by_mail_from_AD(email.email)
    except IndexError:
        raise HTTPException(status_code=417, detail="User not found!")
    return {"user_LDAP": user_LDAP}

@admin_router.post("/auth_by_user_id", response_class=JSONResponse) # check me
async def auth(request: Request, 
               user_uid: User_id,
               response: Response, 
               session: AsyncSession = Depends(get_db),
               ):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_user_id = await encrypt_user_id(str(user_uid.user_id))
    subject = {"userId": token_user_id}
    access_token = access_security.create_access_token(subject=subject)
    refresh_token = refresh_security.create_refresh_token(subject=subject)
    response.set_cookie(key="jwt_access_token", value=access_token, httponly=True)
    response.set_cookie(key="jwt_refresh_token", value=refresh_token, httponly=True)
    return {"access_token": access_token, "refresh_token": refresh_token}
    


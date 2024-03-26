from datetime import timedelta
from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from fastapi_csrf_protect import CsrfProtect
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound

from config import AD
from app.schemas.auth import AuthData
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id
from utils.security import check_password

from utils.ldap import LdapConnection

from db.user import User
from db.database import get_db

from app.schemas.auth import CsrfSettings

auth_router = APIRouter()


#------------------------------------csrf-start------------------------------------#

@CsrfProtect.load_config
def get_csrf_config():
  return CsrfSettings()

@auth_router.post("/auth", response_class=JSONResponse)
async def auth(request: Request, 
               auth_data: AuthData, 
               response: Response, 
               session: AsyncSession = Depends(get_db), 
               csrf_protect: CsrfProtect = Depends()):
    await csrf_protect.validate_csrf(request)
    csrf_protect.unset_csrf_cookie(response)  # prevent token reuse
    if AD:
        username = auth_data.email.split('@')[0]
        ldap_connection = LdapConnection(session, username, auth_data.password)
        if await ldap_connection.check_user():
            pass
        else:
            raise HTTPException(status_code=403, detail="Invalid password")
    else:
        try:
            user: User = await User.get_user_by_email(session=session, user_email=auth_data.email)
        except NoResultFound:
            raise HTTPException(status_code=401, detail="User not found")
        if not check_password(user=user, text=auth_data.password):
            raise HTTPException(status_code=403, detail="Invalid password")
    if AD:
        token_user_id = await encrypt_user_id(str(username))
        token_p = await encrypt_user_id(str(auth_data.password))
        subject = {"userId": token_user_id, "userP": token_p}
    else:
        token_user_id = await encrypt_user_id(str(user.user_id))
        subject = {"userId": token_user_id}
    # Create new access/refresh tokens pair
    access_token = access_security.create_access_token(subject=subject)
    refresh_token = refresh_security.create_refresh_token(subject=subject)
    response.set_cookie(key="jwt_access_token", value=access_token, httponly=True)
    response.set_cookie(key="jwt_refresh_token", value=refresh_token, httponly=True)
    return {"access_token": access_token, "refresh_token": refresh_token}

#-------------------------------------csrf-end-------------------------------------#

@auth_router.post("/refresh")
async def refresh(
        credentials: JwtAuthorizationCredentials = Security(refresh_security)
    ):
    # Update access/refresh tokens pair
    # We can customize expires_delta when creating
    access_token = access_security.create_access_token(subject=credentials.subject)
    refresh_token = refresh_security.create_refresh_token(subject=credentials.subject, expires_delta=timedelta(days=2))

    return {"access_token": access_token, "refresh_token": refresh_token}

@auth_router.post("/log_out", response_class=JSONResponse)
async def log_out(response: Response):
    # Update access/refresh tokens pair
    # We can customize expires_delta when creating
    response.set_cookie(key="jwt_access_token", value='', httponly=True)
    response.set_cookie(key="jwt_refresh_token", value='', httponly=True)

    return {"access_token": '', "refresh_token": ''}
from fastapi import APIRouter, Security, HTTPException, Response, Depends, Request
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer

from datetime import timedelta

from app.schemas.auth import AuthData
from utils.jwt import access_security, refresh_security, encrypt_user_id, decrypt_user_id
from utils.security import check_password

from db.user import User
from db.database import get_db


from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound

auth_router = APIRouter()

@auth_router.post("/auth")
async def auth(auth_data:AuthData, response: Response, session: AsyncSession = Depends(get_db),):
    # subject (actual payload) is any json-able python dict
    try:
        user: User = await User.get_user_by_email(session=session,  user_email=auth_data.email)
    except NoResultFound:
        raise HTTPException(status_code=401, detail="User not found")
    if not check_password(user=user, text=auth_data.password):
        raise HTTPException(status_code=403, detail="Invalid password")
    token_user_id = await encrypt_user_id(str(user.user_id))
    subject = {"userId": token_user_id}
    # Create new access/refresh tokens pair
    access_token = access_security.create_access_token(subject=subject)
    refresh_token = refresh_security.create_refresh_token(subject=subject)
    response.set_cookie(key="jwt_access_token", value=access_token)
    response.set_cookie(key="jwt_refresh_token", value=refresh_token)

    return {"access_token": access_token, "refresh_token": refresh_token}

@auth_router.post("/refresh")
async def refresh(
        credentials: JwtAuthorizationCredentials = Security(refresh_security)
):
    # Update access/refresh tokens pair
    # We can customize expires_delta when creating
    access_token = access_security.create_access_token(subject=credentials.subject)
    refresh_token = refresh_security.create_refresh_token(subject=credentials.subject, expires_delta=timedelta(days=2))

    return {"access_token": access_token, "refresh_token": refresh_token}


@auth_router.get("/users/me")
async def read_current_user(request: Request,
        credentials: JwtAuthorizationCredentials = Security(access_security)
):  
    print(request.cookies)
    # auto_error=False, fo we should check manually
    if not credentials:
        raise HTTPException(status_code=401, detail='my-custom-details')

    # now we can access Credentials object
    return {"username": credentials["username"], "role": credentials["role"]}
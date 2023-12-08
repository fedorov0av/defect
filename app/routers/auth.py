from fastapi import APIRouter, Security, HTTPException, Response
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from datetime import timedelta
from app.schemas.auth import AuthData
from utils.jwt import access_security, refresh_security

auth_router = APIRouter()

@auth_router.post("/auth")
async def auth(auth_data:AuthData, response: Response):
    # subject (actual payload) is any json-able python dict
    
    subject = {"username": auth_data.username, "password": auth_data.password}

    # Create new access/refresh tokens pair
    access_token = access_security.create_access_token(subject=subject)
    refresh_token = refresh_security.create_refresh_token(subject=subject)
    response.set_cookie(key="jwt", value='')
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
async def read_current_user(
        credentials: JwtAuthorizationCredentials = Security(access_security)
):  
    # auto_error=False, fo we should check manually
    if not credentials:
        raise HTTPException(status_code=401, detail='my-custom-details')

    # now we can access Credentials object
    return {"username": credentials["username"], "role": credentials["role"]}
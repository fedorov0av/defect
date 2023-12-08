from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from datetime import timedelta

SECRET_KEY = 'defect0'

# Read access token from bearer header and cookie (bearer priority)
access_security = JwtAccessBearerCookie(
    secret_key=SECRET_KEY,
    auto_error=False,
    access_expires_delta=timedelta(hours=1)  # change access token validation timedelta
)
# Read refresh token from bearer header only
refresh_security = JwtRefreshBearer(
    secret_key=SECRET_KEY, 
    auto_error=True  # automatically raise HTTPException: HTTP_401_UNAUTHORIZED 
)
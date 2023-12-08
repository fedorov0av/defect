from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials, JwtRefreshBearer, JwtAccessBearer
from datetime import timedelta
from cryptography.fernet import Fernet
import jwt
import base64


SECRET_KEY = 'UhGa_2vRrIQRVeTxtSjSpj9xWKxR3X5zMRaJlFTyaNU='

# Read access token from bearer header and cookie (bearer priority)
access_security = JwtAccessBearerCookie(
    secret_key=SECRET_KEY,
    auto_error=False,
    access_expires_delta=timedelta(hours=1),  # change access token validation timedelta
    refresh_expires_delta=timedelta(hours=24)  # change access token validation timedelta
)
# Read refresh token from bearer header only
refresh_security = JwtRefreshBearer(
    secret_key=SECRET_KEY, 
    auto_error=True  # automatically raise HTTPException: HTTP_401_UNAUTHORIZED 
)

async def decode_token(jwt_token:str) -> dict:
    decoded_data = jwt.decode(jwt=jwt_token,
                              key=SECRET_KEY,
                              algorithms=["HS256"])
    return decoded_data

async def encrypt_user_id(user_id: str) -> str:
    f = Fernet(SECRET_KEY.encode())
    token = f.encrypt(user_id.encode())
    return token.decode()

async def decrypt_user_id(token: str) -> str:
    f = Fernet(SECRET_KEY.encode())
    user_id = f.decrypt(token)
    return user_id.decode()
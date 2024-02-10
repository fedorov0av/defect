from fastapi import Request, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from starlette.templating import Jinja2Templates

from jwt.exceptions import ExpiredSignatureError, DecodeError
import starlette.status as status
from functools import wraps

from utils.jwt import decode_token, decrypt_user_id, encrypt_user_id, access_security, refresh_security


import datetime

""" {
  "subject": {
    "userId": "gAAAAABlcxc5UgiKjpRjpD3tpOrOzQiJzQskX8fqMRaxv5qxu1sTki9r1MzzZnINcl04C2iwmxPasZCedhZ0fR8UeTyukQMhNA=="
  },
  "type": "access",
  "exp": 1702045001,
  "iat": 1702041401,
  "jti": "d146ecf0-eb95-47ab-b41c-c8b02b167a0f"
} """
  

def auth_required(func):
    @wraps(func)
    async def wrapper(request: Request, response: Response = None, *args, **kwargs):
        try:
            jwt_access_token = request.cookies['jwt_access_token'] 
            data_access_jwt = await decode_token(jwt_access_token)
        except (KeyError, DecodeError):
            return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
        except ExpiredSignatureError:
            try:
                jwt_refresh_token = request.cookies['jwt_refresh_token'] 
                data_refresh_jwt = await decode_token(jwt_refresh_token)
            except (KeyError, ExpiredSignatureError, DecodeError):
                return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
            else:
                if (datetime.datetime.now().timestamp() > data_refresh_jwt['exp']):
                    print('Срок токена прошел')
                    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
        return await func(request, *args, **kwargs)
    return wrapper

async def update_jwt_tokens_by_refresh_token(request: Request, response: Response, jwt_refresh_token: str):
    token_dec = await decode_token(jwt_refresh_token)
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    token_user_id = await encrypt_user_id(str(user_id))

    subject = {"userId": token_user_id}
    access_token = access_security.create_access_token(subject=subject)
    refresh_token = refresh_security.create_refresh_token(subject=subject)
    response.set_cookie(key="jwt_access_token", value=access_token, httponly=True)
    response.set_cookie(key="jwt_refresh_token", value=refresh_token, httponly=True)

async def check_auth_api(request: Request, response: Response):
    try:
        jwt_access_token = request.cookies['jwt_access_token'] 
        data_access_jwt = await decode_token(jwt_access_token)
    except (KeyError, DecodeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT token",
        )
    except ExpiredSignatureError:
        try:
            jwt_refresh_token = request.cookies['jwt_refresh_token'] 
            data_refresh_jwt = await decode_token(jwt_refresh_token)
        except (KeyError, ExpiredSignatureError, DecodeError):
                raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid JWT token",
                )
        else:
            await update_jwt_tokens_by_refresh_token(request, response, jwt_refresh_token)
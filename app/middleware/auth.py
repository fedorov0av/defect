from fastapi import Request, HTTPException
from fastapi.responses import RedirectResponse
from jwt.exceptions import ExpiredSignatureError, DecodeError
import starlette.status as status
from functools import wraps
from utils.jwt import decode_token
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

class AuthMiddleware:
    def __init__(
            self,
    ):
        pass
    async def __call__(self, request: Request, call_next):
        # do something with the request object
        print(request.cookies)
        content_type = request.headers.get('Content-Type')
        print(content_type)
        
        # process the request and get the response    
        response = await call_next(request)
        
        return response
    

def auth_required(func):
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        try:
            jwt_access_token = request.cookies['jwt_access_token'] 
            data_jwt = await decode_token(jwt_access_token)
        except (KeyError, ExpiredSignatureError, DecodeError):
            return RedirectResponse(url="/")
        else:
            if (datetime.datetime.now().timestamp() > data_jwt['exp']):
                print('Срок токена прошел')
                return RedirectResponse(url="/")
        return await func(request, *args, **kwargs)
    return wrapper
from starlette.middleware.base import BaseHTTPMiddleware
import secure
from config import AD

class AddHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        csp = secure.ContentSecurityPolicy()
        #secure_headers = secure.Secure(csp=csp)
        secure_headers = secure.Secure(csp=None)    
        response = await call_next(request)
        secure_headers.framework.fastapi(response)
        return response
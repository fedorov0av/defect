from starlette.middleware.base import BaseHTTPMiddleware
import secure
from config import AD

class AddHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        csp = secure.ContentSecurityPolicy()
        if AD:
            secure_headers = secure.Secure(csp=csp)
        else:
            secure_headers = secure.Secure(csp=None)
            
        response = await call_next(request)
        secure_headers.framework.fastapi(response)
        return response
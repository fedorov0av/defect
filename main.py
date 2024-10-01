from fastapi import FastAPI, Request, APIRouter, Depends, Response
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
import os

from db.database import get_db

from app.api.auth import auth_router
from app.api.user import user_router
from app.api.role import role_router
from app.api.division import division_router
from app.api.defect import defect_router
from app.api.type_defect import type_defect_router
from app.api.condition_equipment import condition_equipment_router
from app.api.history import history_router
from app.api.status_defect import status_defect_router
from app.api.export import export_router
from app.api.defect_reason_core import category_reason_router
from app.api.category_defect import category_defect_router
from app.api.other import other_router
from app.api.admin import admin_router
from app.api.system import system_router


from fastapi_pagination import add_pagination
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from fastapi.encoders import jsonable_encoder

from app.middleware.auth import auth_required

from fastapi_csrf_protect import CsrfProtect
from fastapi_csrf_protect.exceptions import CsrfProtectError
from fastapi.responses import JSONResponse
from app.schemas.auth import CsrfSettings
from app.middleware.http_header import AddHeadersMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from config import AD


if AD:
  app = FastAPI(docs_url=None, redoc_url=None)
else:
  app = FastAPI()

app.add_middleware(GZipMiddleware)

add_pagination(app)

router = APIRouter()
router.include_router(auth_router)
app.include_router(router)
app.include_router(user_router)
app.include_router(role_router)
app.include_router(division_router)
app.include_router(system_router)
app.include_router(type_defect_router)
app.include_router(condition_equipment_router)
app.include_router(defect_router)
app.include_router(history_router)
app.include_router(status_defect_router)
app.include_router(export_router)
app.include_router(category_reason_router)
app.include_router(category_defect_router)
app.include_router(admin_router)
app.include_router(other_router)

app.mount("/css", StaticFiles(directory="templates/static/css"), name="static_css")
app.mount("/js", StaticFiles(directory="templates/static/js"), name="static_js")
app.mount("/img", StaticFiles(directory="templates/static/img"), name="static_img")
app.mount("/login_js", StaticFiles(directory="templates/login/js"), name="login_js")
app.mount("/defect_js", StaticFiles(directory="templates/defect/js"), name="defect_js")

app.add_middleware(AddHeadersMiddleware)

#app.add_middleware(HTTPSRedirectMiddleware) # для переадресации с 80 порта на 443
#------------------------------------test_modal_page------------------------------------#
app.mount("/temp_css_js", StaticFiles(directory="templates/temp/temp_modal_static"), name="temp_css_js")
#----------------------------------------------------------------------------------------#

templates = Jinja2Templates(directory="templates")


@app.get('/favicon.ico')
async def favicon():
    file_name = "favicon.ico"
    file_path = os.path.join(app.root_path, "templates/static/img", file_name)
    return FileResponse(path=file_path, headers={"Content-Disposition": "attachment; filename=" + file_name})

@app.get("/defect/", response_class=HTMLResponse)
@auth_required
async def get_defects(request:Request,):
    #print(request.cookies)
    return templates.TemplateResponse("defect/defect.html",context={"request":request})


@app.get("/test_modal/",response_class=HTMLResponse)
async def get_defects(request:Request):
    return templates.TemplateResponse("temp/temp_modal.html",context={"request":request})

@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    print(exc.errors())
    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": jsonable_encoder({"ValueError":"ValueError"}, exclude={"input"})})

#------------------------------------csrf-start------------------------------------#

@CsrfProtect.load_config
def get_csrf_config():
  return CsrfSettings()

@app.get("/")
@app.post("/")
async def form(request: Request, csrf_protect: CsrfProtect = Depends()):
  csrf_token, signed_token = csrf_protect.generate_csrf_tokens()
  response = templates.TemplateResponse(
    "login/login.html", {"request": request, "csrf_token": csrf_token}
  )
  csrf_protect.set_csrf_cookie(signed_token, response)
  return response

@app.exception_handler(CsrfProtectError)
def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
  return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

#-------------------------------------csrf-end-------------------------------------#
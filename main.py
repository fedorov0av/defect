from fastapi import FastAPI, Request, Security, Response
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from fastapi import APIRouter, Depends, Security, HTTPException
import os

from datetime import timedelta

from typing import Union, Optional
from db.user import User
from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import auth_router
from app.api.user import user_router
from app.api.role import role_router
from app.api.division import division_router
from app.api.defect import defect_router
from app.api.type_defect import type_defect_router
from app.api.history import history_router
from app.api.status_defect import status_defect_router
from app.api.export import export_router

from fastapi_pagination import add_pagination

from app.middleware.auth import auth_required

from fastapi_csrf_protect import CsrfProtect
from fastapi_csrf_protect.exceptions import CsrfProtectError
from fastapi.responses import JSONResponse
from app.schemas.auth import CsrfSettings


app = FastAPI()
add_pagination(app)

router = APIRouter()
router.include_router(auth_router)
app.include_router(router)
app.include_router(user_router)
app.include_router(role_router)
app.include_router(division_router)
app.include_router(type_defect_router)
app.include_router(defect_router)
app.include_router(history_router)
app.include_router(status_defect_router)
app.include_router(export_router)

app.mount("/css", StaticFiles(directory="templates/static/css"), name="static_css")
app.mount("/js", StaticFiles(directory="templates/static/js"), name="static_js")
app.mount("/img", StaticFiles(directory="templates/static/img"), name="static_img")
app.mount("/login_js", StaticFiles(directory="templates/login/js"), name="login_js")
app.mount("/defect_js", StaticFiles(directory="templates/defect/js"), name="defect_js")

templates = Jinja2Templates(directory="templates")

""" @app.get("/",response_class=HTMLResponse)
async def signin(request:Request):
    return templates.TemplateResponse("login/login.html",context={"request":request}) """

@app.get('/favicon.ico')
async def favicon():
    file_name = "favicon.ico"
    file_path = os.path.join(app.root_path, "templates/static/img", file_name)
    return FileResponse(path=file_path, headers={"Content-Disposition": "attachment; filename=" + file_name})

@app.get("/defect/",response_class=HTMLResponse)
@auth_required
async def get_defects(request:Request):
    #print(request.cookies)
    return templates.TemplateResponse("defect/defect.html",context={"request":request})

@app.get("/test_defect/",response_class=HTMLResponse)
async def get_defects(request:Request):
    #print(request.cookies)
    return templates.TemplateResponse("defect/test_defect.html",context={"request":request})


#------------------------------------csrf-start------------------------------------#

@CsrfProtect.load_config
def get_csrf_config():
  return CsrfSettings()

@app.get("/")
async def form(request: Request, csrf_protect: CsrfProtect = Depends()):
  csrf_token, signed_token = csrf_protect.generate_csrf_tokens()
  response = templates.TemplateResponse(
    "login/login.html", {"request": request, "csrf_token": csrf_token}
  )
  print(response)
  csrf_protect.set_csrf_cookie(signed_token, response)
  return response


@app.exception_handler(CsrfProtectError)
def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
  return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

#-------------------------------------csrf-end-------------------------------------#
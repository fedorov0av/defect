from fastapi import FastAPI, Request, Security, Response
from fastapi.responses import HTMLResponse 
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from fastapi import APIRouter, Depends, Security, HTTPException

from datetime import timedelta

from typing import Union, Optional
from db.user import User
from db.database import get_db

from sqlalchemy.ext.asyncio import AsyncSession

from app.routers.auth import auth_router
from app.middleware.auth import auth_required

app = FastAPI()
router = APIRouter()
router.include_router(auth_router)
app.include_router(router)

app.mount("/css", StaticFiles(directory="templates/static/css"), name="static_css")
app.mount("/js", StaticFiles(directory="templates/static/js"), name="static_js")
app.mount("/img", StaticFiles(directory="templates/static/img"), name="static_img")

templates = Jinja2Templates(directory="templates")


@app.get("/",response_class=HTMLResponse)
async def signin(request:Request):
    return templates.TemplateResponse("login/login.html",context={"request":request})

@app.get("/defect/",response_class=HTMLResponse)
@auth_required
async def get_defects(request:Request):
    #print(request.cookies)
    return templates.TemplateResponse("defect/defect.html",context={"request":request})

@app.get("/user/{item_id}")
async def get_user(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/users/")
async def get_users(session: AsyncSession = Depends(get_db)):
    result = await User.get_all_users(session)
    print(result)
    return result
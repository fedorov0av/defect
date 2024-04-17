from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.history_defect import History
from db.defect import Defect
from db.database import get_db

from app.schemas.defect import Defect_id
from app.middleware.auth import check_auth_api

from config import AD
from utils.ldap import LdapConnection
from utils.jwt import decrypt_user_id, decode_token
from app.schemas.user import UserAD

history_router = APIRouter()

@history_router.post("/history_by_defect/")
async def get_history_by_defect(request: Request, response: Response, defect_id: Defect_id, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    result: list[History] = await History.get_history_by_defect(session, defect)
    history_l = list()
    if AD:
        token_dec = await decode_token(request.cookies['jwt_refresh_token'])
        user_id = await decrypt_user_id(token_dec['subject']['userId'])
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
    for history in result:
        if AD:
            user: UserAD =  await ldap_connection.get_user_by_uid_from_AD(history.history_user_id)
        history_l.append(
            {
                'history_id': history.history_id,
                'history_date': history.history_created_at.strftime("%d.%m.%Y %H:%M:%S"),
                'history_status': history.history_status.status_defect_name,
                'history_user': history.history_user if not AD else user,
                'history_comment': history.history_comment,
            }
        )
    return history_l
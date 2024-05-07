from datetime import datetime
from fastapi import APIRouter, Depends, Request, Response
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import PendingRollbackError, NoResultFound, IntegrityError

from db.database import get_db
from db.user import User
from db.defect import Defect
from db.division import Division
from db.system import System
from db.status_defect import StatusDefect
from db.type_defect import TypeDefect
from db.history_defect import History
from db.category_defect import CategoryDefect
from db.defect_reason_core import CategoryCoreReason
from db.defect_reason_direct import CategoryDirectReason

from utils.ldap import LdapConnection
from app.schemas.user import User_id, UserAD
from app.schemas.defect import New_defect_p, Defect_id, Defects_output, Defect_description_p, Defect_location_p
from app.schemas.status_defect import StatusDefect_name
from app.schemas.other import Date_p, Division_id, Сomment, Filter, Ppr, Pnr, Safety, Exploitation
from app.schemas.type_defect import TypeDefect_name
from app.schemas.system import System_kks, System_name
from app.schemas.category_defect import CategoryDefect_id, ClassSystem_name, CoreClassification_code, DirectClassification_code, DirectClassification_name
from app.middleware.auth import check_auth_api, check_refresh_token

from utils.jwt import decrypt_user_id, decode_token
from config import AD

STATUS_REGISTRATION = 1
STATUS_CONFIRM = 2
STATUS_CLOSE_DEFECT_ID = 10
STATUS_CANCEL_DEFECT_ID = 9

defect_router = APIRouter()


async def add_system(session: AsyncSession, system_name: str, system_kks: str = None): # добавление оборудования в БД
    try:
        if system_kks:
            await System.add_system(session, system_name, system_kks)
            system = await System.get_system_by_kks(session, system_kks)
        else:
            try:
                system = await System.get_system_by_name(session, system_name)
            except NoResultFound:
                await System.add_system(session, system_name=system_name, system_kks=None)
                system = await System.get_system_by_name(session, system_name)
    except (PendingRollbackError, IntegrityError):
        await session.rollback()
        system: System = await System.get_system_by_kks(session, system_kks)
        if system_name:
            system.system_name = system_name
    return system

async def get_user_for_defect(session: AsyncSession, request: Request, token_dec: dict): # получаем объект User из БД или AD
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    if AD:
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        user: UserAD = await ldap_connection.get_user_by_uid_from_AD(user_id)
    else:
        user: User = await User.get_user_by_id(session, user_id)
    return user

class UserDefectFromAD:
    def __init__(self, session: AsyncSession, request: Request, token_dec: dict):
        self.session: AsyncSession = session
        self.request: Request = request
        self.token_dec: dict = token_dec

    async def get_user_from_AD_for_paginate(self, defects: list[Defect]):
        result = list()
        user_id = await decrypt_user_id(self.token_dec['subject']['userId'])
        """ passw = await decrypt_user_id(self.token_dec['subject']['userP'])
        ldap_connection = LdapConnection(self.session, user_id, passw) """
        ldap_connection = LdapConnection(self.session, user_id)
        for defect in defects:
            defect_registrar: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_registrator_id)
            defect_owner: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_owner_id) if defect.defect_owner_id else None
            defect_owner_surname = defect_owner.user_surname if defect_owner else None
            repair_manager: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_repair_manager_id) if defect.defect_repair_manager_id else None
            defect_repair_manager = {'user_surname': repair_manager.user_surname if repair_manager else '',
                                    'user_name': repair_manager.user_name if repair_manager else ''}
            defect_worker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_worker_id) if defect.defect_worker_id else None
            result.append(
                {'defect_id': defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect_registrar.user_surname,
                'defect_owner_surname': defect_owner_surname,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': defect_repair_manager,
                'defect_worker': defect_worker,
                'defect_planned_finish_date': (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else defect.defect_planned_finish_date)
                                                if not defect.defect_ppr else 'Устр. в ППР',
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,}
                )
        return result


@defect_router.post("/defect/add")
async def add_new_defect(request: Request, response: Response, defect_p: New_defect_p, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
    system = await add_system(session, defect_p.defect_system_name, defect_p.defect_system_kks)
    user = await get_user_for_defect(session, request, token_dec)
    defect_type: TypeDefect = await TypeDefect.get_defect_by_name(session, defect_p.defect_type_defect_name)
    defect_status: StatusDefect = await StatusDefect.get_status_defect_by_id(session, STATUS_REGISTRATION)
    if defect_p.defect_category_defect_id != 0:
        category_defect: CategoryDefect = await CategoryDefect.get_category_defect_by_id(session, defect_p.defect_category_defect_id)
    else: 
        category_defect = None
    if defect_p.defect_core_reason_code:
        defect_core_category_reason = await CategoryCoreReason.get_category_core_reason_by_code(session, defect_p.defect_core_reason_code)
    if defect_p.defect_direct_reason_code:
        defect_direct_category_reason = await CategoryDirectReason.add_category_direct_reason(session,
                                                                                            category_reason_code=defect_p.defect_direct_reason_code,
                                                                                            category_reason_name=defect_p.defect_direct_reason_name)
    if defect_p.defect_user_division_id:
        division = await Division.get_division_by_id(session, int(defect_p.defect_user_division_id))
    defect = await Defect.add_defect(
        session=session,
        defect_registrator=user,
        defect_description=defect_p.defect_description,
        defect_system=system,
        defect_location=defect_p.defect_location,
        defect_type=defect_type,
        defect_status=defect_status,
        defect_division=division if defect_p.defect_user_division_id else user.user_division,
        defect_safety=defect_p.defect_safety,
        defect_pnr=defect_p.defect_pnr,
        defect_exploitation=defect_p.defect_exploitation,
        defect_system_klass=defect_p.defect_class_system,
        defect_category_defect=category_defect,
        defect_core_category_reason=defect_core_category_reason if defect_p.defect_core_reason_code else None,
        defect_direct_category_reason=defect_direct_category_reason if defect_p.defect_direct_reason_code else None,
    )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=defect_status,
        )
    return defect


@defect_router.post("/defects/", response_model=Page[Defects_output]) # fix by AD
async def get_defects(request: Request, response: Response, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    if AD:
        token_dec = await decode_token(request.cookies['jwt_refresh_token'])
        user_defect = UserDefectFromAD(session, request, token_dec)
    return await paginate(
        session,
        select(Defect).order_by(Defect.defect_id.desc()).where(Defect.defect_status_id != STATUS_CLOSE_DEFECT_ID, Defect.defect_status_id != STATUS_CANCEL_DEFECT_ID)\
                .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system)).options(selectinload(Defect.defect_checker)) if not AD else
        select(Defect).order_by(Defect.defect_id.desc()).where(Defect.defect_status_id != STATUS_CLOSE_DEFECT_ID, Defect.defect_status_id != STATUS_CANCEL_DEFECT_ID)\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system)),
        transformer=(lambda defects: [{"defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect.defect_registrar.user_surname if not AD else '',
                'defect_owner_surname': defect.defect_owner.user_surname if defect.defect_owner else None,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': {'user_surname': defect.defect_repair_manager.user_surname if defect.defect_repair_manager else '',
                                          'user_name': defect.defect_repair_manager.user_name if defect.defect_repair_manager else ''
                                          },
                'defect_worker': defect.defect_worker,
                'defect_planned_finish_date': (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else defect.defect_planned_finish_date)
                                             if not defect.defect_ppr else 'Устр. в ППР',
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,} for defect in defects if defect]) if not AD else user_defect.get_user_from_AD_for_paginate
        )

@defect_router.post("/get_defect/")
async def get_defect(request: Request, response: Response, defect_id: Defect_id, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    defect: Defect = await Defect.get_defect_by_id(session=session, defect_id=defect_id.defect_id)
    if AD:
        token_dec = await decode_token(request.cookies['jwt_refresh_token'])
        user_id = await decrypt_user_id(token_dec['subject']['userId'])
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        defect_registrar = await ldap_connection.get_user_by_uid_from_AD(defect.defect_registrator_id)
        defect_owner: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_owner_id) if defect.defect_owner_id else None
        defect_owner_surname = defect_owner.user_surname if defect_owner else None
        repair_manager: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_repair_manager_id ) if defect.defect_repair_manager_id else None
        defect_worker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_worker_id) if defect.defect_worker_id else None
        checker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_checker_id) if defect.defect_checker_id else None
        defect_checker = {  'user_surname': checker.user_surname if checker else '',
                            'user_name': checker.user_name if checker else '',
                            'user_id': checker.user_id,
                                    } if checker else None
    return  {
                "defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect.defect_registrar if not AD else defect_registrar,
                'defect_owner_surname': (defect.defect_owner.user_surname if defect.defect_owner else None) if not AD else defect_owner_surname,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': defect.defect_repair_manager if not AD else repair_manager,
                'defect_worker': defect.defect_worker if not AD else defect_worker,
                'defect_planned_finish_date': defect.defect_planned_finish_date.strftime("%Y-%m-%d") if defect.defect_planned_finish_date else defect.defect_planned_finish_date,
                'defect_ppr': defect.defect_ppr,
                "defect_description": defect.defect_description,
                'defect_work_comment': defect.defect_work_comment,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,
                "defect_check_result": defect.defect_check_result,
                "defect_checker": ({ 'user_surname': defect.defect_checker.user_surname,
                                    'user_name': defect.defect_checker.user_name,
                                    'user_id': defect.defect_checker.user_id,
                                   } if defect.defect_checker else None) if not AD else defect_checker,
                "defect_safety": defect.defect_safety,
                "defect_pnr": defect.defect_pnr,
                "defect_exploitation": defect.defect_exploitation,
                "defect_localized": defect.defect_localized,
                "defect_category_defect": defect.defect_category_defect if defect.defect_category_defect else None,
                "defect_system_klass": defect.defect_system_klass if defect.defect_system_klass else None,
                "defect_core_category_reason": defect.defect_core_category_reason if defect.defect_core_category_reason else None,
                "defect_direct_category_reason": defect.defect_direct_category_reason if defect.defect_direct_category_reason else None,
            }

@defect_router.post("/confirm_defect/")
async def confirm_defect(request: Request, response: Response, 
                        defect_id: Defect_id,
                        status_name: StatusDefect_name,
                        repair_manager_id: User_id,
                        division_id: Division_id,
                        defect_description: Defect_description_p = None,
                        location: Defect_location_p = None,
                        system_name: System_name = None,
                        system_kks: System_kks = None,
                        type_defect_name: TypeDefect_name = None,
                        defect_planned_finish_date_str: Date_p = None,
                        defect_ppr: Ppr = None,
                        defect_pnr: Pnr = None,
                        defect_safety: Safety = None,
                        defect_exploitation: Exploitation = None,
                        category_defect_id: CategoryDefect_id = None,
                        class_system_name: ClassSystem_name = None,
                        core_classification_code: CoreClassification_code = None,
                        direct_classification_code: DirectClassification_code = None,
                        direct_classification_name: DirectClassification_name = None,
                        comment: Сomment = None,
                        session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    system = await add_system(session, system_name.system_name, system_kks.system_kks)
    try:
        if direct_classification_code.direct_rarery_code:
            await CategoryDirectReason.add_category_direct_reason(session=session,
                                                              category_reason_code=direct_classification_code.direct_rarery_code,
                                                              category_reason_name=direct_classification_name.direct_rarery_name)
            direct_classification = await CategoryDirectReason.get_category_direct_reason_by_code(session, direct_classification_code.direct_rarery_code)
        else:
            direct_classification = None
    except (PendingRollbackError, IntegrityError):
        await session.rollback()
        system = await add_system(session, system_name.system_name, system_kks.system_kks)
        direct_classification = await CategoryDirectReason.get_category_direct_reason_by_code(session, direct_classification_code.direct_rarery_code)
        if direct_classification_name.direct_rarery_name:
            direct_classification.category_reason_name = direct_classification_name.direct_rarery_name
    if core_classification_code.core_rarery_code:
        core_classification = await CategoryCoreReason.get_category_core_reason_by_code(session, core_classification_code.core_rarery_code)
    else:
        core_classification = None
    if type_defect_name.type_defect_name:
            type_defect: TypeDefect = await TypeDefect.get_defect_by_name(session, type_defect_name=type_defect_name.type_defect_name)
            type_defect_id = type_defect.type_defect_id
    else: type_defect_id = None
    if category_defect_id.category_defect_id:
        category_defect: CategoryDefect = await CategoryDefect.get_category_defect_by_id(session, category_defect_id.category_defect_id)
    else: 
        category_defect = None
    if AD:
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        user: UserAD =  await ldap_connection.get_user_by_uid_from_AD(user_id)
    else:
        user: User = await User.get_user_by_id(session, user_id)
    if AD:
        repair_manager: UserAD =  await ldap_connection.get_user_by_uid_from_AD(repair_manager_id.user_id)
    else:
        repair_manager: User = await User.get_user_by_id(session, repair_manager_id.user_id)
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    #defect_planned_finish_date = datetime.strptime(defect_planned_finish_date_str.date, "%d.%m.%Y").date() #    2023-12-23
    if defect_planned_finish_date_str.date:
        if defect_ppr.ppr:
            defect_planned_finish_date = None
        else:
            defect_planned_finish_date = datetime.strptime(defect_planned_finish_date_str.date, "%Y-%m-%d").date() #    2023-12-23
    division: Division = await Division.get_division_by_id(session, division_id.division_id)
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)
    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect.defect_id,
                                            defect_status_id = status_defect.status_defect_id,
                                            defect_repair_manager_id=repair_manager.user_id,
                                            defect_planned_finish_date = defect_planned_finish_date if defect_planned_finish_date_str.date else None,
                                            defect_ppr = defect_ppr.ppr,
                                            defect_pnr = defect_pnr.pnr,
                                            defect_safety = defect_safety.safety,
                                            defect_exploitation = defect_exploitation.exploitation,
                                            defect_division_id = division.division_id,
                                            defect_system_klass = class_system_name.class_system_name,
                                            defect_category_defect_id = category_defect.category_defect_id if category_defect else None,
                                            defect_core_category_reason_code = core_classification.category_reason_code if core_classification else core_classification,
                                            defect_direct_category_reason_code = direct_classification.category_reason_code if direct_classification else direct_classification,
                                            defect_location = location.defect_location if location.defect_location else None,
                                            defect_description = defect_description.defect_description if defect_description.defect_description else None,
                                            defect_system_id = system.system_id if (system_name.system_name or system_kks.system_kks) else None,
                                            defect_type_id = type_defect_id,
                                            confirm_defect=True)
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        comment=comment.comment if comment.comment else None,
        )
    return defect

@defect_router.post("/accept_defect/")
async def accept_defect(
                    request: Request,
                    response: Response, 
                    defect_id: Defect_id,
                    status_name: StatusDefect_name,
                    worker_id: User_id,
                    comment: Сomment = None,
                    session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    if AD:
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        user: UserAD =  await ldap_connection.get_user_by_uid_from_AD(user_id)
    else:
        user: User = await User.get_user_by_id(session, user_id)
    if AD:
        worker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(worker_id.user_id)
    else:
        worker: User = await User.get_user_by_id(session, worker_id.user_id)
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)
    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect_id.defect_id,
                                            defect_status_id = status_defect.status_defect_id,
                                            defect_worker_id = worker.user_id,
                                            )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        comment=comment.comment if comment.comment else None,
        )
    return defect

@defect_router.post("/check_defect/")
async def check_defect(
                    request: Request,
                    response: Response, 
                    defect_id: Defect_id,
                    status_name: StatusDefect_name,
                    checker_id: User_id,
                    defect_check_result: Сomment,
                    session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    if AD:
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        user: UserAD =  await ldap_connection.get_user_by_uid_from_AD(user_id)
    else:
        user: User = await User.get_user_by_id(session, user_id)
    if AD:
        checker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(checker_id.user_id)
    else:
        checker: User = await User.get_user_by_id(session, checker_id.user_id)
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)

    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect_id.defect_id,
                                            defect_status_id = status_defect.status_defect_id,
                                            defect_checker_id = checker.user_id,
                                            defect_check_result = defect_check_result.comment,
                                            )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        comment=defect_check_result.comment
        )
    return defect

@defect_router.post("/finish_work_defect/")
async def finish_work_defect(
                    request: Request,
                    response: Response, 
                    defect_id: Defect_id,
                    status_name: StatusDefect_name,
                    worker_description: Сomment,
                    session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    if AD:
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        user: UserAD =  await ldap_connection.get_user_by_uid_from_AD(user_id)
    else:
        user: User = await User.get_user_by_id(session, user_id)
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)

    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect_id.defect_id,
                                            defect_status_id = status_defect.status_defect_id,
                                            defect_work_comment = worker_description.comment,
                                            )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        comment=worker_description.comment
        )
    return defect

############################# в работе ##########################
@defect_router.post("/close_defect/")
async def close_defect(
                    request: Request,
                    response: Response, 
                    defect_id: Defect_id,
                    status_name: StatusDefect_name,
                    category_defect_id: CategoryDefect_id = None,
                    class_system_name: ClassSystem_name = None,
                    core_classification_code: CoreClassification_code = None,
                    direct_classification_code: DirectClassification_code = None,
                    #direct_classification_name: DirectClassification_name = None,
                    comment: Сomment = None,
                    session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    token_dec = await decode_token(request.cookies['jwt_refresh_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    try:
        if direct_classification_code.direct_rarery_code:
            #await CategoryDirectReason.add_category_direct_reason(session=session,
            #                                                 category_reason_code=direct_classification_code.direct_rarery_code)
            #                                                  #category_reason_name=direct_classification_name.direct_rarery_name)
            direct_classification = await CategoryDirectReason.get_category_direct_reason_by_code(session, direct_classification_code.direct_rarery_code)
        else:
            direct_classification = None
    except (PendingRollbackError, IntegrityError):
        await session.rollback()
        direct_classification = await CategoryDirectReason.get_category_direct_reason_by_code(session, direct_classification_code.direct_rarery_code)
        #if direct_classification_name.direct_rarery_name:
         #   direct_classification.category_reason_name = direct_classification_name.direct_rarery_name
    if core_classification_code.core_rarery_code:
        core_classification = await CategoryCoreReason.get_category_core_reason_by_code(session, core_classification_code.core_rarery_code)
    else:
        core_classification = None
    if category_defect_id.category_defect_id:
        category_defect: CategoryDefect = await CategoryDefect.get_category_defect_by_id(session, category_defect_id.category_defect_id)
    else: 
        category_defect = None
    if AD:
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        user: UserAD =  await ldap_connection.get_user_by_uid_from_AD(user_id)
    else:
        user: User = await User.get_user_by_id(session, user_id)
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)

    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect_id.defect_id,
                                            defect_status_id = status_defect.status_defect_id,
                                            defect_system_klass = class_system_name.class_system_name,
                                            defect_category_defect_id = category_defect.category_defect_id if category_defect else None,
                                            defect_core_category_reason_code = core_classification.category_reason_code if core_classification else core_classification,
                                            defect_direct_category_reason_code = direct_classification.category_reason_code if direct_classification else direct_classification,
                                            close_defect=True,
                                            )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        comment=comment.comment if comment.comment else None,
        )
    return defect
#################################################################


@defect_router.post("/get_defect_by_filter/")
async def get_defect_by_filter(request: Request, response: Response, filter: Filter, 
                        session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    result: list[Defect] = await Defect.get_defects_by_filter(
                                            session = session,
                                            division_id = filter.division_id,
                                            date_start = filter.date_start,
                                            date_end = filter.date_end,
                                            status_id = filter.status_id,
                                            ppr = filter.ppr,
                                            pnr = filter.pnr,
                                            safety = filter.safety,
                                            exploitation = filter.exploitation,
                                            type_defect_id = filter.type_defect_id,
                                            )
    defects_with_filters = list()
    for defect in result:
        if AD:
            token_dec = await decode_token(request.cookies['jwt_refresh_token'])
            user_id = await decrypt_user_id(token_dec['subject']['userId'])
            """ passw = await decrypt_user_id(token_dec['subject']['userP'])
            ldap_connection = LdapConnection(session, user_id, passw) """
            ldap_connection = LdapConnection(session, user_id)
            defect_registrar: UserAD = await ldap_connection.get_user_by_uid_from_AD(defect.defect_registrator_id)
            defect_owner: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_owner_id) if defect.defect_owner_id else None
            defect_owner_surname = defect_owner.user_surname if defect_owner else None
            repair_manager: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_repair_manager_id) if defect.defect_repair_manager_id else None
            checker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_checker_id) if defect.defect_checker_id else None
            defect_checker = {'user_surname': checker.user_surname if checker else '',
                                        'user_name': checker.user_name if checker else ''}            
            defect_worker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_worker_id) if defect.defect_worker_id else None
        defects_with_filters.append(
            {
                "defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect.defect_registrar.user_surname if not AD else defect_registrar.user_surname,
                'defect_owner_surname': (defect.defect_owner.user_surname if defect.defect_owner else None) if not AD else defect_owner_surname,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': ({'user_surname': defect.defect_repair_manager.user_surname if defect.defect_repair_manager else '',
                                          'user_name': defect.defect_repair_manager.user_name if defect.defect_repair_manager else ''
                                          })  if not AD else
                                          ({'user_surname': repair_manager.user_surname if repair_manager else '',
                                          'user_name': repair_manager.user_name if repair_manager else ''
                                          }),
                'defect_worker': defect.defect_worker if not AD else defect_worker,
                'defect_planned_finish_date': (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else defect.defect_planned_finish_date)
                                        if not defect.defect_ppr else 'Устр. в ППР',
                """ 'defect_planned_finish_date': (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else defect.defect_planned_finish_date)
                                        if not defect.defect_ppr else 'Устр. в ППР', """
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,
            }
        )
    return defects_with_filters

@defect_router.post("/update_table_by_timer/")
async def add_new_defect(request: Request, response: Response, defect_p: New_defect_p, session: AsyncSession = Depends(get_db)):
    await check_refresh_token(request, response) # проверка на истечение времени jwt токена

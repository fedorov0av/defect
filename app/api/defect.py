from datetime import datetime
from fastapi import APIRouter, Depends, Request
from utils.jwt import decrypt_user_id, decode_token
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from db.database import get_db
from db.user import User
from db.defect import Defect
from db.division import Division
from db.system import System
from db.status_defect import StatusDefect
from db.type_defect import TypeDefect
from db.history_defect import History

from app.schemas.user import User_id
from app.schemas.defect import New_defect_p, Defect_id, Defects_output
from app.schemas.status_defect import StatusDefect_name
from app.schemas.other import Date_p, Division_id, Сomment, Filter, Ppr


STATUS_REGISTRATION = 1
STATUS_CONFIRM = 2

defect_router = APIRouter()

@defect_router.post("/defect/add")
async def add_new_defect(defect_p: New_defect_p, request: Request, session: AsyncSession = Depends(get_db)):
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    try:
        await System.add_system(session, defect_p.defect_system_name, defect_p.defect_system_kks)
        system = await System.get_system_by_kks(session, defect_p.defect_system_kks)
    except IntegrityError:
        system: System = await System.get_system_by_kks(session, defect_p.defect_system_kks)
    defect_type: TypeDefect = await TypeDefect.get_defect_by_name(session, defect_p.defect_type_defect_name)
    defect_status: StatusDefect = await StatusDefect.get_status_defect_by_id(session, STATUS_REGISTRATION)
    defect = await Defect.add_defect(
        session=session,
        defect_registrator=user,
        defect_description=defect_p.defect_description,
        defect_system=system,
        defect_location=defect_p.defect_location,
        defect_type=defect_type,
        defect_status=defect_status,
        defect_division=user.user_division
    )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=defect_status,
        )
    return defect

@defect_router.post("/defects/" , response_model=Page[Defects_output]) # для тестирования пагинации
async def get_defects(session: AsyncSession = Depends(get_db)):
    return await paginate(
        session,
        select(Defect).order_by(Defect.defect_id)\
                .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system)),
        transformer=lambda defects: [{"defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect.defect_registrar.user_surname,
                'defect_owner_surname': defect.defect_owner.user_surname if defect.defect_owner else None,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': {'user_surname': defect.defect_repair_manager.user_surname if defect.defect_repair_manager else '',
                                          'user_name': defect.defect_repair_manager.user_name if defect.defect_repair_manager else ''
                                          } ,
                'defect_worker': defect.defect_worker,
                'defect_planned_finish_date': (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else defect.defect_planned_finish_date)
                                             if not defect.defect_ppr else 'Устр. в ППР',
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,} for defect in defects],
    )


@defect_router.post("/get_defect/")
async def get_defect(defect_id: Defect_id, session: AsyncSession = Depends(get_db)):
    defect: Defect = await Defect.get_defect_by_id(session=session, defect_id=defect_id.defect_id)
    return  {
                "defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect.defect_registrar.user_surname,
                'defect_owner_surname': defect.defect_owner.user_surname if defect.defect_owner else None,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': defect.defect_repair_manager,
                'defect_worker': defect.defect_worker,
                'defect_planned_finish_date': defect.defect_planned_finish_date.strftime("%Y-%m-%d") if defect.defect_planned_finish_date else defect.defect_planned_finish_date,
                'defect_ppr': defect.defect_ppr,
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,
                'defect_checker': { 'user_surname': defect.defect_checker.user_surname,
                                    'user_id': defect.defect_checker.user_id,
                                   } if defect.defect_checker else None
            }

@defect_router.post("/confirm_defect/")
async def confirm_defect(defect_id: Defect_id,
                      status_name: StatusDefect_name,
                      repair_manager_id: User_id,
                      division_id: Division_id,
                      request: Request,
                      defect_planned_finish_date_str: Date_p = None,
                      defect_ppr: Ppr = None,
                      session: AsyncSession = Depends(get_db)):
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    repair_manager: User = await User.get_user_by_id(session, int(repair_manager_id.user_id))
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
                                            defect_division_id = division.division_id,
                                            confirm_defect=True)
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        )
    return defect

@defect_router.post("/accept_defect/")
async def accept_defect(defect_id: Defect_id,
                      status_name: StatusDefect_name,
                      worker_id: User_id,
                      request: Request,
                      session: AsyncSession = Depends(get_db)):
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    worker: User = await User.get_user_by_id(session, int(worker_id.user_id))
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
        )
    return defect

@defect_router.post("/finish_work_defect/")
async def finish_work_defect(defect_id: Defect_id,
                      status_name: StatusDefect_name,
                      worker_description: Сomment,
                      request: Request,
                      session: AsyncSession = Depends(get_db)):
    token_dec = await decode_token(request.cookies['jwt_access_token'])
    user_id = await decrypt_user_id(token_dec['subject']['userId'])
    user: User = await User.get_user_by_id(session, int(user_id))
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)
    status_defect: StatusDefect = await StatusDefect.get_status_defect_by_name(session=session, status_defect_name=status_name.status_defect_name)

    defect = await Defect.update_defect_by_id(session = session,
                                            defect_id = defect_id.defect_id,
                                            defect_status_id = status_defect.status_defect_id,
                                            )
    history = await History.add_history(
        session=session,
        defect=defect,
        user=user,
        status=status_defect,
        comment=worker_description.comment,
        )
    return defect

@defect_router.post("/get_defect_by_filter/")
async def get_defect_by_filter(  filter: Filter, 
                        session: AsyncSession = Depends(get_db)):
    result: list[Defect] = await Defect.get_defects_by_filter(session, filter.division_id, filter.date_start, filter.date_end, filter.status_id, filter.ppr)
    defects_with_filters = list()
    for defect in result:
        defects_with_filters.append(
            {
                "defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect.defect_registrar.user_surname,
                'defect_owner_surname': defect.defect_owner.user_surname if defect.defect_owner else None,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': {'user_surname': defect.defect_repair_manager.user_surname if defect.defect_repair_manager else '',
                                          'user_name': defect.defect_repair_manager.user_name if defect.defect_repair_manager else ''
                                          } ,
                'defect_worker': defect.defect_worker,
                'defect_planned_finish_date': (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else defect.defect_planned_finish_date)
                                        if not defect.defect_ppr else 'Устр. в ППР',
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

""" 
@defect_router.post("/defects_temp/")
async def get_defects(session: AsyncSession = Depends(get_db)):
    result: list[Defect] = await Defect.get_all_defect(session)
    defect_l = list()
    for defect in result:
        defect_l.append(
            {
                "defect_id": defect.defect_id,
                'defect_created_at': defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                'defect_registrar': defect.defect_registrar.user_surname,
                'defect_owner_surname': defect.defect_owner.user_surname if defect.defect_owner else None,
                'defect_owner': defect.defect_division.division_name,
                'defect_repair_manager': {'user_surname': defect.defect_repair_manager.user_surname if defect.defect_repair_manager else '',
                                          'user_name': defect.defect_repair_manager.user_name if defect.defect_repair_manager else ''
                                          } ,
                'defect_worker': defect.defect_worker,
                'defect_planned_finish_date': defect.defect_planned_finish_date.strftime("%Y-%m-%d") if defect.defect_planned_finish_date else defect.defect_planned_finish_date,
                "defect_description": defect.defect_description,
                "defect_location": defect.defect_location,
                "defect_type": defect.defect_type,
                "defect_status": defect.defect_status,
                "defect_division": defect.defect_division,
                "defect_system": defect.defect_system,
                "defect_system_kks": defect.defect_system.system_kks,
            }
        )
    return defect_l """
import datetime
from sqlalchemy import ForeignKey, Integer, Text, String, func, select, Boolean, or_
from sqlalchemy.orm import Mapped, mapped_column, relationship, selectinload
from sqlalchemy.sql import func
from sqlalchemy.types import TypeDecorator, DateTime
from sqlalchemy.sql import false

from db.base import Base
from db.user import User
from db.type_defect import TypeDefect
from db.system import System
from db.status_defect import StatusDefect
from db.division import Division

from sqlalchemy.ext.asyncio import AsyncSession
from db.utils import get_time


class Defect(Base):
    __tablename__ = "defect" # процесс учета средств оснащения
    defect_id: Mapped[str] = mapped_column(String(10), primary_key=True) # первичный ключ '23-0000175'
    defect_created_at: Mapped[datetime.datetime]

    defect_registrator_id: Mapped[int] = mapped_column(ForeignKey("user.user_id")) # id поста из таблицы User - регистратор дефекта.
    defect_registrar: Mapped["User"] = relationship(foreign_keys=[defect_registrator_id]) #  для работы с таблицей User как с объектом
    defect_owner_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - владелец оборудования.
    defect_owner: Mapped["User"] = relationship(foreign_keys=[defect_owner_id]) #  для работы с таблицей User как с объектом
    defect_repair_manager_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_repair_manager: Mapped["User"] = relationship(foreign_keys=[defect_repair_manager_id]) #  для работы с таблицей User как с объектом
    defect_worker_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_worker: Mapped["User"] = relationship(foreign_keys=[defect_worker_id]) #  для работы с таблицей User как с объектом
    defect_checker_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - выполняющий ОП проверку.
    defect_checker: Mapped["User"] = relationship(foreign_keys=[defect_checker_id]) #  для работы с таблицей User как с объектом

    defect_planned_finish_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=True)  # планируемая дата завершения ремонта

    defect_ppr: Mapped[bool] = mapped_column(Boolean, server_default=false(), default=False) # Устранить в ППР?
    defect_safety: Mapped[bool] = mapped_column(Boolean, server_default=false(), default=False) # Влияет на безопасность?
    defect_pnr: Mapped[bool] = mapped_column(Boolean, server_default=false(), default=False) # Влияет на нагрузку?
    defect_exploitation: Mapped[bool] = mapped_column(Boolean, server_default=false(), default=False) # True - дефект в эксплуатации; False - дефект в ПНР?
    defect_localized: Mapped[bool] = mapped_column(Boolean, server_default=false(), default=False) # Дефект локализован? (В ЦС ТОИР данное значение назвается "Временно устранен")

    defect_description: Mapped[str] = mapped_column(String(500)) # Описание дефекта.
    defect_check_result: Mapped[str] = mapped_column(String(500), nullable=True) # Результат проверки.
    defect_work_comment: Mapped[str] = mapped_column(String(500), nullable=True) # Комментарий исполнителя после выполнения работ.
    defect_location: Mapped[str] = mapped_column(String(500), nullable=True) # Местоположение дефекта.
    defect_type_id: Mapped[int] = mapped_column(ForeignKey("type_defect.type_defect_id")) # вид дефекта
    defect_type: Mapped["TypeDefect"] = relationship(foreign_keys=[defect_type_id]) #  для работы с таблицей TypeDefect как с объектом
    defect_status_id: Mapped[int] = mapped_column(ForeignKey("status_defect.status_defect_id")) # статус (Этап) дефекта
    defect_status: Mapped["StatusDefect"] = relationship(foreign_keys=[defect_status_id]) #  для работы с таблицей StatusDefect как с объектом
    defect_division_id: Mapped[int] = mapped_column(ForeignKey("division.division_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_division: Mapped["Division"] = relationship(foreign_keys=[defect_division_id]) #  для работы с таблицей User как с объектом
    defect_system_id: Mapped[int] = mapped_column(ForeignKey("system.system_id")) # вид дефекта
    defect_system: Mapped["System"] = relationship(foreign_keys=[defect_system_id]) #  для работы с таблицей System как с объектом
    

    @staticmethod
    async def get_all_defect(session: AsyncSession): # получение всех систем в БД
        query = select(Defect).order_by(Defect.defect_id)\
                .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system)).options(selectinload(Defect.defect_checker))
        result = await session.scalars(query)
        defects = result.all()
        return defects
    
    @staticmethod
    async def add_defect(session: AsyncSession, defect_registrator: User, defect_description: str, defect_system: System,
                          defect_location: str, defect_type: TypeDefect, defect_status: StatusDefect, defect_division: Division, defect_safety: bool,
                          defect_pnr: bool, defect_exploitation: bool,): # добавление системы в БД
        defects = await Defect.get_all_defect(session)
        now_year = str(datetime.datetime.now().date().year)[2:]
        if len(defects):
            defect_last = defects[-1]
            defect_last_year = defect_last.defect_id.split('-')[0]
            if now_year == defect_last_year:
                last_defect_id = int(defect_last.defect_id.split('-')[-1])
            else:
                last_defect_id = 0
        else:
            last_defect_id = 0
        new_defect_id = now_year + '-' + ('0'*(7-len(str(last_defect_id + 1))) + str(last_defect_id + 1))
        now_time = get_time()
        defect = Defect(
            defect_id=new_defect_id,
            defect_registrator_id=defect_registrator.user_id,
            defect_description=defect_description,
            defect_division_id=defect_division.division_id,
            defect_created_at=now_time,
            defect_location=defect_location,
            defect_type_id=defect_type.type_defect_id,
            defect_status_id=defect_status.status_defect_id,
            defect_system_id=defect_system.system_id,
            defect_safety=defect_safety,
            defect_pnr=defect_pnr,
            defect_exploitation=defect_exploitation,
            )
        session.add(defect)
        await session.commit()
        return defect

    @staticmethod
    async def get_defect_by_id(session: AsyncSession, defect_id: int): # получение всех систем в БД
        query = select(Defect).where(Defect.defect_id == defect_id)\
                .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system)).options(selectinload(Defect.defect_checker))
        result = await session.scalars(query)
        defect = result.one()
        return defect
    
    @staticmethod
    async def update_defect_by_id(session: AsyncSession,
                                  defect_id: int, # OK
                                  defect_registrator_id: int=None,
                                  defect_owner_id: int=None,
                                  defect_repair_manager_id: int=None, # OK
                                  defect_worker_id: int=None, # OK
                                  defect_checker_id: int=None, # OK
                                  defect_check_result: str=None, # OK
                                  defect_planned_finish_date: datetime.datetime=None, # OK
                                  defect_description: str=None, # OK
                                  defect_work_comment: str=None,
                                  defect_location: str=None, # OK
                                  defect_type_id: int=None, # OK
                                  defect_status_id: int=None, # OK
                                  defect_division_id: int=None, # OK
                                  defect_system_id: int=None, # OK
                                  defect_ppr: bool=None, # OK
                                  confirm_defect: bool=False, # OK
                                  ): # обновление дефект в БД (там где нет ОК, значит обновление тех полей еще не реализовано)
        defect:Defect = await Defect.get_defect_by_id(session, defect_id)
        if defect_system_id:
            system: System = await System.get_system_by_id(session, defect_system_id)
            defect.defect_system_id = system.system_id
        if defect_status_id:
            status: StatusDefect = await StatusDefect.get_status_defect_by_id(session, defect_status_id)
            defect.defect_status_id = status.status_defect_id
        if defect_planned_finish_date:
            defect.defect_planned_finish_date = defect_planned_finish_date
        if defect_repair_manager_id:
            defect.defect_repair_manager_id = defect_repair_manager_id
        if defect_division_id:
            defect.defect_division_id = defect_division_id
        if defect_worker_id:
            defect.defect_worker_id = defect_worker_id
        if defect_ppr:
            defect.defect_ppr = defect_ppr
        if defect_location:
            defect.defect_location = defect_location
        if defect_type_id:
            defect.defect_type_id = defect_type_id 
        if defect_description:
            defect.defect_description = defect_description
        if defect_work_comment:
            defect.defect_work_comment = defect_work_comment
        if defect_checker_id:
            defect.defect_checker_id = defect_checker_id
        if defect_check_result:
            defect.defect_check_result = defect_check_result

        if confirm_defect:
            defect.defect_planned_finish_date = defect_planned_finish_date
            defect.defect_ppr = defect_ppr
        session.add(defect)
        await session.commit() 
        return defect

    @staticmethod
    async def del_defect_by_defect(session: AsyncSession, defect):
        session.delete(defect)
        await session.commit() 


    """ @staticmethod
    async def get_defects_by_filter(session: AsyncSession, division: Division = None, date_start: str = None,
                                     date_end: str = None, status_defect: StatusDefect = None,):
        query = select(Defect).filter(or_(Defect.defect_division_id.like(division.division_id,),
                                        Defect.defect_status_id.like(status_defect.status_defect_id),
                                        Defect.defect_created_at).between(date_start, date_end)
                                        ).order_by(Defect.defect_id)\
                .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system)) # запрос к БД
        result = await session.scalars(query)
        defects = result.all()
        return defects """
    
    @staticmethod
    async def get_defects_by_filter(session: AsyncSession, division_id = None, date_start: str = None, 
                                date_end: str = None, status_id = None, ppr = None, type_defect_id = None):
        conditions = []

        if division_id is not None and division_id !=0:
            conditions.append(Defect.defect_division_id == division_id)
        if type_defect_id is not None and type_defect_id !=0:
            conditions.append(Defect.defect_type_id == type_defect_id)
        if status_id is not None and status_id !=0:
            conditions.append(Defect.defect_status_id == status_id)
        if ppr is not None:
            conditions.append(Defect.defect_ppr == ppr)
        if date_start:
            start_date = datetime.datetime.strptime(date_start, "%Y-%m-%d")
            conditions.append(Defect.defect_created_at >= start_date)
        if date_end:
            end_date = (datetime.datetime.strptime(date_end, "%Y-%m-%d") + datetime.timedelta(days=1))
            conditions.append(Defect.defect_created_at <= end_date)

        query = select(Defect)
        if conditions:
            query = query.filter(*conditions)

        query = query.order_by(Defect.defect_id.desc())\
                     .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                     .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                     .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                     .options(selectinload(Defect.defect_system))
        result = await session.scalars(query)
        defects = result.all()
        return defects

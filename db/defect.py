import datetime
from sqlalchemy import ForeignKey, Integer, Text, String, func, select, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.orm import Mapped, mapped_column, relationship, selectinload
from sqlalchemy.sql import func
from sqlalchemy.types import TypeDecorator, DateTime

from db.base import Base
from db.user import User
from db.type_defect import TypeDefect
from db.system import System
from db.status_defect import StatusDefect
from db.division import Division

from sqlalchemy.ext.asyncio import AsyncSession

class Defect(Base):
    __tablename__ = "defect" # процесс учета средств оснащения
    defect_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    defect_created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )# таймштамп создания записи дефекта FIX ME
    #defect_created_at: Mapped[datetime.datetime] = mapped_column(DateTime('Europe/Moscow'), server_default=func.now(), onupdate=func.now())# таймштамп вноса предмета
    defect_registrator_id: Mapped[int] = mapped_column(ForeignKey("user.user_id")) # id поста из таблицы User - регистратор дефекта.
    defect_registrar: Mapped["User"] = relationship(foreign_keys=[defect_registrator_id]) #  для работы с таблицей User как с объектом
    defect_owner_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - владелец оборудования.
    defect_owner: Mapped["User"] = relationship(foreign_keys=[defect_owner_id]) #  для работы с таблицей User как с объектом
    defect_repair_manager_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_repair_manager: Mapped["User"] = relationship(foreign_keys=[defect_repair_manager_id]) #  для работы с таблицей User как с объектом
    defect_worker_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_worker: Mapped["User"] = relationship(foreign_keys=[defect_worker_id]) #  для работы с таблицей User как с объектом
    defect_planned_finish_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=True)  # планируемая дата завершения ремонта
    defect_description: Mapped[str] = mapped_column(String(500)) # Описание дефекта.
    defect_location: Mapped[str] = mapped_column(String(500)) # Местоположение дефекта.
    defect_type_id: Mapped[int] = mapped_column(ForeignKey("type_defect.type_defect_id")) # вид дефекта
    defect_type: Mapped["TypeDefect"] = relationship(foreign_keys=[defect_type_id]) #  для работы с таблицей TypeDefect как с объектом
    defect_status_id: Mapped[int] = mapped_column(ForeignKey("status_defect.status_defect_id")) # статус (Этап) дефекта
    defect_status: Mapped["StatusDefect"] = relationship(foreign_keys=[defect_status_id]) #  для работы с таблицей StatusDefect как с объектом
    defect_division_id: Mapped[int] = mapped_column(ForeignKey("division.division_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_division: Mapped["Division"] = relationship(foreign_keys=[defect_division_id]) #  для работы с таблицей User как с объектом
    defect_system_id: Mapped[int] = mapped_column(ForeignKey("system.system_id")) # вид дефекта
    defect_system: Mapped["System"] = relationship(foreign_keys=[defect_system_id]) #  для работы с таблицей System как с объектом
    #defect_status_id: Mapped[int] = mapped_column(ForeignKey("status_defect.id")) # статус (Этап) дефекта
    #defect_status: Mapped["StatusDefect"] = relationship(foreign_keys=[defect_status_id]) #  для работы с таблицей StatusDefect как с объектом
    

    @staticmethod
    async def get_all_defect(session: AsyncSession): # получение всех систем в БД
        query = select(Defect).order_by(Defect.defect_id)\
                .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system))
        result = await session.scalars(query)
        defects = result.all()
        return defects
    
    @staticmethod
    async def add_defect(session: AsyncSession, defect_registrator: User, defect_description: str, defect_system: System,
                          defect_location: str, defect_type: TypeDefect, defect_status: StatusDefect, defect_division: Division): # добавление системы в БД
        defect = Defect(defect_registrator_id=defect_registrator.user_id, defect_description=defect_description, defect_division_id=defect_division.division_id,
                        defect_location=defect_location, defect_type_id=defect_type.type_defect_id, defect_status_id=defect_status.status_defect_id, defect_system_id=defect_system.system_id)
        session.add(defect)
        await session.commit()
        return defect

    @staticmethod
    async def get_defect_by_id(session: AsyncSession, defect_id: int): # получение всех систем в БД
        query = select(Defect).where(Defect.defect_id == defect_id)\
                .options(selectinload(Defect.defect_registrar)).options(selectinload(Defect.defect_owner))\
                .options(selectinload(Defect.defect_repair_manager)).options(selectinload(Defect.defect_worker))\
                .options(selectinload(Defect.defect_type)).options(selectinload(Defect.defect_status)).options(selectinload(Defect.defect_division))\
                .options(selectinload(Defect.defect_system))
        result = await session.scalars(query)
        defect = result.one()
        return defect
    
    @staticmethod
    async def update_defect_by_id(session: AsyncSession,
                                  defect_id: int,
                                  defect_registrator_id: int=None,
                                  defect_owner_id: int=None,
                                  defect_repair_manager_id: int=None,
                                  defect_worker_id: int=None,
                                  defect_planned_finish_date: datetime.datetime=None, # OK
                                  defect_description: str=None,
                                  defect_location: str=None,
                                  defect_type_id: int=None,
                                  defect_status_id: int=None, # OK
                                  defect_division_id: int=None,
                                  defect_system_id: int=None,
                                  ): # обновление дефект в БД (там где нет ОК, значит обновление тех полей еще не реализовано)
        defect:Defect = await Defect.get_defect_by_id(session, defect_id)
        if defect_status_id:
            status: StatusDefect = await StatusDefect.get_status_defect_by_id(session, defect_status_id)
            defect.defect_status_id = status.status_defect_id
        if defect_planned_finish_date:
            defect.defect_planned_finish_date = defect_planned_finish_date
        if defect_repair_manager_id:
            defect.defect_repair_manager_id = defect_repair_manager_id
        if defect_repair_manager_id:
            defect.defect_division_id = defect_division_id
        if defect_worker_id:
            defect.defect_worker_id = defect_worker_id
        session.add(defect)
        await session.commit() 
        return defect

    @staticmethod
    async def del_defect_by_defect(session: AsyncSession, defect):
        session.delete(defect)
        await session.commit() 
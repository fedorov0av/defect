import datetime
from sqlalchemy import ForeignKey, Integer, Text, String, DateTime, func, select, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    defect_created_at: Mapped[datetime.datetime] = mapped_column(DateTime('Europe/Moscow'), default=datetime.datetime.strptime(datetime.datetime.now().isoformat(sep=" ", timespec="seconds"), "%Y-%m-%d %H:%M:%S"))# таймштамп вноса предмета
    defect_registrator_id: Mapped[int] = mapped_column(ForeignKey("user.user_id")) # id поста из таблицы User - регистратор дефекта.
    defect_registrar: Mapped["User"] = relationship(foreign_keys=[defect_registrator_id]) #  для работы с таблицей User как с объектом
    defect_owner_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - владелец оборудования.
    defect_owner: Mapped["User"] = relationship(foreign_keys=[defect_owner_id]) #  для работы с таблицей User как с объектом
    defect_repair_manager_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_repair_manager: Mapped["User"] = relationship(foreign_keys=[defect_repair_manager_id]) #  для работы с таблицей User как с объектом
    defect_worker_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    defect_worker: Mapped["User"] = relationship(foreign_keys=[defect_worker_id]) #  для работы с таблицей User как с объектом
    defect_planned_finish_date: Mapped[datetime.datetime] = mapped_column(DateTime)  # планируемая дата завершения ремонта
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
        query = select(Defect).order_by(Defect.defect_id)
        result = await session.scalars(query)
        divisions = result.all()
        return divisions
    
    @staticmethod
    async def add_defect(session: AsyncSession, defect_registrator: User, defect_description: str, defect_system: System,
                          defect_location: str, defect_type: TypeDefect, defect_status: StatusDefect, defect_division: Division): # добавление системы в БД
        defect = Defect(defect_registrator_id=defect_registrator.user_id, defect_description=defect_description, defect_division_id=defect_division.division_id,
                        defect_location=defect_location, defect_type_id=defect_type.type_defect_id, defect_status_id=defect_status.status_defect_id, defect_system_id=defect_system.system_id)
        session.add(defect)
        await session.commit()
        return defect

########################### fix me ###############
    """ @staticmethod
    def add_defect(
                    repair_created_at: datetime,
                    user_id: str,
                    observer_in_qrcode: str,
                    count_object_in: int = 1,
                    system_kks: str = None,
                    operation_report: str = None,
                        ) -> None: # добавление информации об операции с СО на входе
        repair = Repair.get_repair_by_created_at(created_at=repair_created_at)
        system = System.get_system_by_kks(system_kks=system_kks) if system_kks else None
        object = Object.get_object_by_qrcode(qr_code=object_qrcode)
        user_in = User.get_user_by_qrcode(user_in_qrcode)
        observer_in = User.get_user_by_qrcode(observer_in_qrcode)

        operation = Operation(
                    operation_repair_id=repair.id,
                    operation_repair=repair,
                    operation_workpermit=workpermit,
                    operation_system_id=system.id if system else None,
                    operation_system=system if system else None,
                    operation_object_id=object.id,
                    operation_object=object,
                    operation_user_in_id=user_in.id,
                    operation_user_in=user_in,
                    operation_observer_in_id=observer_in.id,
                    operation_observer_in=observer_in,
                    operation_report=operation_report if operation_report else None
                            )
        now_datetime =  datetime.datetime.strptime(datetime.datetime.now().isoformat(sep=" ", timespec="seconds"), "%Y-%m-%d %H:%M:%S")
        operation.operation_entry_at = now_datetime
        if count_object_in != 1:
            operation.operation_count_object_in=count_object_in
        object.set_object_now_use(object=object, now_use=True) # объект теперь используется
        session.add(operation)
        session.add(object)
        session.commit()

    @staticmethod
    def get_operations_by_repair(repair: Repair): # получение всех операций по операциям с СО в БД
        query = select(Operation).where(Operation.operation_repair_id == repair.id).order_by(Operation.id)
        operations = session.scalars(query).all()
        return operations

    
    @staticmethod
    def del_operation_by_operation(operation):
        session.delete(operation)
        session.commit() """
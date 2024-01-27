import datetime
from sqlalchemy import String, select
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import MultipleResultsFound

from db.base import Base
from db.utils import get_time

class System(Base):
    __tablename__ = "system" # система
    system_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    system_name: Mapped[str] = mapped_column(String(150)) # название системы или оборудования
    system_kks: Mapped[str] = mapped_column(String(100), unique=True, nullable=True) # kks кодировка системы или оборудования
    system_created_at: Mapped[datetime.datetime]

    @staticmethod
    async def get_system_by_id(session: AsyncSession, system_id:int): # получение системы по ключу system_kks
        query = select(System).where(System.system_id == system_id)
        result = await session.scalars(query)
        status_defect = result.one()
        return status_defect

    @staticmethod
    async def get_system_by_name(session: AsyncSession, system_name:str): # получение системы по ключу system_kks
        query = select(System).where(System.system_name == system_name)
        result = await session.scalars(query)
        try:
            system = result.one()
        except MultipleResultsFound:
            result = await session.scalars(query)
            systems = result.all()
            system = systems[-1]
        return system

    @staticmethod
    async def get_system_by_kks(session: AsyncSession, system_kks:str): # получение системы по ключу system_kks
        system_kks_up = system_kks.upper()
        query = select(System).where(System.system_kks == system_kks_up)
        result = await session.scalars(query)
        system = result.one()
        return system


    @staticmethod
    async def add_system(session: AsyncSession, system_name: str, system_kks: str = None,): # добавление системы в БД
        now_time = get_time()
        if system_kks:
            system_kks_up = system_kks.upper()
        else:
            system_kks_up = system_kks
        system = System(system_name=system_name, system_kks=system_kks_up, system_created_at=now_time)
        session.add(system)
        await session.commit()

    @staticmethod
    async def get_all_system(session: AsyncSession): # получение всех систем в БД
        query = select(System).order_by(System.system_id)
        result = await session.scalars(query)
        systems = result.all()
        return systems
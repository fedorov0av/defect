import datetime
from sqlalchemy import func, DateTime, String, Boolean, select, or_
from sqlalchemy.orm import Mapped, mapped_column, validates
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class System(Base):
    __tablename__ = "system" # система
    system_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    system_name: Mapped[str] = mapped_column(String(150)) # название системы или оборудования
    system_kks: Mapped[str] = mapped_column(String(100), unique=True, nullable=True) # kks кодировка системы или оборудования
    system_created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())  # таймштамп создания записи


    @staticmethod
    async def get_system_by_name(session: AsyncSession, system_name:str): # получение системы по ключу system_kks
        query = select(System).where(System.system_name == system_name)
        result = await session.scalars(query)
        system = result.one()
        return system

    @staticmethod
    async def add_system(session: AsyncSession, system_name: str, system_kks: str,): # добавление системы в БД
        system = System(system_name=system_name, system_kks=system_kks)
        session.add(system)
        await session.commit()
        return system

    @staticmethod
    async def get_all_system(session: AsyncSession): # получение всех систем в БД
        query = select(System).order_by(System.system_id)
        result = await session.scalars(query)
        systems = result.all()
        return systems
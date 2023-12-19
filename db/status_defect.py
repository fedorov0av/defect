import datetime
from sqlalchemy import func, DateTime, String, Boolean, select, or_
from sqlalchemy.orm import Mapped, mapped_column, validates
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class StatusDefect(Base):
    __tablename__ = "status_defect" # система
    status_defect_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    status_defect_name: Mapped[str] = mapped_column(String(100), unique=True) # название роли

    
    @staticmethod
    async def get_status_defect_by_name(session: AsyncSession, status_defect_name:str): # получение системы по ключу system_kks
        query = select(StatusDefect).where(StatusDefect.status_defect_name == status_defect_name)
        result = await session.scalars(query)
        status_defect = result.one()
        return status_defect

    @staticmethod
    async def get_status_defect_by_id(session: AsyncSession, status_defect_id:int): # получение системы по ключу system_kks
        query = select(StatusDefect).where(StatusDefect.status_defect_id == status_defect_id)
        result = await session.scalars(query)
        status_defect = result.one()
        return status_defect

    @staticmethod
    async def add_status_defect(session: AsyncSession, status_defect_name: str): # добавление системы в БД
        status_defect = StatusDefect(status_defect_name=status_defect_name)
        session.add(status_defect)
        await session.commit()
        return status_defect

    @staticmethod
    async def get_all_status_defect(session: AsyncSession): # получение всех систем в БД
        query = select(StatusDefect).order_by(StatusDefect.status_defect_id)
        result = await session.scalars(query)
        statuses_defect = result.all()
        return statuses_defect
    

    
    
import datetime
from sqlalchemy import func, DateTime, String, Boolean, select, or_
from sqlalchemy.orm import Mapped, mapped_column, validates
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class TypeDefect(Base):
    __tablename__ = "type_defect" # система
    type_defect_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    type_defect_name: Mapped[str] = mapped_column(String(100), unique=True) # название роли
    
########################### fix me ###############
    
    @staticmethod
    async def get_defect_by_name(session: AsyncSession, type_defect_name:str): # получение системы по ключу system_kks
        query = select(TypeDefect).where(TypeDefect.type_defect_name == type_defect_name)
        type_defect = session.scalars(query).one()
        return type_defect

    @staticmethod
    async def add_defect(session: AsyncSession, type_defect_name: str): # добавление системы в БД
        type_defect = TypeDefect(type_defect_name=type_defect_name)
        session.add(type_defect)
        session.commit()
        return type_defect

    @staticmethod
    async def get_all_systems(session: AsyncSession): # получение всех систем в БД
        query = select(TypeDefect).order_by(TypeDefect.type_defect_id)
        types_defect = session.scalars(query).all()
        return types_defect
    
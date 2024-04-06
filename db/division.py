from sqlalchemy import String, select, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class Division(Base):
    __tablename__ = "division" # система
    division_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    division_name: Mapped[str] = mapped_column(String(100), unique=True) # название подразделения

    @staticmethod
    async def get_division_by_name(session: AsyncSession, division_name:str): # получение системы по названию
        query = select(Division).where(Division.division_name == division_name)
        result = await session.scalars(query)
        division = result.one()
        return division

    @staticmethod
    async def get_division_by_id(session: AsyncSession, division_id: int): # получение пользователя по RFID коду
        query = select(Division).where(Division.division_id == division_id)
        result = await session.scalars(query)
        division = result.one()
        return division
    
    @staticmethod
    async def add_division(session: AsyncSession, division_name: str): # добавление системы в БД
        division = Division(division_name=division_name)
        session.add(division)
        await session.commit()
        return division

    @staticmethod
    async def get_all_division(session: AsyncSession): # получение всех систем в БД
        query = select(Division).order_by(Division.division_id)
        result = await session.scalars(query)
        divisions = result.all()
        return divisions

    @staticmethod
    async def get_division_by_departament_name(session: AsyncSession, departament_name:str): # получение системы по названию из AD
        pass
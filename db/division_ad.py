from sqlalchemy import String, select, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base
from db.division import Division

class DivisionAD(Base):
    __tablename__ = "division_ad" # система
    divisionAD_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    divisionAD_name: Mapped[str] = mapped_column(String(200), unique=True) # название подразделения
    divisionAD_division_id: Mapped[int] = mapped_column(ForeignKey("division.division_id")) # id поста из таблицы User - руководитель ремонта.
    divisionAD_division: Mapped["Division"] = relationship(foreign_keys=[divisionAD_division_id]) #  для работы с таблицей User как с объектом

    @staticmethod
    async def get_divisionAD_by_name(session: AsyncSession, division_name:str): # получение подразделений в AD по названию
        query = select(DivisionAD).where(DivisionAD.divisionAD_name == division_name)
        result = await session.scalars(query)
        division = result.one()
        return division

    @staticmethod
    async def get_divisionAD_by_id(session: AsyncSession, division_id: int): # получение подразделений в AD
        query = select(DivisionAD).where(DivisionAD.divisionAD_id == division_id)
        result = await session.scalars(query)
        user = result.one()
        return user
    
    @staticmethod
    async def add_divisionAD(session: AsyncSession, division_name: str): # добавление подразделений в AD
        division = DivisionAD(division_name=division_name)
        session.add(division)
        await session.commit()
        return division

    @staticmethod
    async def get_all_divisionAD(session: AsyncSession): # получение всех подраздления в БД
        query = select(DivisionAD).order_by(DivisionAD.divisionAD_id)
        result = await session.scalars(query)
        divisions = result.all()
        return divisions

    @staticmethod
    async def get_division_by_divisionAD_name(session: AsyncSession, departament_name:str): # получение подраздления по названию из AD
        pass
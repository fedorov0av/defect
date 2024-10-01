from sqlalchemy import String, select
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class ConditionEquipment(Base):
    __tablename__ = "condition_equipment" # состояние оборудования
    condition_equipment_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    condition_equipment_name: Mapped[str] = mapped_column(String(100), unique=True) # название роли

    @staticmethod
    async def get_condition_equipment_by_name(session: AsyncSession, condition_equipment_name:str): # получение состояния оборудования по имени
        query = select(ConditionEquipment).where(ConditionEquipment.condition_equipment_name == condition_equipment_name)
        result = await session.scalars(query)
        condition_equipment = result.one()
        return condition_equipment

    @staticmethod
    async def get_condition_equipment_by_id(session: AsyncSession, condition_equipment_id:int): # получение состояния оборудования по ключу 
        query = select(ConditionEquipment).where(ConditionEquipment.condition_equipment_id == condition_equipment_id)
        result = await session.scalars(query)
        condition_equipment = result.one()
        return condition_equipment

    @staticmethod
    async def add_condition_equipment(session: AsyncSession, condition_equipment_name: str): # добавление состояния оборудования в БД
        condition_equipment = ConditionEquipment(condition_equipment_name=condition_equipment_name)
        session.add(condition_equipment)
        await session.commit()
        return condition_equipment

    @staticmethod
    async def get_all_condition_equipment(session: AsyncSession): # получение всех состояний оборудования в БД
        query = select(ConditionEquipment).order_by(ConditionEquipment.condition_equipment_id)
        result = await session.scalars(query)
        conditions_equipment = result.all()
        return conditions_equipment
    

    
    
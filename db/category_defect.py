from sqlalchemy import String, select
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class CategoryDefect(Base): # категория дефекта
    __tablename__ = "category_defect" # категория дефекта
    category_defect_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    category_defect_name: Mapped[str] = mapped_column(String(50), unique=True) # название категории дефекта


    @staticmethod
    async def get_category_defect_by_id(session: AsyncSession, category_defect_id:int): # получение категории дефекта по code
        query = select(CategoryDefect).where(CategoryDefect.category_defect_id == category_defect_id)
        result = await session.scalars(query)
        category_defect = result.one()
        return category_defect

    @staticmethod
    async def get_category_defect_by_name(session: AsyncSession, category_reason_name:str): # получение категории дефекта по name
        query = select(CategoryDefect).where(CategoryDefect.category_defect_name == category_reason_name)
        result = await session.scalars(query)
        category_defect = result.one()
        return category_defect

    @staticmethod
    async def add_category_defect(session: AsyncSession, category_reason_code: str, category_reason_name: str): # добавление категории дефекта в БД
        category_defect = CategoryDefect(category_reason_code=category_reason_code, category_reason_name=category_reason_name)
        session.add(category_defect)
        await session.commit()
        return category_defect

    @staticmethod
    async def get_all_categories_defect(session: AsyncSession): # получение всех категории дефекта из БД
        query = select(CategoryDefect).order_by(CategoryDefect.category_defect_id)
        result = await session.scalars(query)
        categories_defect = result.all()
        return categories_defect
    

    
    
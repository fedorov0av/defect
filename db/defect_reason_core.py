from sqlalchemy import String, select
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class CategoryCoreReason(Base): # категории коренной причины
    __tablename__ = "category_core_reason" # категории коренной причины
    category_reason_code: Mapped[str] = mapped_column(String(3), primary_key=True) # первичный ключ
    category_reason_name: Mapped[str] = mapped_column(String(200), unique=True) # название категории


    @staticmethod
    async def get_category_core_reason_by_code(session: AsyncSession, category_reason_code:str): # получение категории причин по code
        query = select(CategoryCoreReason).where(CategoryCoreReason.category_reason_code == category_reason_code)
        result = await session.scalars(query)
        category_reason = result.one()
        return category_reason

    @staticmethod
    async def get_category_core_reason_by_name(session: AsyncSession, category_reason_name:str): # получение категории причин по name
        query = select(CategoryCoreReason).where(CategoryCoreReason.category_reason_name == category_reason_name)
        result = await session.scalars(query)
        category_reason = result.one()
        return category_reason

    @staticmethod
    async def add_category_core_reason(session: AsyncSession, category_reason_code: str, category_reason_name: str): # добавление категории причин в БД
        category_reason = CategoryCoreReason(category_reason_code=category_reason_code, category_reason_name=category_reason_name)
        session.add(category_reason)
        await session.commit()
        return category_reason

    @staticmethod
    async def get_all_categories_core_reason(session: AsyncSession): # получение всех категории причин в БД
        query = select(CategoryCoreReason).order_by(CategoryCoreReason.category_reason_code)
        result = await session.scalars(query)
        categories_reason = result.all()
        return categories_reason
    

    
    
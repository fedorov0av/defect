from sqlalchemy import String, select
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base

class CategoryReason(Base): # категории причин
    __tablename__ = "category_reason" # система
    category_reason_code: Mapped[str] = mapped_column(String(3), primary_key=True) # первичный ключ
    category_reason_name: Mapped[str] = mapped_column(String(200), unique=True) # название категории

    
    @staticmethod
    async def get_category_reason_by_name(session: AsyncSession, category_reason_name:str): # получение категории причин по name
        query = select(CategoryReason).where(CategoryReason.category_reason_name == category_reason_name)
        result = await session.scalars(query)
        category_reason = result.one()
        return category_reason

    @staticmethod
    async def get_category_reason_by_code(session: AsyncSession, category_reason_code:str): # получение категории причин по code
        query = select(CategoryReason).where(CategoryReason.category_reason_code == category_reason_code)
        result = await session.scalars(query)
        category_reason = result.one()
        return category_reason

    @staticmethod
    async def add_category_reason(session: AsyncSession, category_reason_code: str, category_reason_name: str): # добавление категории причин в БД
        category_reason = CategoryReason(category_reason_code=category_reason_code, category_reason_name=category_reason_name)
        session.add(category_reason)
        await session.commit()
        return category_reason

    @staticmethod
    async def get_all_categories_reason(session: AsyncSession): # получение всех категории причин в БД
        query = select(CategoryReason).order_by(CategoryReason.category_reason_code)
        result = await session.scalars(query)
        categories_reason = result.all()
        return categories_reason
    

    
    
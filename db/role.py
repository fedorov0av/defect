from typing import List
from sqlalchemy import String, select
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base


class Role(Base):
    __tablename__ = "role" # роли для пользоветалей: администратор и т.д.
    role_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    role_name: Mapped[str] = mapped_column(String(100), unique=True) # название роли

    @staticmethod
    async def get_all_roles(session: AsyncSession): # получить все роли в системе
        query = select(Role).order_by(Role.role_id)
        result = await session.execute(query)
        roles = result.scalars().all()
        return roles
    
    @staticmethod
    async def get_role_by_rolename(session: AsyncSession, role_name:str): # получить роль по названию роли
        query = select(Role).where(Role.role_name == role_name)
        role = await session.scalars(query)
        return role.one()
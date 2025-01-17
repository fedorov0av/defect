import datetime
from typing import List
from sqlalchemy import String, Boolean, select, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, selectinload
from utils import security
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import false

from db.base import Base
from db.role import Role
from db.division import Division
from db.assoc_table import user_role
from db.utils import get_time

class User(Base):
    __tablename__ = "user" # пользователь
    #user_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    user_id: Mapped[str] = mapped_column(String(100), primary_key=True) # первичный ключ

    user_name: Mapped[str] = mapped_column(String(100)) # имя пользователя
    user_fathername: Mapped[str] = mapped_column(String(100), nullable=True) # отчество пользователя
    user_surname: Mapped[str] = mapped_column(String(100)) # фамилия пользователя
    user_position: Mapped[str] = mapped_column(String(100)) # должность пользователя
    user_division_id: Mapped[int] = mapped_column(ForeignKey("division.division_id"), nullable=True) # id поста из таблицы User - руководитель ремонта.
    user_division: Mapped["Division"] = relationship(foreign_keys=[user_division_id], lazy='selectin') #  для работы с таблицей User как с объектом
    user_role: Mapped[List[Role]] = relationship(secondary=user_role) # роль пользователя в системе
    user_password_hash: Mapped[str] = mapped_column(String(100)) # хешированный пароль пользователя в системе
    user_salt_for_password: Mapped[str] = mapped_column(String(60)) # соль для хеширования пароля пользователя в системе
    user_temp_password: Mapped[bool] = mapped_column(Boolean, server_default=false(), default=True) # в данный момент используется временный пароль?
    user_email: Mapped[str] = mapped_column(String(50), unique=True) # логин пользователя в системе (уникальное значение)
    user_created_at: Mapped[datetime.datetime]
    ########################### fix me
    """ def __str__(self) -> str:
        return f"User(id={self.id!r}, name={self.user_name!r}, user_fathername={self.user_fathername}, user_surname={self.user_surname!r},)"

    def __repr__(self) -> str:
        return self.__str__() """
    
    @staticmethod
    async def add_user(session: AsyncSession, user_name: str, user_fathername: str, user_surname: str, user_position: str,
                 user_division: Division, user_password: str, user_email:str, user_role: Role=None) -> None: # добавление пользователя в БД
        now_time = get_time()  
        hash_salt: tuple[str, str] = security.get_hash_salt(user_password)
        user_password_hash, user_salt_for_password = hash_salt
        user_id = user_email.split('@')[0]
        user = User(user_id=user_id,user_name=user_name, user_fathername=user_fathername, user_surname=user_surname, user_position=user_position, user_division_id=user_division.division_id,
                    user_password_hash=user_password_hash, user_salt_for_password=user_salt_for_password, user_email=user_email, user_created_at=now_time)
        if user_role:
            user.user_role.append(user_role)
        session.add(user)
        await session.commit()
        return user

    @staticmethod
    async def update_user(session: AsyncSession, user_id: str, user_name: str, user_fathername: str, user_surname: str, user_position: str,
                 user_division: Division, user_email:str, user_role: Role=None) -> None: # изменение пользователя в БД
        user = await User.get_user_by_id(session=session, user_id=user_id)
        user.user_name = user_name
        user.user_fathername = user_fathername
        user.user_surname = user_surname
        user.user_position = user_position
        user.user_division_id = user_division.division_id
        user.user_email = user_email
        if user_role:
            user.user_role.clear()
            user.user_role.append(user_role)
        session.add(user)
        await session.commit()
        return user
    

    @staticmethod
    async def get_all_users(session: AsyncSession) -> list: # получение всех пользователей из БД
        query = select(User).order_by(User.user_id).options(selectinload(User.user_role)).options(selectinload(User.user_division))
        result = await session.scalars(query)
        #users_not_root = users[1:] 
        users_not_root = result.all()
        return users_not_root
    

    @staticmethod
    async def get_user_by_email(session: AsyncSession, user_email: str): # получение пользователя по RFID коду
        query = select(User).where(User.user_email == user_email).options(selectinload(User.user_role)).options(selectinload(User.user_division))
        result = await session.scalars(query)
        user = result.one()
        return user
    
    @staticmethod
    async def get_user_by_id(session: AsyncSession, user_id: int): # получение пользователя по RFID коду
        query = select(User).where(User.user_id == user_id).options(selectinload(User.user_role)).options(selectinload(User.user_division))
        result = await session.scalars(query)
        user = result.one()
        return user
    
    @staticmethod
    async def get_user_by_role(session: AsyncSession, role: Role): # получение пользователя по ролям
        query = select(User).where(
                User.user_role.any(Role.role_name == role.role_name),
                ).order_by(User.user_id).options(selectinload(User.user_role)).options(selectinload(User.user_division))
        result = await session.scalars(query)
        users = result.all()
        return users

        
        

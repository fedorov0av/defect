import datetime
from typing import List, AsyncGenerator
from sqlalchemy import String, Boolean, func, DateTime, select, or_
from sqlalchemy.engine import row
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from utils import security
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from fastapi import Depends
from db.database import get_db

from db.base import Base
from db.role import Role
from db.assoc_table import user_role

class User(Base):
    __tablename__ = "user" # пользователь
    user_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    user_name: Mapped[str] = mapped_column(String(100)) # имя пользователя
    user_fathername: Mapped[str] = mapped_column(String(100), nullable=True) # отчество пользователя
    user_surname: Mapped[str] = mapped_column(String(100)) # фамилия пользователя
    user_position: Mapped[str] = mapped_column(String(100)) # должность пользователя
    user_division: Mapped[str] = mapped_column(String(100)) # подразделение пользователя
    user_role: Mapped[List[Role]] = relationship(secondary=user_role) # роль пользователя в системе
    user_password_hash: Mapped[str] = mapped_column(String(100)) # хешированный пароль пользователя в системе
    user_salt_for_password: Mapped[str] = mapped_column(String(60)) # соль для хеширования пароля пользователя в системе
    user_temp_password: Mapped[bool] = mapped_column(Boolean, default=True) # в данный момент используется временный пароль?
    user_email: Mapped[str] = mapped_column(String(50)) # хешированный пароль пользователя в системе
    user_created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now()) # таймштамп создания записи
    ########################### fix me
    """ def __str__(self) -> str:
        return f"User(id={self.id!r}, name={self.user_name!r}, user_fathername={self.user_fathername}, user_surname={self.user_surname!r},)"

    def __repr__(self) -> str:
        return self.__str__() """
    
    @staticmethod
    async def add_user(session: AsyncSession, user_name: str, user_fathername: str, user_surname: str, user_position: str,
                 user_division: str, user_password: str, user_role=None) -> None: # добавление пользователя в БД
        hash_salt: tuple[str, str] = security.get_hash_salt(user_password)
        user_password_hash, user_salt_for_password = hash_salt
        user = User(user_name=user_name, user_fathername=user_fathername, user_surname=user_surname, user_position=user_position, user_division=user_division,
                    user_password_hash=user_password_hash, user_salt_for_password=user_salt_for_password)
        if user_role:
            user.user_role.append(user_role)
        session.add(user)
        session.commit()
    

    @staticmethod
    async def get_all_users(session: AsyncSession) -> list: # получение всех пользователей из БД
        query = select(User).order_by(User.user_id)
        users = await session.scalars(query)
        #users_not_root = users[1:]
        users_not_root = users.all()
        return users_not_root
    

    @staticmethod
    async def get_user_by_name(session: AsyncSession, user_name)  -> None: # получение пользователя по RFID коду
        query = select(User).where(User.user_name == user_name)
        user = session.scalars(query).one()
        return user
    
    """ @staticmethod
    def del_user_by_qrcode(qr_code:str)  -> None: # удаление пользователя по QR коду
        user = User.get_user_by_qrcode(qr_code)
        session.delete(user)
        session.commit() """

    """ @staticmethod
    def update_user(user_name: str, user_fathername: str, user_surname: str, user_position: str,
                 user_division: str, user_qr_code: str, user_qr_code_old: str, user_role=None) -> None: # обновление пользователя по QR коду
        user:User = User.get_user_by_qrcode(user_qr_code_old)
        user.user_name = user_name
        user.user_fathername = user_fathername
        user.user_surname = user_surname
        user.user_position = user_position
        user.user_division = user_division
        user.user_qr_code = user_qr_code
        if user_role:
            user.user_role.clear()
            user.user_role.append(user_role)
        session.add(user)
        session.commit() """

    """ @staticmethod
    def save_new_pass_by_qrcode(qr_code:str, new_user_password) -> None: # сохранение нового временного пароля по QR коду
        user = User.get_user_by_qrcode(qr_code)
        hash_salt: tuple[str, str] = security.get_hash_salt(new_user_password)
        new_user_password_hash, new_user_salt_for_password = hash_salt
        user.user_password_hash = new_user_password_hash
        user.user_salt_for_password = new_user_salt_for_password
        session.add(user)
        session.commit() """

    """ @staticmethod
    def search_users_by_str(search_text: str): # поиск пользователей по строке
        search_text_result = '%'+search_text+'%' # добавление символов для поиска
        query = select(User).filter(or_(func.lower(User.user_name).like(search_text_result,),
                                        func.lower(User.user_fathername).like(search_text_result),
                                        func.lower(User.user_surname).like(search_text_result),
                                        func.lower(User.user_position).like(search_text_result),
                                        func.lower(User.user_division).like(search_text_result),
                                        func.lower(User.user_qr_code).like(search_text_result),
                                        )).order_by(User.id) # запрос к БД

        users = session.execute(query).all() # выполнение запроса к БД
        if users == []: # если пользователи не найдены
            return users # возвращаем пустой список пользователей       
        if users[0].User.user_qr_code  == ROOT['qr_code']: # если первый элемент списка пользователей равен root, то удаляем root из списка пользователей
            users = users[1:] # удаление root из списка пользователей
        return users # возвращаем пользователей """

    """ @staticmethod
    def search_users_only_responsible(role_name=None): # поиск пользователей только ответственных за СО
        if not role_name:
            role_name = 'Ответственный за СО'
        query = select(User).where(
                User.user_role.any(Role.role_name == role_name),
                ).order_by(User.id)
        #users = session.execute(query).scalars().all()
        users = session.execute(query).all()
        return users """
    
    """ @staticmethod
    def set_temp_password_by_qrcode(user_qr_code:str, user_temp_password: bool)-> None: # установка временного пароля для пользователя по qr коду
        user:User = User.get_user_by_qrcode(user_qr_code)
        user.user_temp_password = user_temp_password
        session.add(user)
        session.commit() """
    
    """ @staticmethod
    def set_rfid_code_by_qrcode(user_qr_code:str, user_rfid_code: str) -> None: # установка rfid метки для пользователя по qr код
        user:User = User.get_user_by_qrcode(user_qr_code)
        user.user_rfid_code = user_rfid_code
        session.add(user)
        session.commit() """

async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)
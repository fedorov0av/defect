from utils import security
from sqlalchemy import create_engine, inspect
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
import ctypes
import asyncpg

from db.base import Base
from db.user import User
from db.role import Role
from db.defect import Defect
from db.history_defect import History
from db.type_defect import TypeDefect
from db.status_defect import StatusDefect

#from constants import ROLES, ROOT, GROUP_REESTR_SO, ENERGOBLOCKS

ROLES = ['Регистратор', 'Владелец', 'Руководитель', 'Исполнитель', 'Инспектор', 'Администратор']
ROOT = {
    'qr_code': '45871209762859',
    'password': 'toor',
}

DATABASE_USER = 'postgres'
DATABASE_PASSWORD = 'defect0'
DATABASE_NAME = 'defectdb'

DATABASE_URL = f"postgresql+asyncpg://{DATABASE_USER}:{DATABASE_PASSWORD}@0.0.0.0:5432/defectdb"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def create_tables():
    try:
        conn = await asyncpg.connect(user=DATABASE_USER, password=DATABASE_PASSWORD, database=DATABASE_NAME)
    except asyncpg.InvalidCatalogNameError:
        sys_conn = await asyncpg.connect(
            database='postgres',
            user=DATABASE_USER,
            password=DATABASE_PASSWORD
        )
        await sys_conn.execute(
            f'CREATE DATABASE "{DATABASE_NAME}" OWNER "{DATABASE_USER}"'
        )
        await sys_conn.close()
    else:
        conn.close()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    """ ########### добавление списка групп СО в БД #######
    for group in GROUP_REESTR_SO:
        group_so = Group_object(
            group_name=group[0], # название группы СО
            group_code=group[1], # числовой код группы
            group_ind=group[2], # символьный код группы
        )
        session.add(group_so)
    ################################################ """

    ########### добавление списка ролей в БД #######
    async with async_session() as session:
        for role_name in ROLES:
            role = Role(role_name=role_name)
            session.add(role)
            await session.commit()
    ################################################


    ########### добавление ROOT пользователя в БД #######
    async with async_session() as session:
        hash_salt: tuple[str, str] = security.get_hash_salt(ROOT['password'])
        user_password_hash, user_salt_for_password = hash_salt
        result_roles = await Role.get_all_roles(session)
        role_admin = result_roles[-1]
        root_user = User(
            user_name = 'root',
            user_fathername = 'root',
            user_surname = 'root',
            user_position = 'root',
            user_division = 'root',
            user_password_hash = user_password_hash,
            user_salt_for_password = user_salt_for_password,
            user_temp_password = False,
            user_email = 'root@root.root'
        )
        root_user.user_role.append(role_admin)
        session.add(root_user)
        await session.commit()


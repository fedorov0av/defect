from utils import security
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
import asyncpg

from db.user import User
from db.role import Role
from db.type_defect import TypeDefect
from db.division import Division
from db.defect import Defect
from db.history_defect import History
from db.type_defect import TypeDefect
from db.status_defect import StatusDefect
from db.base import Base
from db.utils import get_time

#from constants import ROLES, ROOT, GROUP_REESTR_SO, ENERGOBLOCKS

ROLES = ['Регистратор', 'Владелец', 'Руководитель', 'Исполнитель', 'Инспектор', 'Администратор']
ROOT = {
    'qr_code': '45871209762859',
    'password': 'toor',
}

USERS = {'Регистратор': {'user_name': 'Иван', 'user_fathername': 'Иванович', 'user_surname': 'Иванов', 'password': '123', 'user_email': 'registrator@akkuyu.com', 'division_name': 'СДТУ'},
         'Владелец': {'user_name': 'Петр', 'user_fathername': 'Петрович', 'user_surname': 'Петров', 'password': '123', 'user_email': 'owner@akkuyu.com', 'division_name': 'ЦИКТ'},
         'Руководитель': {'user_name': 'Николай', 'user_fathername': 'Николаевич', 'user_surname': 'Николаев', 'password': '123', 'user_email': 'manager@akkuyu.com', 'division_name': 'ОУР'},
         'Исполнитель': {'user_name': 'Сергей', 'user_fathername': 'Сергеевич', 'user_surname': 'Сергеев', 'password': '123', 'user_email': 'worker@akkuyu.com', 'division_name': 'ОЯР'},
         'Инспектор': {'user_name': 'Андрей', 'user_fathername': 'Андреевич', 'user_surname': 'Андреев', 'password': '123', 'user_email': 'inspector@akkuyu.com', 'division_name': 'ЦТАЙ'},
         'Администратор': {'user_name': 'Олег', 'user_fathername': 'Олегович', 'user_surname': 'Олегов', 'password': '123', 'user_email': 'admin@akkuyu.com', 'division_name': 'ХЗ'},
         }

TYPES_DEFECT = ['ЖД основного оборудования', 'ЖД по строительным конструкциям', 'ЖД по освещению', 'ЖД по системам пожаротушения']

STATUS_DEFECT = ['Зарегистрирован', # 1
                 'Адресован', # 2
                 'Принят в работу', # 3
                 'Назначен исполнитель', # 4
                 'Работы завершены', # 5
                 'Устранен', # 6
                 'Не устранен', # 7
                 'Требует решения', # 8
                 'Отменен',  # 9
                 'Закрыт',  #10
                 ]

DIVISIONS = ['ОС','СДТУ','ЦИКТ', 'ОУР', 'ОЯР', 'ЦТАЙ', 'ХЗ', 'АДМИНИСТРАЦИЯ', 'РусАС']

DATABASE_USER = 'postgres'
DATABASE_PASSWORD = 'defect0'
DATABASE_NAME = 'defectdb'

DATABASE_URL = f"postgresql+asyncpg://{DATABASE_USER}:{DATABASE_PASSWORD}@0.0.0.0:5432/defectdb"

engine = create_async_engine(DATABASE_URL,)
""" engine = create_async_engine(DATABASE_URL, echo=True) """
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
    except Exception as e:
        print(e)
        await conn.close()
    else:
        await conn.close()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    ########### добавление типов дефектов в БД #######
    async with async_session() as session:
        for type_defect in TYPES_DEFECT:
            type_defect = TypeDefect(type_defect_name=type_defect)
            session.add(type_defect)
            await session.commit()
    ################################################
            
    ########### добавление статусов дефектов в БД #######
    async with async_session() as session:
        for status_defect_name in STATUS_DEFECT:
            status_defect = StatusDefect(status_defect_name=status_defect_name)
            session.add(status_defect)
            await session.commit()
    ################################################

    ########### добавление списка ролей в БД #######
    async with async_session() as session:
        for role_name in ROLES:
            role = Role(role_name=role_name)
            session.add(role)
            await session.commit()
    ################################################

    ########### добавление подраздлений в БД #######
    async with async_session() as session:
        for division_name in DIVISIONS:
            division = Division(division_name=division_name)
            session.add(division)
            await session.commit()
    ################################################

    ########### добавление ROOT пользователя в БД #######
    async with async_session() as session:
        hash_salt: tuple[str, str] = security.get_hash_salt(ROOT['password'])
        user_password_hash, user_salt_for_password = hash_salt
        result_roles = await Role.get_all_roles(session)
        result_divisions = await Division.get_all_division(session)
        role_admin = result_roles[-1]
        division_admin = result_divisions[-1]
        now_time = get_time()  

        root_user = User(
            user_name = 'root',
            user_fathername = 'root',
            user_surname = 'root',
            user_position = 'root',
            user_password_hash = user_password_hash,
            user_salt_for_password = user_salt_for_password,
            user_temp_password = False,
            user_division_id = division_admin.division_id,
            user_email = 'root@root.root',
            user_created_at=now_time,
        )
        root_user.user_role.append(role_admin)
        session.add(root_user)

        await session.commit()

    ########### добавление ROOT пользователя в БД #######
    async with async_session() as session:
        for user in USERS:
            now_time = get_time()  
            hash_salt: tuple[str, str] = security.get_hash_salt(USERS[user]['password'])
            user_password_hash, user_salt_for_password = hash_salt
            result_role = await Role.get_role_by_rolename(session, role_name=user)
            result_division = await Division.get_division_by_name(session, division_name=USERS[user]['division_name'])
            role = result_role
            division = result_division

            user = User(
                user_name = USERS[user]['user_name'],
                user_fathername = USERS[user]['user_fathername'],
                user_surname = USERS[user]['user_surname'],
                user_position = user,
                user_password_hash = user_password_hash,
                user_salt_for_password = user_salt_for_password,
                user_temp_password = False,
                user_division_id = division.division_id,
                user_email = USERS[user]['user_email'],
                user_created_at=now_time,
            )
            user.user_role.append(role)
            session.add(user)
            session.add(root_user)
            
        await session.commit()

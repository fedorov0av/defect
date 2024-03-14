from utils import security
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
import asyncpg

from db.user import User
from db.role import Role
from db.type_defect import TypeDefect
from db.division import Division
from db.division_ad import DivisionAD
from db.defect import Defect
from db.history_defect import History
from db.type_defect import TypeDefect
from db.status_defect import StatusDefect
from db.category_defect import CategoryDefect
from db.defect_reason_core import CategoryCoreReason
from db.defect_reason_direct import CategoryDirectReason
from db.base import Base
from db.utils import get_time
from db.constants import DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_IP, DATABASE_PORT, DATABASE_URL

#from constants import ROLES, ROOT, GROUP_REESTR_SO, ENERGOBLOCKS

ROLES = ['Регистратор', 'Владелец', 'Руководитель', 'Исполнитель', 'Инспектор', 'Администратор']
ROOT = {
    'qr_code': '45871209762859',
    'password': 'toor',
}

USERS = {'Регистратор': {'user_name': 'Иван', 'user_fathername': 'Иванович', 'user_surname': 'Иванов', 'password': '123', 'user_email': 'registrator@akkuyu.com', 'division_name': 'ОППР'},
         'Владелец': {'user_name': 'Петр', 'user_fathername': 'Петрович', 'user_surname': 'Петров', 'password': '123', 'user_email': 'owner@akkuyu.com', 'division_name': 'ЦИКТ'},
         'Руководитель': {'user_name': 'Николай', 'user_fathername': 'Николаевич', 'user_surname': 'Николаев', 'password': '123', 'user_email': 'manager@akkuyu.com', 'division_name': 'ОУР'},
         'Исполнитель': {'user_name': 'Сергей', 'user_fathername': 'Сергеевич', 'user_surname': 'Сергеев', 'password': '123', 'user_email': 'worker@akkuyu.com', 'division_name': 'ОЯБ'},
         'Инспектор': {'user_name': 'Андрей', 'user_fathername': 'Андреевич', 'user_surname': 'Андреев', 'password': '123', 'user_email': 'inspector@akkuyu.com', 'division_name': 'ЦТАИ'},
         'Администратор': {'user_name': 'Олег', 'user_fathername': 'Олегович', 'user_surname': 'Олегов', 'password': '123', 'user_email': 'admin@akkuyu.com', 'division_name': 'Руководство'},
         }

CATEGORIES_REASON  = (
    ('00', 'не определена'),
    ('А01', 'недостатки проектирования (включая изменения)'),
    ('А02', 'недостатки изготовления'),
    ('А03', 'недостатки сооружения'),
    ('А04', 'недостатки монтажа'),
    ('А05', 'недостатки наладки'),
    ('А06', 'недостатки ремонта, выполняемого сторонними (по отношению к АС) организациями'),
    ('А07', 'недостатки нормативной, технической и другой документации, выполняемой сторонними (по отношению к АС) организациями'),
    ('А08', 'недостатки конструирования (включая изменения)'),
    ('B01', 'отсутствие эксплуатационной технической документации (включая документацию на ТОиР)'),
    ('B02', 'отсутствие требований или неоднозначное определение требований в эксплуатационной технической документации (включая документацию на ТОиР)'),
    ('B03', 'несвоевременное внесение изменений в эксплуатационную техническую документацию (включая ТОиР)'),
    ('C01', 'по замене оборудования, исчерпавшего ресурс, обеспечению систем рабочими средами, запасными частями, узлами'),
    ('C02', 'по изменению конструкции оборудования, проектных решений и проектной документации, а также принятие мер без согласования с проектной, конструкторской организациями, изготовителем оборудования'),
    ('C03', 'по устранению выявленных недостатков'),
    ('C04', 'по соответствующему анализу технических решений, изменений проектных схем до выполнения работ по их реализации'),
    ('C05', 'непринятие необходимых мер по использованию опыта эксплуатации'),
    ('D01', 'недостатки процедуры допуска к работам (переключения, устранение дефектов, ТОиР)'),
    ('D02', 'недостатки выполнения работ (переключений, устранение дефектов, ТОиР) выполняемых персоналом АС, включая контроль'),
    ('D03', 'проблемы связи (технические)'),
    ('E01', 'неадекватная мотивация'),
    ('E02', 'неадекватные профессионально важные личностные психологические качества (ПВЛК)'),
    ('E03', 'неадекватные психофизиологические качества (скорость и точность реагирования)'),
    ('E04', 'неадекватные характеристики мышления, памяти, внимания'),
    ('E05', 'сниженное функциональное состояние'),
    ('E06', 'недостатки профессиональной подготовленности'),
    ('E07', 'преобладание финансовых, организационных вопросов над безопасностью'),
    ('E09', 'отсутствие консервативного подхода'),
    ('F01', 'эргономические характеристики эксплуатационной документации'),
    ('F02', 'эргономические характеристики условий труда: режим труда и отдыха'),
    ('F03', 'эргономические характеристики условий труда: организация рабочего места'),
    ('F04', 'эргономические недостатки технологии'),
    ('F05', 'скрытые (не выявленные на предшествующих этапах жизненного цикла АС) эргономические ошибки проекта и монтажа'),
    ('F06', 'конфликт или иная социально-психологическая, повлиявшая на функциональное состояние при выполнении неправильного действия в группе (коллективе)'),
    ('F07', 'конфликт или иная социально-психологическая, повлиявшая на функциональное состояние при выполнении неправильного действия в быту'),
    ('F08', 'социальные условия'),
    ('F09', 'социально-политическая ситуация'),
    ('F10', 'организационные факторы: организационная структура'),
    ('F11', 'организационные факторы: организация контроля'),
    ('F12', 'организационные факторы: организация связи'),
    ('G01', 'за выявлением и устранением неработоспособности систем (элементов)'),
    ('G02', 'за выявлением и устранением недостатков процедур'),
    ('G03', 'за выявлением и устранением недостатков в подготовке персонала'),
    ('G04', 'Недостатки входного контроля при обеспечении запасными частями и материалами'),

)        

CATEGORIES_DEFECT = ('Малозначительный дефект', 'Значительный дефект', 'Критический дефект')

TYPES_DEFECT = ('ЖД оборудования', 'ЖД СК и ЗиС', 'ЖД по освещению', 'ЖД по системам пожаротушения')

STATUS_DEFECT = ('Зарегистрирован', # 1
                 'Адресован', # 2
                 'Назначен исполнитель', # 3
                 'Принят в работу', # 4
                 'Работы завершены', # 5
                 'Устранен', # 6
                 'Не устранен', # 7
                 'Требует решения', # 8
                 'Отменен',  # 9
                 'Закрыт',  # 10
                 'Локализован' # 11
                 )

DIVISIONS = (
            ('РЦ-1', ('Reactor shop', 'Reactor shop of the 1st stage', 'Reactor Workshop 1st stage',)),
            ('РЦ-2', ('Reactor shop – 2', 'Reactor shop of the 2nd stage',)),
            ('ТЦ-1', ('Turbine shop of the 1st stage', 'Turbine Shop',)),
            ('ТЦ-2', ('Turbine shop of the 2nd stage',)),
            ('ХЦ', ('Chemical shop',)),
            ('ЦВиК', ('Ventilation and Air Conditioning Shop',)),
            ('СТУ', ('Process Control Service',)),
            ('ЦОРОиОЯТ', ('Workshop for Radioactive Waste and Spent Nuclear Fuel Management',)),
            ('ЦРБ', ('Radiation safety shop',)),
            ('ЦД', ('Decontamination Shop',)),
            ('ЭЦ', ('Electrical Shop',)),
            ('ЦТАИ', ('Thermal Automation and Measurement Shop Head of Shop', 'Thermal instrumentation and control shop')),
            ('ЦИКТ', ('Information and Communication Technology Shop',)),
            ('ОАиОБ', ('Departament of Safety Analysis and Assessment',)),
            ('ОЯБ', ('Nuclear Safety Department',)),
            ('ЦЦР', ('Centralized repair shop',)),
            ('ОППР', ('Repair Preparation and Performance Department',)),
            ('ОУР', ('Repair Management Department',)),
            ('КТО', ('Design and Technology Department',)),
            ('ОРЗиС', ('Buildings And Structures Repair Department', 'Repair Department for Buildings and Structures',)),
            ('ЛТК', ('Technical Inspection Laboratory', 'Technical Diagnostics Laboratory',)),
            ('ОИТП', ('Engineering Support Departmen', 'Engineering Support Department',)),
            ('ОИОЭиРН', ('Operating Experience Use & Violations Investigation Department',)),
            ('ЦТПК', ('Shop for thermal and underground communications', 'Thermal and Underground Communications Shop')),
            ('ЦГТС', ('Hydraulic Engineering Installations Shop',)),
            ('ЦСОБ', ('Safety Assurance Systems Shop',)),
            ('УКТиПБ', ('Technical and Industrial Safety Control Department', 'Technical and Industrial Safety Monitoring Department',)),
            ('ОПК', ('Fire Safety Control Department',)),
            ('УПНР', ('Commissioning Directorate',)),
            ('ОУНиР', ('Reliability and Resource Management Department',)),
            ('Руководство', ('Deputy Director of NPP Under Construction',
                            'Administration',
                            'Technical Unit',
                            'Deputy Technical Director for Radiation Protection and RAW Manag',
                            'Department of thermal automation and measurement',
                            'Technical Affairs for Nuclear Safety Support',
                            'Repair management',
                            'Directorate for Engineering and Technical Support',
                            )),
            ('РусАС', ('Temp Departament',)),
            )

engine = create_async_engine(DATABASE_URL,)
""" engine = create_async_engine(DATABASE_URL, echo=True) """
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def create_tables():
    try:
        conn = await asyncpg.connect(host=DATABASE_IP, user=DATABASE_USER, password=DATABASE_PASSWORD, database=DATABASE_NAME) #
    except asyncpg.InvalidCatalogNameError:
        sys_conn = await asyncpg.connect(
            host=DATABASE_IP,
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
        for division in DIVISIONS:
            division_name = division[0]
            divisions_AD = division[1]
            division = Division(division_name=division_name)
            session.add(division)
            for division_AD in divisions_AD:
                divisionAD =  DivisionAD(divisionAD_name=division_AD, divisionAD_division_id=division.division_id)
                session.add(divisionAD)
        await session.commit()
    ################################################
            
    ########### добавление категорий дефекта в БД #######
    async with async_session() as session:
        for category_defect in CATEGORIES_DEFECT:
            category = CategoryDefect(category_defect_name=category_defect)
            session.add(category)
            await session.commit()
    ################################################

    ########### добавление коренных причин дефекта в БД #######
    async with async_session() as session:
        for category_reason in CATEGORIES_REASON:
            category_r = CategoryCoreReason(category_reason_code=category_reason[0], category_reason_name=category_reason[1])
            session.add(category_r)
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

from utils import security
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
import asyncpg

from db.role import Role
from db.type_defect import TypeDefect
from db.division import Division
from db.division_ad import DivisionAD
from db.defect import Defect
from db.history_defect import History
from db.type_defect import TypeDefect
from db.status_defect import StatusDefect
from db.condition_equipment import ConditionEquipment
from db.category_defect import CategoryDefect
from db.defect_reason_core import CategoryCoreReason
from db.defect_reason_direct import CategoryDirectReason
from db.base import Base
from db.utils import get_time
from db.constants import DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_IP, DATABASE_PORT, DATABASE_URL
from config import AD

if not AD:
    from db.user import User


#from constants import ROLES, ROOT, GROUP_REESTR_SO, ENERGOBLOCKS

ROLES = (('Регистратор', 'CN=RegistrarsDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid'),
        ('Владелец', 'CN=OwnersDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid'),
        ('Руководитель', 'CN=RepairManagersDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid'),
        ('Исполнитель', 'CN=WorkersDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid'),
        ('Инспектор', 'CN=InspectorsDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid'),
        ('Администратор', 'CN=AdminsDJ,OU=Defect_Journal,OU=Security groups,OU=_Global,DC=mbu,DC=invalid'))
ROOT = {
    'qr_code': '45871209762859',
    'password': 'toor',
}

USERS = {'Регистратор': {'user_name': 'Дмитрий', 'user_fathername': 'Игоревич', 'user_surname': 'Болдовский', 'password': '123', 'user_email': 'D.Boldovskii@akkuyu.com', 'division_name': 'ОППР'},
         'Владелец': {'user_name': 'Дмитрий', 'user_fathername': 'Владимирович', 'user_surname': 'Булатов', 'password': '123', 'user_email': 'dbulatov@akkunpp.com', 'division_name': 'ЦИКТ'},
         'Руководитель': {'user_name': 'Александр', 'user_fathername': 'Леонидович', 'user_surname': 'Дербенев', 'password': '123', 'user_email': 'A.Derbenev@akkuyu.com', 'division_name': 'ЦИКТ'},
         'Исполнитель': {'user_name': 'Угур', 'user_fathername': 'Угурович', 'user_surname': 'Кочаг', 'password': '123', 'user_email': 'U.Kocak@akkuyu.com', 'division_name': 'ОЯБ'},
         'Инспектор': {'user_name': 'Василий', 'user_fathername': 'Анатольевич', 'user_surname': 'Токарев', 'password': '123', 'user_email': 'V.Tokarev@akkuyu.com', 'division_name': 'ЦТАИ'},
         'Администратор': {'user_name': 'Игорь', 'user_fathername': 'Иванович', 'user_surname': 'Лебедев', 'password': '123', 'user_email': 'ig.lebedev@akkuyu.com', 'division_name': 'Руководство'},
         }

USERS_BONUS = (
    ({'user_name': 'Вера', 'user_fathername': 'Леонидовна', 'user_surname': 'Егошина', 'password': '123', 'user_email': 'V.Egoshina@akkuyu.com', 'division_name': 'ЦИКТ', 'role_name': ('Администратор',)}),
    ({'user_name': 'Александр', 'user_fathername': 'Владимирович', 'user_surname': 'Федоров', 'password': '123', 'user_email': 'A.Fedorov@akkuyu.com', 'division_name': 'ЦИКТ', 'role_name': ('Администратор',)}),
    ({'user_name': 'Вадим', 'user_fathername': 'Альбертович', 'user_surname': 'Байбеков', 'password': '123', 'user_email': 'V.Baibekov@akkuyu.com', 'division_name': 'ЦИКТ', 'role_name': ('Администратор',)}),
    ({'user_name': 'Лев', 'user_fathername': 'Глебович', 'user_surname': 'Алехин', 'password': '123', 'user_email': 'L.Alehin@akkuyu.com', 'division_name': 'ОУР', 'role_name': ('Администратор',)}),
    ({'user_name': 'Артем', 'user_fathername': 'Валерьевич', 'user_surname': 'Рыков', 'password': '123', 'user_email': 'A.Rykov@akkuyu.com', 'division_name': 'ЦИКТ', 'role_name': ('Администратор',)}),
    ({'user_name': 'Николай', 'user_fathername': 'Игоревич', 'user_surname': 'Кудряшов', 'password': '123', 'user_email': 'N.Kudriashov@akkuyu.com', 'division_name': 'ОУР', 'role_name': ('Администратор',)}),
    ({'user_name': 'Максим', 'user_fathername': 'Геннадьевич', 'user_surname': 'Пластеев', 'password': '123', 'user_email': 'M.Plasteev@akkuyu.com', 'division_name': 'Руководство', 'role_name': ('Инспектор',)}),
    ({'user_name': 'Владислав', 'user_fathername': 'Дмитриевич', 'user_surname': 'Митряев', 'password': '123', 'user_email': 'L.Mitriaev@akkuyu.com', 'division_name': 'Руководство', 'role_name': ('Инспектор',)}),

    ({'user_name': 'Андрей', 'user_fathername': 'Юрьевич', 'user_surname': 'Кимишкин', 'password': '123', 'user_email': 'A.Kimishkin@akkuyu.com', 'division_name': 'ЦСОБ', 'role_name': ('Исполнитель', 'Руководитель',)}),
    ({'user_name': 'Эдуард', 'user_fathername': 'Юльевич', 'user_surname': 'Дмитриев', 'password': '123', 'user_email': 'E.Dmitriev@akkuyu.com', 'division_name': 'ЦЦР', 'role_name': ('Владелец', 'Руководитель',)}),
    ({'user_name': 'Сергей', 'user_fathername': 'Владимирович', 'user_surname': 'Шульгин', 'password': '123', 'user_email': 'S.Shulgin@akkuyu.com', 'division_name': 'ОУР', 'role_name': ('Администратор',)}),

    ({'user_name': 'Алексей', 'user_fathername': 'Александрович', 'user_surname': 'Серобабов', 'password': '123', 'user_email': 'A.Serobabov@akkuyu.com', 'division_name': 'ТЦ-1', 'role_name': ('Владелец', 'Инспектор',)}),
    ({'user_name': 'Алексей', 'user_fathername': 'Николаевич', 'user_surname': 'Есин', 'password': '123', 'user_email': 'A.Esin@akkuyu.com', 'division_name': 'ТЦ-1', 'role_name': ('Владелец', 'Инспектор',)}),
    ({'user_name': 'Михаил', 'user_fathername': 'Алексеевич', 'user_surname': 'Лакеев', 'password': '123', 'user_email': 'M.Lakeev@akkuyu.com', 'division_name': 'ТЦ-1', 'role_name': ('Регистратор',)}),
    ({'user_name': 'Рашид', 'user_fathername': 'Владимирович', 'user_surname': 'Бесшапошников', 'password': '123', 'user_email': 'R.Besshaposhnikov@akkuyu.com', 'division_name': 'ТЦ-1', 'role_name': ('Руководитель',)}),
    ({'user_name': 'Николай', 'user_fathername': 'Николаевич', 'user_surname': 'Воробьев', 'password': '123', 'user_email': 'N.Vorobyev@akkuyu.com', 'division_name': 'ТЦ-1', 'role_name': ('Исполнитель',)}),
    ({'user_name': 'Владимир', 'user_fathername': 'Юрьевич', 'user_surname': 'Шматов', 'password': '123', 'user_email': 'V.Shmatov@akkuyu.com', 'division_name': 'ТЦ-1', 'role_name': ('Руководитель',)}),
    ({'user_name': 'Александр', 'user_fathername': 'Алексеевич', 'user_surname': 'Мартынов', 'password': '123', 'user_email': 'Ale.Martynov@akkuyu.com', 'division_name': 'ТЦ-1', 'role_name': ('Исполнитель',)}),
    ({'user_name': 'Александр', 'user_fathername': 'Николаевич', 'user_surname': 'Приходько', 'password': '123', 'user_email': 'Ale.Prikhodko@akkuyu.com', 'division_name': 'ЦЦР', 'role_name': ('Регистратор', 'Исполнитель',)}),
    ({'user_name': 'Егор', 'user_fathername': 'Александрович', 'user_surname': 'Перфильев', 'password': '123', 'user_email': 'E.Perfilev@akkuyu.com', 'division_name': 'ЦЦР', 'role_name': ('Руководитель',)}),
    ({'user_name': 'Вячеслав', 'user_fathername': 'Вадимович', 'user_surname': 'Гущин', 'password': '123', 'user_email': 'V.Gushchin@akkuyu.com', 'division_name': 'ЦЦР', 'role_name': ('Исполнитель',)}),


)

CATEGORIES_REASON  = (
    ('5.2.0.', 'Не определена'),
    ('5.2.1.', 'Ошибка конструирования (включая изменения)'),
    ('5.2.2.', 'Ошибка проектирования (включая изменения)'),
    ('5.2.3.', 'Дефект изготовления'),
    ('5.2.4.', 'Недостатки сооружения'),
    ('5.2.5.', 'Недостатки монтажа'),
    ('5.2.6.', 'Недостатки наладки'),
    ('5.2.7.', 'Недостатки ремонта, выполняемого сторонними (по отношению к АС) организациями'),
    ('5.2.8.', 'Недостатки проектной, конструкторской и другой документации завода-изготовителя'),
    ('5.2.9.', 'Недостатки управления АС и недостатки организации эксплуатации АС'),
    ('5.2.9.1.', 'Недостатки эксплуатационной документации'),
    ('5.2.9.1.1.', 'Недостатки эксплуатационной документации: отсутствие документации'),
    ('5.2.9.1.2.', 'Недостатки эксплуатационной документации: неправильное или неоднозначное определение требований документации'),
    ('5.2.9.1.3.', 'Недостатки эксплуатационной документации: несвоевременное внесение изменений в документацию'),
    ('5.2.9.2.', 'Неприятие необходимых мер или несвоевременное их принятие'),
    ('5.2.9.2.1.', 'Неприятие необходимых мер или несвоевременное их принятие: по обеспечению систем рабочими средами, материалами, запасными частями, узлами, агрегатами'),
    ('5.2.9.2.2.', 'Неприятие необходимых мер или несвоевременное их принятие: по изменению схемных решений систем, конструкции элементов, проектных решений и проектной документации; а также принятие мер без согласования с проектной, конструкторской организациями, изготовителем оборудования (элементов)'),
    ('5.2.9.2.3.', 'Неприятие необходимых мер или несвоевременное их принятие: по устранению выявленных недостатков'),
    ('5.2.9.2.4.', 'Неприятие необходимых мер или несвоевременное их принятие: по соответствующему анализу технических решений, изменению проектных схем до выполнения работ по их реализации'),
    ('5.2.9.3.', 'Недостаток процедуры допуска к работам по устранению дефектов, техническому обслуживанию и контроля за проведением этих работ'),
    ('5.2.9.4.', 'Недостатки процедур технического обслуживания и ремонта, выполняемых персоналом АС, включая контроль'),
    ('5.2.9.5.', 'Проблемы связи или ошибки пр передаче информации'),
    ('5.2.9.6.', 'Недостатки персонала АС'),
    ('5.2.9.6.1.', 'Психологические источники неправильных действий персонала'),
    ('5.2.9.6.1.1.', 'Психологические источники неправильных действий персонала: неадекватная мотивация'),
    ('5.2.9.6.1.2.', 'Психологические источники неправильных действий персонала: неадекватные профессионально важные личностные психологические качества'),
    ('5.2.9.6.1.3.', 'Психологические источники неправильных действий персонала: неадекватные психофизиологические качества (скорость и точность реагирования)'),
    ('5.2.9.6.1.4.', 'Психологические источники неправильных действий персонала: неадекватные характеристики мышления, памяти, внимания'),
    ('5.2.9.6.1.5.', 'Психологические источники неправильных действий персонала: сниженное функциональное состояние'),
    ('5.2.9.6.1.6.', 'Психологические источники неправильных действий персонала: недостатки профессиональной подготовленности'),
    ('5.2.9.6.2.', 'Внешние условия и средства деятельности'),
    ('5.2.9.6.2.1.', 'Внешние условия и средства деятельности: эргономические характеристики эксплуатационной документации'),
    ('5.2.9.6.2.2.', 'Эргономические характеристики условий труда'),
    ('5.2.9.6.2.2.1.', 'Эргономические характеристики условий труда: режим труда и отдыха'),
    ('5.2.9.6.2.2.2.', 'Эргономические характеристики условий труда: организация рабочего места'),
    ('5.2.9.6.2.2.3.', 'Эргономические характеристики условий труда: эргономические недостатки технологии'),
    ('5.2.9.6.2.3.', 'Скрытые (невыявленные) эргономические ошибки проекта и монтажа на предшествующих этапах жизненного цикла АС'),
    ('5.2.9.6.2.4.', 'Конфликт или иная социально-психологическая ситуация, повлиявшая на функциональное состояние при выполнении неправильного действия'),
    ('5.2.9.6.2.4.1.', 'Конфликт или иная социально-психологическая ситуация, повлиявшая на функциональное состояние при выполнении неправильного действия: в группе (коллективе)'),
    ('5.2.9.6.2.4.2.', 'Конфликт или иная социально-психологическая ситуация, повлиявшая на функциональное состояние при выполнении неправильного действия: в быту'),
    ('5.2.9.6.2.5.', 'Социальные условия'),
    ('5.2.9.6.2.6.', 'Социально-политическая ситуация'),
    ('5.2.9.6.2.7.', 'Организационные факторы'),
    ('5.2.9.6.2.7.1.', 'Организационные факторы: организационная структура'),
    ('5.2.9.6.2.7.2.', 'Организационные факторы: контроль'),
    ('5.2.9.6.2.7.3.', 'Организационные факторы: связь'),
    ('5.2.9.7.', 'Недостатки в станционной программе контроля'),
    ('5.2.9.7.1.', 'Недостатки в станционной программе контроля: за выявлением и устранением неработоспособности систем (элементов)'),
    ('5.2.9.7.2.', 'Недостатки в станционной программе контроля: за выявлением и устранением недостатков процедур'),
    ('5.2.9.7.3.', 'Недостатки в станционной программе контроля: за выявлением и устранением недостатков в подготовке персонала'),
)     

CATEGORIES_REASON_DIRECT  = (
    ('5.1.1.', 'МЕХАНИЧЕСКИЕ ЯВЛЕНИЯ, ПРОЦЕССЫ, СОСТОЯНИЯ'),
    ('5.1.1.0.', 'Прочие механические причины, не вошедшие в данную группу причин'),
    ('5.1.1.1.', 'Коррозия, эрозия'),
    ('5.1.1.2.', 'Износ, неудовлетворительная смазка'),
    ('5.1.1.3.', 'Разрушение, усталость, дефект сварного шва, внутренний дефект материала'),
    ('5.1.1.4.', 'Превышение допустимой нагрузки (перегрузка)'),
    ('5.1.1.5.', 'Вибрация'),
    ('5.1.1.6.', 'Исчерпание ресурса'),
    ('5.1.1.7.', 'Неплотность'),
    ('5.1.1.8.', 'Блокирование, ограничение движения, заклинивание, защемление'),
    ('5.1.1.9.', 'Деформация, перекос, сдвиг, ложное перемещение, разъединение, ослабление связи'),
    ('5.1.1.10.', 'Ослабление крепления к фундаменту, строительным конструкциям, разрушение фундамента, строительных конструкций'),
    ('5.1.1.11.', 'Внешнее механическое воздействие'),
    ('5.1.1.12.', 'Загрязнение, попадание инородных предметов'),

    ('5.1.2.', 'ЭЛЕКТРИЧЕСКИЕ ЯВЛЕНИЯ, ПРОЦЕССЫ, СОСТОЯНИЯ'),
    ('5.1.2.0.', 'Прочие электрические причины, не вошедшие в данную группу причин'),
    ('5.1.2.1.', 'Короткое замыкание, искрение'),
    ('5.1.2.2.', 'Перегрузка по току'),
    ('5.1.2.3.', 'Отклонение по напряжению, частоте'),
    ('5.1.2.4.', 'Плохой контакт, размыкание, обрыв цепи'),
    ('5.1.2.5.', 'Замыкание на "землю"'),
    ('5.1.2.6.', 'Снижение сопротивления, повреждение изоляции'),
    ('5.1.2.8.', 'Внутреннее повреждение'),
    ('5.1.2.9.', 'Непредусмотренная электрическая связь (перемекание)'),
    ('5.1.2.10.', 'Помехи, наводки из-за неустойчивости (колебания) электрических параметров'),
    ('5.1.2.11.', 'Снижение (потеря) емкости'),

    ('5.1.3.', 'ХИМИЧЕСКИЕ ЯВЛЕНИЯ, ПРОЦЕССЫ, ФИЗИКА РЕАКТОРА'),
    ('5.1.3.0.', 'Прочие химические причины, не вошедшие в данную группу причин'),
    ('5.1.3.1.', 'Химическое загрязнение (отложения, шлам, накипь)'),
    ('5.1.3.2.', 'Пожар, загорание, взрыв'),
    ('5.1.3.3.', 'Неконтролируемая химическая реакция'),
    ('5.1.3.4.', 'Проблемы физики реактора'),
    ('5.1.3.5.', 'Неудовлетворительная химическая технология или не соответствующий требованиям химический контроль'),
    ('5.1.3.6.', 'Радиоактивное загрязнение'),

    ('5.1.4.', 'ГИДРАВЛИЧЕСКИЕ ЯВЛЕНИЯ, ПРОЦЕССЫ'),
    ('5.1.4.0.', 'Прочие гидравлические причины, не вошедшие в данную группу причин'),
    ('5.1.4.1.', 'Гидравлический удар, превышение давления'),
    ('5.1.4.2.', 'Снижение давления'),
    ('5.1.4.3.', 'Пульсация давления'),
    ('5.1.4.4.', 'Кавитация'),
    ('5.1.4.5.', 'Газовая пробка'),
    ('5.1.4.6.', 'Наличие влаги в воздушной системе'),
    ('5.1.4.7.', 'Помпаж'),

    ('5.1.5.', 'ЯВЛЕНИЯ, ПРОЦЕССЫ В КОНТРОЛЬНО-ИЗМЕРИТЕЛЬНЫХ СИСТЕМАХ'),
    ('5.1.5.0.', 'Прочие причины, не вошедшие в данную группу причин'),
    ('5.1.5.1.', 'Ложный сигнал'),
    ('5.1.5.2.', 'Колебания параметра'),
    ('5.1.5.3.', 'Смещение уставки, смещение "нуля"'),
    ('5.1.5.4.', 'Неправильное показание параметра'),
    ('5.1.5.5.', 'Потеря сигнала, отсутствие сигнала'),
    ('5.1.5.6.', 'Недостатки или дефекты компьютерных технических средств'),
    ('5.1.5.7.', 'Недостаток компьютерного программного обеспечения'),

    ('5.1.6.', 'УСЛОВИЯ ОКРУЖАЮЩЕЙ СРЕДЫ ДЛЯ ОБОРУДОВАНИЯ (АНОМАЛЬНЫЕ УСЛОВИЯ В ПОМЕЩЕНИЯХ АС)'),
    ('5.1.6.0.', 'Прочие условия окружающей среды, не вошедшие в данную группу причин (АНОМАЛЬНЫЕ УСЛОВИЯ В ПОМЕЩЕНИЯХ АС)'),
    ('5.1.6.1.', 'Температура'),
    ('5.1.6.2.', 'Давление'),
    ('5.1.6.3.', 'Влажность'),
    ('5.1.6.4.', 'Затопление'),
    ('5.1.6.5.', 'Замерзание'),
    ('5.1.6.6.', 'Облучение узлов (элементов)'),
    ('5.1.6.8.', 'Задымление'),
    ('5.1.6.9.', 'Взрыв'),

    ('5.1.7.', 'УСЛОВИЯ ОКРУЖАЮЩЕЙ СРЕДЫ (АНОМАЛЬНЫЕ УСЛОВИЯ ВНЕ ПОМЕЩЕНИЙ АС)'),
    ('5.1.7.0.', 'Прочие условия окружающей среды, не вошедшие в данную группу причин (АНОМАЛЬНЫЕ УСЛОВИЯ ВНЕ ПОМЕЩЕНИЙ АС)'),
    ('5.1.7.1.', 'Поражение молнией'),
    ('5.1.7.2.', 'Сильный дождь или снегопад, наводнение'),
    ('5.1.7.3.', 'Буря (ураган), торнадо, ветровая нагрузка'),
    ('5.1.7.4.', 'Землетрясение'),
    ('5.1.7.5.', 'Низкая температура, замерзание'),
    ('5.1.7.6.', 'Высокая температура'),
    ('5.1.7.7.', 'Воздушная ударная волна'),
    ('5.1.7.8.', 'Падающие, летящие предметы'),
    ('5.1.7.9.', 'Обледенение'),
    ('5.1.7.10.', 'Неравномерность осадки фундамента'),

    ('5.1.8.', 'ЧЕЛОВЕЧЕСКИЙ ФАКТОР, ПРИЧИНЫ ОШИБОК ПЕРСОНАЛА'),
    ('5.1.8.1.', 'Вид неправильных действий персонала'),
    ('5.1.8.1.0.', 'Прочие неправильные действия персонала'),
    ('5.1.8.1.1.', 'Неправильное выполнение технологических операций (в том числе при выполнении переключений, подключений), воздействие на элементы защиты, автоматики'),
    ('5.1.8.1.2.', 'Бездействие, пропуск необходимых действий'),
    ('5.1.8.1.3.', 'Нарушение технологии технического обслуживания'),
    ('5.1.8.2.', 'Неправильное, случайное воздействие на элементы защиты и автоматики'),
    ('5.1.8.3.', 'Самовольное производство работ, переключений и.т.д.'),
    ('5.1.8.4.', 'Несогласованные действия'),
    ('5.1.8.5.', 'Установка, ввод в работу непроверенной дефектной аппаратуры элементов (с неисправными устройствами, узлами); установка непроектных узлов, деталей'),
    ('5.1.8.6.', 'Отсутствие контроля, некачественный контроль за состоянием систем (элементов) и выполняемыми технологическими операциями'),
    ('5.1.8.7.', 'Преднамеренное вмешательство в работу автоматики'),
    ('5.1.8.8.', 'Работа без программы, бланка переключений, наряда-допуска, отступление от программы работ, инструкции и других документов'),
    ('5.1.8.9.', 'Некачественный ремонт, нарушение технологии ремонта'),
    ('5.1.8.10.', 'Некачественная сварка'),
    ('5.1.8.11.', 'Некачественная сборка (ненадежная затяжка, обжатие разъемных соединений, уплотнений и др.)'),
    ('5.1.8.12.', 'Некачественные послеремонтные испытания, обкатка'),
    ('5.1.8.13.', 'Ошибки при инспекции, техническом обслуживании, испытании или настройке'),
)     

CATEGORIES_REASON_OLD  = (
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

CONDITION_EQUIPMENT = ('В эксплуатации', # 1
                       'В ПНР', # 2
                       'В СМР', # 3
                      )

DIVISIONS = (
            ('РЦ-1', ('Reactor shop', 'Reactor shop of the 1st stage', 'Reactor Workshop 1st stage', 'Pipeline and Valves Department', 'Reactor Shop of The 1st Stage',)),
            ('РЦ-2', ('Reactor shop – 2', 'Reactor shop of the 2nd stage', 'Reactor shop of the 2nd stag',)),
            ('ТЦ-1', ('Turbine shop of the 1st stage', 'Turbine Shop',)),
            ('ТЦ-2', ('Turbine shop of the 2nd stage',)),
            ('ХЦ', ('Chemical shop',)),
            ('ЦВиК', ('Ventilation and Air Conditioning Shop', 'Deputy Chief Technology Officer for Operation', 'Ventilation and air conditioning shop', 'deputy chief technology officer for \noperation')),
            ('СТУ', ('Process Control Service', 'Process control service',)),
            ('ЦОРОиОЯТ', ('Workshop for Radioactive Waste and Spent Nuclear Fuel Management', 'Radioactive Waste Management Department',)),
            ('ЦРБ', ('Radiation safety shop', 'Radiation Safety Shop',)),
            ('ЦД', ('Decontamination Shop', 'Decontamination shop',)),
            ('ЭЦ', ('Electrical Shop', 'Electrical shop',)),
            ('ЦТАИ', ('Thermal Automation and Measurement Shop Head of Shop', 'Thermal instrumentation and control shop', 'Thermal Instrumentation and Control Shop',)),
            ('ЦИКТ', ('Information and Communication Technology Shop',)),
            ('ОАиОБ', ('Departament of Safety Analysis and Assessment',)),
            ('ОЯБ', ('Nuclear Safety Department', 'Nuclear safety department', 'Nuclear Safety Unit',)),
            ('ЦЦР', ('Centralized repair shop', 'Centralized Repair Shop', 'сentralized repair shop',)),
            ('ОППР', ('Repair Preparation and Performance Department',)),
            ('ОУР', ('Repair Management Department',)),
            ('КТО', ('Design and Technology Department',)),
            ('ОРЗиС', ('Buildings And Structures Repair Department', 'Repair Department for Buildings and Structures', 'Department for repair of buildings and structures', 'Buildings And Structures Repair Departments',)),
            ('ЛТД', ('Technical Inspection Laboratory', 'Technical Diagnostics Laboratory',)),
            ('ОИТП', ('Engineering Support Departmen', 'Engineering Support Department', 'Engineering and Technical Support Department',)),
            ('ОИОЭиРН', ('Operating Experience Use & Violations Investigation Department', 'Experience Utilization and Violations Investigation Department',)),
            ('ЦТПК', ('Shop for thermal and underground communications', 'Thermal and Underground Communications Shop', 'Heat and Underground Networks Department',)),
            ('ЦГТС', ('Hydraulic Engineering Installations Shop', 'Hydrotechnical Engineering Installation Shop', 'Hydraulic Engineering Installations Department',)),
            ('ЦСОБ', ('Safety Assurance Systems Shop', 'Safety System Shop', 'Security Systems Workshop',)),
            ('УКТиПБ', ('Technical and Industrial Safety Control Department', 'Technical and Industrial Safety Monitoring Department', 'Buildings, Structures and HTS Monitoring Group', 'Operation Control and Personnel Management Group',)),
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
                            'deputy director of npp under construction - chief technology off'
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

    ######## добавление состояний оборудования в БД #######
    async with async_session() as session:
        for condition_equipment_name in CONDITION_EQUIPMENT:
            condition_equipment = ConditionEquipment(condition_equipment_name=condition_equipment_name)
            session.add(condition_equipment)
        await session.commit()
    #######################################################

    ########### добавление списка ролей в БД #######
    async with async_session() as session:
        for role in ROLES:
            role = Role(role_name=role[0], role_group_name_AD=role[1])
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
            await session.commit()
            division_id = division.division_id
            for division_AD in divisions_AD:
                divisionAD =  DivisionAD(divisionAD_name=division_AD.lower(), divisionAD_division_id=division_id)
                session.add(divisionAD)
                try:
                    await session.commit()
                except IntegrityError as err:
                    await session.rollback()
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
            
    ########### добавление непосредственных причин дефекта в БД #######
    async with async_session() as session:
        for categories_reason_direct in CATEGORIES_REASON_DIRECT:
            category_r_d = CategoryDirectReason(category_reason_code=categories_reason_direct[0], category_reason_name=categories_reason_direct[1])
            session.add(category_r_d)
            await session.commit()
    ################################################

    ########### добавление ROOT пользователя в БД #######
    if not AD:
        async with async_session() as session:
            hash_salt: tuple[str, str] = security.get_hash_salt(ROOT['password'])
            user_password_hash, user_salt_for_password = hash_salt
            result_roles = await Role.get_all_roles(session)
            result_divisions = await Division.get_all_division(session)
            role_admin = result_roles[-1]
            division_admin = result_divisions[-1]
            now_time = get_time()

            root_user = User(
                user_id = 'D.Postnikov'.lower(),
                user_name = 'Денис',
                user_fathername = 'root',
                user_surname = 'Постников',
                user_position = 'root',
                user_password_hash = user_password_hash,
                user_salt_for_password = user_salt_for_password,
                user_temp_password = False,
                user_division_id = division_admin.division_id,
                user_email = 'D.Postnikov@akkuyu.com'.lower(),
                user_created_at=now_time,
            )
            root_user.user_role.append(role_admin)
            session.add(root_user)

            await session.commit()

    ########### добавление пользователей в БД #######
    if not AD:
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
                    user_id = USERS[user]['user_email'].split('@')[0].lower(),
                    user_name = USERS[user]['user_name'],
                    user_fathername = USERS[user]['user_fathername'],
                    user_surname = USERS[user]['user_surname'],
                    user_position = user,
                    user_password_hash = user_password_hash,
                    user_salt_for_password = user_salt_for_password,
                    user_temp_password = False,
                    user_division_id = division.division_id,
                    user_email = USERS[user]['user_email'].lower(),
                    user_created_at=now_time,
                )
                user.user_role.append(role)
                session.add(user)
                session.add(root_user)
                
            await session.commit()

########### добавление пользователей в БД #######
    if not AD:
        async with async_session() as session:
            for user_bonus in USERS_BONUS:
                now_time = get_time()  
                hash_salt: tuple[str, str] = security.get_hash_salt(user_bonus['password'])
                user_password_hash, user_salt_for_password = hash_salt
                result_division = await Division.get_division_by_name(session, division_name=user_bonus['division_name'])
                division = result_division
                user = User(
                    user_id = user_bonus['user_email'].split('@')[0].lower(),
                    user_name = user_bonus['user_name'],
                    user_fathername = user_bonus['user_fathername'],
                    user_surname = user_bonus['user_surname'],
                    user_position = user_bonus['role_name'][0],
                    user_password_hash = user_password_hash,
                    user_salt_for_password = user_salt_for_password,
                    user_temp_password = False,
                    user_division_id = division.division_id,
                    user_email = user_bonus['user_email'].lower(),
                    user_created_at=now_time,
                )
                for role_name in user_bonus['role_name']:
                    role = await Role.get_role_by_rolename(session, role_name=role_name)
                    user.user_role.append(role)
                session.add(user)
                
            await session.commit()

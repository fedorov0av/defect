import pandas as pd
from io import BytesIO
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import StreamingResponse
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Alignment
from app.schemas.export import Defect_list_ids
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.defect import Defect
from db.defect import User
from db.history_defect import History

from app.schemas.defect import Defect_id
from app.schemas.user import UserAD

from app.middleware.auth import check_auth_api
from config import AD
from utils.jwt import decrypt_user_id, decode_token
from utils.ldap import LdapConnection


export_router = APIRouter() 

COLUMNS_NAME = ['№', 'Дата регистрации', 'Срок устранения', 'Подразделение-владелец', 'KKS', 'Оборудование', 'Описание дефекта', 'Статус', 'Ответственный на текущем статусе', 'Состояние оборудования', 'Категория дефекта', 'Класс оборудования', 'Код кор. п', 'Коренная причина дефекта', 'Код неп. п', 'Непосредственная причина дефекта']
COLUMNS_WIDTHS = {'№': 30, 'Дата регистрации': 60, 'Срок устранения': 60, 'Подразделение-владелец': 80, 'KKS': 40, 'Оборудование': 60, 'Описание дефекта': 100, 'Статус': 40, 'Ответственный на текущем статусе': 50, 'Состояние оборудования': 50, 'Категория дефекта': 50, 'Класс оборудования': 50, 'Код кор. п': 40, 'Коренная причина дефекта': 60, 'Код неп. п': 40, 'Непосредственная причина дефекта': 60}

COLUMNS_NAME_HISTORY = ['№', 'Дата', 'Статус', 'Ответственное лицо', 'Комментарий']

@export_router.post("/export_excel_defect/")
async def export_excel_defect(request: Request, response: Response, defect_list_ids: Defect_list_ids, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    df = pd.DataFrame(columns=COLUMNS_NAME)
    for defect_id in defect_list_ids.defect_list_ids:
        defect = await Defect.get_defect_by_id(session, defect_id)
        defect_repair_manager_fullname = ''
        if defect.defect_repair_manager_id:
            division_repair_manager = await User.get_user_by_id(session, defect.defect_repair_manager_id)
            # print(division_repair_manager.user_division.division_name)

        if AD:
            token_dec = await decode_token(request.cookies['jwt_refresh_token'])
            user_id = await decrypt_user_id(token_dec['subject']['userId'])
            """ passw = await decrypt_user_id(token_dec['subject']['userP'])
            ldap_connection = LdapConnection(session, user_id, passw) """
            ldap_connection = LdapConnection(session, user_id)
            defect_repair_manager: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_repair_manager_id) if defect.defect_repair_manager_id else None
            if defect.defect_status.status_defect_name not in ["Требует решения",]:
                defect_repair_manager_fullname = defect_repair_manager.user_surname + ' ' + defect_repair_manager.user_name if defect_repair_manager else defect.defect_division.division_name
            else:
                defect_repair_manager_fullname = defect.defect_division.division_name
        else:
            if defect.defect_status.status_defect_name in ["Требует решения",]:
                defect_repair_manager_fullname = defect.defect_division.division_name
        df_defect = pd.DataFrame(
                            [[defect.defect_id, # №
                            defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"), # Дата регистрации
                            (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else '') 
                            if not defect.defect_ppr else 'Устр. в ППР', # Срок устранения
                            defect.defect_division.division_name, # Подразделение-владелец
                            defect.defect_system.system_kks if defect.defect_system else '', # KKS
                            defect.defect_system.system_name, # Оборудование
                            defect.defect_description, # Описание дефекта
                            defect.defect_status.status_defect_name, # Статус
                            (defect.defect_repair_manager.user_surname + ' ' + defect.defect_repair_manager.user_name if
                                defect.defect_repair_manager else
                                defect.defect_division.division_name) if ((not AD) and (not defect_repair_manager_fullname)) else defect_repair_manager_fullname, # Ответственный на текущем статусе

                            #division_repair_manager.user_division.division_name if defect.defect_repair_manager_id else defect.defect_division.division_name,
                            
                            defect.defect_condition_equipment.condition_equipment_name, # Состояние оборудования
                            (defect.defect_category_defect.category_defect_name) if defect.defect_category_defect else None, # Категория дефекта
                            (defect.defect_system_klass) if defect.defect_system_klass else None, # Класс оборудования
                            (defect.defect_core_category_reason.category_reason_code) if defect.defect_core_category_reason else None, # Коренная причина дефекта
                            (defect.defect_core_category_reason.category_reason_name) if defect.defect_core_category_reason else None, # Код непосредственной причины
                            (defect.defect_direct_category_reason.category_reason_code) if defect.defect_direct_category_reason else None,# Непосредственная причина дефекта
                            (defect.defect_direct_category_reason.category_reason_name) if defect.defect_direct_category_reason else None,
                            ],], 
                            columns=COLUMNS_NAME
                            )
        df = pd.concat([df, df_defect], ignore_index=True)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer) as writer:
        df.to_excel(writer, columns=COLUMNS_WIDTHS, index=False)
        writer.book.worksheets[-1].column_dimensions['A'].width = 12 # №
        writer.book.worksheets[-1].column_dimensions['B'].width = 20 # Дата регистрации
        writer.book.worksheets[-1].column_dimensions['C'].width = 20 # Срок устранения
        writer.book.worksheets[-1].column_dimensions['D'].width = 30 # Подразделение-владелец
        writer.book.worksheets[-1].column_dimensions['E'].width = 20 # KKS
        writer.book.worksheets[-1].column_dimensions['F'].width = 30 # Оборудование
        writer.book.worksheets[-1].column_dimensions['G'].width = 80 # Описание дефекта
        writer.book.worksheets[-1].column_dimensions['H'].width = 22 # Статус
        writer.book.worksheets[-1].column_dimensions['I'].width = 38 # Ответственный на текущем статусе
        #writer.book.worksheets[-1].column_dimensions['J'].width = 30 # Отвечает за устранение
        writer.book.worksheets[-1].column_dimensions['J'].width = 28 # Состояние оборудования
        writer.book.worksheets[-1].column_dimensions['K'].width = 30 # Категория дефекта
        writer.book.worksheets[-1].column_dimensions['L'].width = 23 # Класс оборудования
        writer.book.worksheets[-1].column_dimensions['M'].width = 13 # Код коренной причины
        writer.book.worksheets[-1].column_dimensions['N'].width = 80 # Коренная причина дефекта
        writer.book.worksheets[-1].column_dimensions['O'].width = 13 # Код непосредственной причины
        writer.book.worksheets[-1].column_dimensions['P'].width = 80 # Непосредственная причина дефекта
        row_count = 1 # номер стартовой строки для начала добавления рамки и переноса строки
        for row in dataframe_to_rows(df, index=True, header=False):
            row_count += 1
            for row in writer.book.worksheets[-1]['A'+str(row_count):'P'+str(row_count)]:
                for cell in row:
                    cell.alignment = Alignment(wrap_text=True)
    return StreamingResponse(
        BytesIO(buffer.getvalue()),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": f"attachment; filename=e.xlsx"}
        )

@export_router.post("/export_history_excel_defect/")
async def export_history_excel_defect(request: Request, response: Response, defect_id: Defect_id, session: AsyncSession = Depends(get_db)):
    await check_auth_api(request, response) # проверка на истечение времени jwt токена
    df_head = pd.DataFrame()
    df_main = pd.DataFrame(columns=COLUMNS_NAME_HISTORY)
    defect: Defect = await Defect.get_defect_by_id(session, defect_id.defect_id)

    if AD:
        token_dec = await decode_token(request.cookies['jwt_refresh_token'])
        user_id = await decrypt_user_id(token_dec['subject']['userId'])
        """ passw = await decrypt_user_id(token_dec['subject']['userP'])
        ldap_connection = LdapConnection(session, user_id, passw) """
        ldap_connection = LdapConnection(session, user_id)
        defect_registrar: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_registrator_id) if defect.defect_registrator_id else None
        defect_registrar_fullname = defect_registrar.user_surname + ' ' + defect_registrar.user_name if defect_registrar else ''

        defect_checker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_checker_id) if defect.defect_checker_id else None
        defect_checker_fullname = defect_checker.user_surname + ' ' + defect_checker.user_name if defect_checker else ''

        defect_worker: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_worker_id) if defect.defect_worker_id else None
        defect_worker_fullname = defect_worker.user_surname + ' ' + defect_worker.user_name if defect_worker else ''

        defect_repair_manager: UserAD =  await ldap_connection.get_user_by_uid_from_AD(defect.defect_repair_manager_id) if defect.defect_repair_manager_id else None
        defect_repair_manager_fullname = defect_repair_manager.user_surname + ' ' + defect_repair_manager.user_name if defect_repair_manager else ''

    df_header_left_title = pd.DataFrame({"Data": ['ОБЩАЯ ИНФОРМАЦИЯ:',
                                                  'Номер дефекта:', 
                                                  'Тип дефекта:',
                                                  'KKS:', 
                                                  'Подразделение-владелец:', 
                                                  'Дата регистрации:',
                                                  'Срок устранения:', 
                                                  'Выполненные работы:',
                                                  'Результат проверки:',
                                                  '',
                                                  'КЛАССИФИКАЦИЯ ДЕФЕКТА:',
                                                  'Категория дефекта:',
                                                  'Классификация оборудования:',
                                                  'Коренная причина дефекта:',
                                                  'Непосредственная причина дефекта:',
                                                  '',
                                                  'ИСТОРИЯ ДЕФЕКТА:',]})

    df_header_left_data = pd.DataFrame({"Data": ['',
                                                 defect.defect_id, 
                                                 defect.defect_type.type_defect_name, 
                                                 defect.defect_system.system_kks if defect.defect_system else '', 
                                                 defect.defect_division.division_name, 
                                                 defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                                                 (defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else '') if not defect.defect_ppr else 'Устр. в ППР', 
                                                 defect.defect_work_comment,
                                                 defect.defect_check_result,
                                                 '',
                                                 '',
                                                 (defect.defect_category_defect.category_defect_name) if defect.defect_core_category_reason else None,
                                                 (defect.defect_system_klass) if defect.defect_system_klass else None,
                                                 ((defect.defect_core_category_reason.category_reason_code) if defect.defect_core_category_reason else None) + ' ' + (defect.defect_core_category_reason.category_reason_name) if defect.defect_core_category_reason else None,
                                                 ((defect.defect_direct_category_reason.category_reason_code) if defect.defect_direct_category_reason else None) + ' ' + (defect.defect_direct_category_reason.category_reason_name) if defect.defect_direct_category_reason else None,]})
    
    df_header_right_title = pd.DataFrame({"Data": ['Статус дефекта:', 
                                                  'Оборудование:',
                                                  'Описание дефекта',
                                                  'Местоположение:', 
                                                  'Обнаружил дефект:', 
                                                  'Руководитель ремонта:', 
                                                  'Исполнитель ремонта:',
                                                  'Выполнил проверку:']})
    
    df_header_right_data = pd.DataFrame({"Data": [defect.defect_status.status_defect_name, 
                                                 defect.defect_system.system_name, 
                                                 defect.defect_description,
                                                 defect.defect_location, 
                                                 (defect.defect_registrar.user_surname + ' ' + defect.defect_registrar.user_name + ' ' + defect.defect_registrar.user_fathername if defect.defect_registrar else '') if not AD else defect_registrar_fullname,
                                                 (defect.defect_repair_manager.user_surname + ' ' + defect.defect_repair_manager.user_name if defect.defect_repair_manager else '') if not AD else defect_repair_manager_fullname,
                                                 (defect.defect_worker.user_surname + ' ' + defect.defect_worker.user_name + ' ' + defect.defect_worker.user_fathername if defect.defect_worker else '') if not AD else defect_worker_fullname,
                                                 (defect.defect_checker.user_surname + ' ' + defect.defect_checker.user_name if defect.defect_checker else '') if not AD else defect_checker_fullname,
                                                 '']})
     
    result: list[History] = await History.get_history_by_defect(session, defect)
    for count, history_defect in enumerate(result):
        if AD:
            history_user: UserAD =  await ldap_connection.get_user_by_uid_from_AD(history_defect.history_user_id)
            history_user_fullname = history_user.user_surname + ' ' + history_user.user_name
        df_history_defect = pd.DataFrame(
                                [[count+1,
                                 history_defect.history_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                                 history_defect.history_status.status_defect_name,
                                 (history_defect.history_user.user_surname + ' ' + history_defect.history_user.user_name) if not AD else history_user_fullname,
                                 history_defect.history_comment,
                                 ],], 
                                columns=COLUMNS_NAME_HISTORY
                                )
        df_main = pd.concat([df_main, df_history_defect], ignore_index=True) 
    buffer = BytesIO()
    with pd.ExcelWriter(buffer) as writer:
        df_header_left_title.style.set_properties(**{'font-weight': 'bold'}).to_excel(writer, index=False, header=False, startcol=1, startrow=1)
        df_header_left_data.to_excel(writer, index=False, header=False, startcol=2, startrow=1)
        df_header_right_title.style.set_properties(**{'font-weight': 'bold'}).to_excel(writer, index=False, header=False, startcol=3, startrow=2)
        df_header_right_data.to_excel(writer, index=False, header=False, startcol=4, startrow=2)
        """ df_head.to_excel(writer, index=False, header=False, startrow=2) """
        df_main.to_excel(writer, index=False, header=True, startrow=18)
        writer.book.worksheets[-1].column_dimensions['A'].width = 5 # №
        writer.book.worksheets[-1].column_dimensions['B'].width = 40 # Дата
        writer.book.worksheets[-1].column_dimensions['C'].width = 25 # Статус
        writer.book.worksheets[-1].column_dimensions['D'].width = 25 # Ответственное лицо
        writer.book.worksheets[-1].column_dimensions['E'].width = 80 # Комментарий

    return StreamingResponse(
        BytesIO(buffer.getvalue()),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": f"attachment; filename=e.xlsx"}
        )
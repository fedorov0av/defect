import pandas as pd
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from io import BytesIO

from db.division import Division
from db.database import get_db
from db.defect import Defect

from app.schemas.export import Defect_list_ids
from sqlalchemy.ext.asyncio import AsyncSession

from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Border, Side, PatternFill, Font, Alignment, Color


export_router = APIRouter()

COLUMNS_NAME = ['№', 'Дата регистрации', 'Срок устранения', 'Подразделение-владелец', 'KKS', 'Оборудование', 'Описание дефекта', 'Статус', 'Ответственный']
COLUMNS_WIDTHS = {'№': 30, 'Дата регистрации': 60, 'Срок устранения': 60, 'Подразделение-владелец': 80, 'KKS': 40, 'Оборудование': 60, 'Описание дефекта': 100, 'Статус': 40, 'Ответственный': 50}

@export_router.post("/export_excel_defect/")
async def export_excel_defect(defect_list_ids: Defect_list_ids, session: AsyncSession = Depends(get_db)):
    df = pd.DataFrame(columns=COLUMNS_NAME)
    for defect_id in defect_list_ids.defect_list_ids:
        defect = await Defect.get_defect_by_id(session, defect_id)
        df_defect = pd.DataFrame(
                                [[defect.defect_id,
                                 defect.defect_created_at.strftime("%d-%m-%Y %H:%M:%S"),
                                 defect.defect_planned_finish_date.strftime("%d-%m-%Y") if defect.defect_planned_finish_date else '',
                                 defect.defect_division.division_name,
                                 defect.defect_system.system_kks if defect.defect_system else '',
                                 defect.defect_system.system_name,
                                 defect.defect_description,
                                 defect.defect_status.status_defect_name,
                                 defect.defect_repair_manager.user_surname + ' ' + defect.defect_repair_manager.user_name if defect.defect_repair_manager else ''
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
        writer.book.worksheets[-1].column_dimensions['G'].width = 30 # Описание дефекта
        writer.book.worksheets[-1].column_dimensions['H'].width = 22 # Статус
        writer.book.worksheets[-1].column_dimensions['I'].width = 20 # Ответственный
        row_count = 1 # номер стартовой строки для начала добавления рамки и переноса строки
        for row in dataframe_to_rows(df, index=True, header=False):
            row_count += 1
            for row in writer.book.worksheets[-1]['A'+str(row_count):'I'+str(row_count)]:
                for cell in row:
                    cell.alignment = Alignment(wrap_text=True)
    return StreamingResponse(
        BytesIO(buffer.getvalue()),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": f"attachment; filename=e.xlsx"}
        )




    result: list[Division] = await Division.get_all_division(session)
    division_l = list()
    for division in result:
        division_l.append(
            {
                'division_id': division.division_id,
                'division_name': division.division_name,
            }
        )
    return division_l
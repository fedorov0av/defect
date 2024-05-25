from typing import Optional
from pydantic import BaseModel

class Date_p(BaseModel):
    date: Optional[str]

class Division_id(BaseModel):
    division_id: Optional[int]

class Type_defect_id(BaseModel):
    type_defect_id: Optional[int]

class Status_id(BaseModel):
    status_id: Optional[int]

class Сomment(BaseModel):
    comment: Optional[str]

class Ppr(BaseModel):
    ppr: Optional[bool]

class Pnr(BaseModel):
    pnr: Optional[bool]
    
class Safety(BaseModel):
    safety: Optional[bool]

class Exploitation(BaseModel):
    exploitation: Optional[bool]

class Filter(BaseModel):
    division_id: Optional[int] = 0 
    status_id: Optional[int] = 0 
    date_start: Optional[str] = None
    date_end: Optional[str] = None
    ppr: Optional[bool] = None
    pnr: Optional[bool] = None
    safety: Optional[bool] = None
    exploitation: Optional[bool] = None
    type_defect_id: Optional[int] = 0 
    srok_date: Optional[str] = None
    overdue: Optional[bool] = None
    allDefects: Optional[bool] = None

class DivisionAD(BaseModel):
    division_id: Optional[int]
    division_name: Optional[str]

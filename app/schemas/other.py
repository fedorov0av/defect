from typing import Optional
from pydantic import BaseModel

class Date_p(BaseModel):
    date: Optional[str]

class Division_id(BaseModel):
    division_id: Optional[int]

class Status_id(BaseModel):
    status_id: Optional[int]

class Сomment(BaseModel):
    comment: Optional[str]

class Filter(BaseModel):
    division_id: Optional[int] = 0 
    status_id: Optional[int] = 0 
    date_start: Optional[str] = None
    date_end: Optional[str] = None

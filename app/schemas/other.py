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
    division: Optional[int]
    date_start: Optional[str]
    date_end: Optional[str]
    status: Optional[int]

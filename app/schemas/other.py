from typing import Optional
from pydantic import BaseModel

class Date_p(BaseModel):
    date: Optional[str]

class Division_id(BaseModel):
    division_id: Optional[int]

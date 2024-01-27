from typing import Optional
from pydantic import BaseModel

class TypeDefect_id(BaseModel):
    type_defect_id: Optional[int]

class TypeDefect_name(BaseModel):
    type_defect_name: Optional[str] = None
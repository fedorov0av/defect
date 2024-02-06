from typing import Optional
from pydantic import BaseModel

class System_id(BaseModel):
    system_id: Optional[int]

class System_kks(BaseModel):
    system_kks: Optional[str] = None

class System_name(BaseModel):
    system_name: Optional[str] = None

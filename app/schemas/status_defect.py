from typing import Optional
from pydantic import BaseModel

class StatusDefect_id(BaseModel):
    status_defect_id: Optional[int]

class StatusDefect_name(BaseModel):
    status_defect_name: Optional[str]
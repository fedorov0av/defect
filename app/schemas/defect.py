from typing import Optional
from pydantic import BaseModel

class New_defect_p(BaseModel):
    defect_description: Optional[str]
    defect_system_name: Optional[str]
    defect_system_kks: Optional[str]
    defect_type_defect_name: Optional[str]
    defect_location: Optional[str]

class Defect_id(BaseModel):
    defect_id: Optional[int]

class User_id(BaseModel):
    user_id: Optional[int]
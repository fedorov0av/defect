from typing import Optional
from pydantic import BaseModel

class New_defect_p(BaseModel):
    defect_registrator_id: Optional[int]
    defect_description: Optional[str]
    defect_division_name: Optional[str]
    defect_system_name: Optional[str]
    defect_system_kks: Optional[str]
    defect_type_defect_name: Optional[str]
    defect_location: Optional[str]

class User_id(BaseModel):
    user_id: Optional[int]
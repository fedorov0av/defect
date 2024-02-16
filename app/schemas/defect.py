from typing import Optional
from pydantic import BaseModel
from db.user import User
from db.type_defect import TypeDefect
from db.status_defect import StatusDefect
from db.division import Division
from db.system import System

from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic

PydanticUser = sqlalchemy_to_pydantic(User)
PydanticDefectType = sqlalchemy_to_pydantic(TypeDefect)
PydanticStatusDefect = sqlalchemy_to_pydantic(StatusDefect)
PydanticDivision = sqlalchemy_to_pydantic(Division)
PydanticSystem = sqlalchemy_to_pydantic(System)


class New_defect_p(BaseModel):
    defect_description: Optional[str]
    defect_system_name: Optional[str]
    defect_system_kks: Optional[str]
    defect_type_defect_name: Optional[str]
    defect_location: Optional[str]
    defect_user_division_id: Optional[int] = None
    defect_safety: Optional[bool]
    defect_pnr: Optional[bool]
    defect_exploitation: Optional[bool]
    defect_category_defect_id: Optional[int]
    defect_class_system: Optional[str] = None
    defect_core_reason_code: Optional[str] = None
    defect_direct_reason_code: Optional[str] = None
    defect_direct_reason_name: Optional[str] = None

class Defect_description_p(BaseModel):
    defect_description: Optional[str] = None

class Defect_location_p(BaseModel):
    defect_location: Optional[str] = None

class Defect_id(BaseModel):
    defect_id: Optional[str]

class Showcloseddefect(BaseModel):
    Showcloseddefect: Optional[bool]

class User_id(BaseModel):
    user_id: Optional[int]

class Defects_output(BaseModel):
    defect_id: Optional[str]
    defect_created_at: Optional[str]
    defect_registrar: Optional[str]
    defect_owner_surname: Optional[str]
    defect_owner: Optional[str]
    defect_repair_manager: Optional[dict]
    defect_worker: Optional[PydanticUser]
    defect_planned_finish_date: Optional[str]
    defect_description: Optional[str]
    defect_location: Optional[str]
    defect_type: Optional[PydanticDefectType]
    defect_status: Optional[PydanticStatusDefect]
    defect_division: Optional[PydanticDivision]
    defect_system: Optional[PydanticSystem]
    defect_system_kks: Optional[str]

    class Config:
        orm_mode = True




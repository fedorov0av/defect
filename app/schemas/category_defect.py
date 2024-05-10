from typing import Optional
from pydantic import BaseModel

class CategoryDefect_id(BaseModel):
    category_defect_id: Optional[int]

class ClassSystem_name(BaseModel):
    class_system_name: Optional[str] = None

class CoreClassification_code(BaseModel):
    core_rarery_code: Optional[str] = None

class DirectClassification_code(BaseModel):
    direct_rarery_code: Optional[str] = None

class DirectClassification_name(BaseModel):
    direct_rarery_name: Optional[str]  = None

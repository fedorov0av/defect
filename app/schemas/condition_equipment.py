from typing import Optional
from pydantic import BaseModel

class ConditionEquipment_id(BaseModel):
    condition_equipment_id: Optional[int]

class ConditionEquipment_name(BaseModel):
    condition_equipment_name: Optional[str] = None
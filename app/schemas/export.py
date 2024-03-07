from typing import List
from pydantic import BaseModel


class Defect_list_ids(BaseModel):
    defect_list_ids: List[str]

class History_defect_list_ids(BaseModel):
    history_defect_list_ids: List[str]
from typing import Optional, List
from pydantic import BaseModel


class Defect_list_ids(BaseModel):
    defect_list_ids: List[str]
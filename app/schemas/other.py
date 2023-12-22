from typing import Optional
from pydantic import BaseModel

class Date_p(BaseModel):
    date: Optional[str]

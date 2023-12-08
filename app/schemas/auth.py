from typing import Optional
from pydantic import BaseModel

class AuthData(BaseModel):
    email: Optional[str]
    password: Optional[str]
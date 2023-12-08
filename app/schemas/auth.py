from typing import Optional
from pydantic import BaseModel

class AuthData(BaseModel):
    username: Optional[str]
    password: Optional[str]
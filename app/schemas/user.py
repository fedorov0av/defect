from typing import Optional
from pydantic import BaseModel

class User_p(BaseModel):
    user_surname: Optional[str]
    user_name: Optional[str]
    user_fathername: Optional[str]
    user_position: Optional[str]
    user_division: Optional[str]
    user_role: Optional[str]
    email: Optional[str]
    password: Optional[str]

class User_update(BaseModel):
    user_id: Optional[int]
    user_surname: Optional[str]
    user_name: Optional[str]
    user_fathername: Optional[str]
    user_position: Optional[str]
    user_division: Optional[str]
    user_role: Optional[str]
    email: Optional[str]

class User_id(BaseModel):
    user_id: Optional[int]
from typing import Optional, List
from pydantic import BaseModel, validator
from app.schemas.other import DivisionAD
from sqlalchemy_to_pydantic import sqlalchemy_to_pydantic
from db.division import Division
from db.role import Role

PydanticDivision: Division = sqlalchemy_to_pydantic(Division)
PydanticRole: Role = sqlalchemy_to_pydantic(Role)

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
    user_id: Optional[str]
    user_surname: Optional[str]
    user_name: Optional[str]
    user_fathername: Optional[str] = ''
    user_position: Optional[str]
    user_division: Optional[str]
    user_role: Optional[str]
    email: Optional[str]

    class Config:
        validate_assigment = True

        @validator('user_fathername')
        def set_name(cls, user_fathername):
            return user_fathername or None

class User_id(BaseModel):
    user_id: Optional[str]

class UserAD(BaseModel):
    user_id: str # UID
    user_name: str # имя пользователя
    user_fathername: Optional[str] # отчество пользователя
    user_surname: str # фамилия пользователя
    user_position: str # должность пользователя
    user_division: PydanticDivision #  название подразделения пользователя
    user_role: List[PydanticRole] # роль пользователя в системе
    user_email: str # почта
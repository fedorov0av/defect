from pydantic import BaseModel
from pydantic import EmailStr, Field

class Password(BaseModel):
    password: str

class UserMail(BaseModel):
    email: EmailStr = Field(...)

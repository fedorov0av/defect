from typing import Optional
from pydantic import BaseModel
from pydantic import EmailStr, Field

class AuthData(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)

class CsrfSettings(BaseModel):
  secret_key: str = "trevorphilipsenterprises"
  cookie_samesite: str = "strict"
  
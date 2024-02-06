from typing import Optional
from pydantic import BaseModel

class AuthData(BaseModel):
    email: Optional[str]
    password: Optional[str]

class CsrfSettings(BaseModel):
  secret_key: str = "trevorphilipsenterprises"
  cookie_samesite: str = "strict"
  token_key: str = "csrf-token"
  token_location: str = "body"
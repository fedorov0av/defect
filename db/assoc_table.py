from db.base import Base
from sqlalchemy import ForeignKey, Table, Column

user_role = Table(
    "user_role_table",
    Base.metadata,
    Column("user_id", ForeignKey("user.user_id")),
    Column("role_id", ForeignKey("role.role_id")),
) # Для осуществления связи многие-ко-многим 

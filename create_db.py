import asyncio

from db.base import Base
from db.user import User
from db.role import Role
from db.defect import Defect
from db.history_defect import History
from db.type_defect import TypeDefect
from db.status_defect import StatusDefect
from db.create_db import create_tables


if __name__ == "__main__":
    asyncio.run(create_tables())
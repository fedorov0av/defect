import datetime
from sqlalchemy import ForeignKey, Integer, Text, String, DateTime, func, select, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.user import User
from db.defect import Defect
from db.type_defect import TypeDefect
from db.status_defect import StatusDefect


class History(Base):
    __tablename__ = "history" # процесс учета средств оснащения
    history_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    history_defect_id: Mapped[int] = mapped_column(ForeignKey("defect.defect_id")) # id поста из таблицы Defect
    history_defect: Mapped["Defect"] = relationship(foreign_keys=[history_defect_id]) #  для работы с таблицей Defect как с объектом
    history_user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id")) # id поста из таблицы User - пользователь
    history_user: Mapped["User"] = relationship(foreign_keys=[history_user_id]) #  для работы с таблицей User как с объектом
    history_status_id: Mapped[int] = mapped_column(ForeignKey("status_defect.status_defect_id")) # статус (Этап) дефекта
    history_status: Mapped["StatusDefect"] = relationship(foreign_keys=[history_status_id]) #  для работы с таблицей StatusDefect как с объектом
    history_comment: Mapped[str] = mapped_column(String(500)) # Коммент.
    history_created_at: Mapped[datetime.datetime] = mapped_column(DateTime('Europe/Moscow'), default=datetime.datetime.strptime(datetime.datetime.now().isoformat(sep=" ", timespec="seconds"), "%Y-%m-%d %H:%M:%S"))# таймштамп вноса предмета


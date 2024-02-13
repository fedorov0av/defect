import datetime
from sqlalchemy import ForeignKey, String, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base
from db.user import User
from db.defect import Defect
from db.status_defect import StatusDefect
from db.utils import get_time


class History(Base):
    __tablename__ = "history" # процесс учета средств оснащения
    history_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    history_defect_id: Mapped[str] = mapped_column(ForeignKey("defect.defect_id")) # id поста из таблицы Defect
    history_defect: Mapped["Defect"] = relationship(foreign_keys=[history_defect_id]) #  для работы с таблицей Defect как с объектом
    history_user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id")) # id поста из таблицы User - пользователь
    history_user: Mapped["User"] = relationship(foreign_keys=[history_user_id]) #  для работы с таблицей User как с объектом
    history_status_id: Mapped[int] = mapped_column(ForeignKey("status_defect.status_defect_id")) # статус (Этап) дефекта
    history_status: Mapped["StatusDefect"] = relationship(foreign_keys=[history_status_id]) #  для работы с таблицей StatusDefect как с объектом
    history_comment: Mapped[str] = mapped_column(String(3000), nullable=True) # Коммент.
    history_created_at: Mapped[datetime.datetime]

    @staticmethod
    async def add_history(session: AsyncSession, defect: Defect, user: User, status: StatusDefect, comment: str = None) -> None: # добавление истории в дефект в БД
        now_time = get_time()  
        history = History(
                        history_defect_id=defect.defect_id,
                        history_user_id=user.user_id,
                        history_status_id=status.status_defect_id,
                        history_created_at=now_time,
                          )
        if comment:
            history.history_comment = comment
          
        session.add(history)

        await session.commit()
        return history
    
    @staticmethod
    async def get_history_by_defect(session: AsyncSession, defect: Defect,) -> list:
        query = select(History).where(History.history_defect_id == defect.defect_id).order_by(History.history_id).options(selectinload(History.history_defect))\
                                                                                    .options(selectinload(History.history_user))\
                                                                                    .options(selectinload(History.history_status))
        result = await session.scalars(query)
        historys = result.all()
        return historys
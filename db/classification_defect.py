from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base
from db.category_reason import CategoryReason

class ClassificationDefect(Base): # классификация дефекта
    __tablename__ = "classification_defect" # 

    classification_defect_id: Mapped[int] = mapped_column(primary_key=True) # первичный ключ
    classification_defect_system_klass: Mapped[str] = mapped_column(String(30)) # Класс оборудования по 'НП-00-97'
    classification_defect_core_category_reason_code: Mapped[str] = mapped_column(ForeignKey("category_reason.category_reason_code")) # code из таблицы CategoryReason
    classification_defect_core_category_reason: Mapped["CategoryReason"] = relationship(foreign_keys=[classification_defect_core_category_reason_code]) #  для работы с таблицей CategoryReason как с объектом
    classification_defect_direct_category_reason_code: Mapped[str] = mapped_column(String(30)) # код непосредственной причины дефекта
    classification_defect_direct_category_reason_name: Mapped[str] = mapped_column(String(200), unique=True) # описание непосредственной причины дефекта


    @staticmethod
    async def add_classification_defect(session: AsyncSession,
                                        classification_defect: CategoryReason,
                                        system_klass: str,
                                        direct_category_reason_code: str,
                                        direct_category_reason_name: str,
                                        ) -> None: # добавление классификации дефекта в БД
        classification_defect = ClassificationDefect(
                        classification_defect_system_klass=system_klass,
                        classification_defect_core_category_reason_code=classification_defect.category_reason_code,
                        classification_defect_direct_category_reason_code=direct_category_reason_code,
                        classification_defect_direct_category_reason_name=direct_category_reason_name,
                          )
        session.add(classification_defect)
        await session.commit()
        return classification_defect
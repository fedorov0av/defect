"""add tables: defect_reason_core, defect_direct_reason; del teble classification_defect

Revision ID: 668c0a5a7fc1
Revises: a83380f0eece
Create Date: 2024-02-16 14:57:17.492339

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm
from db.defect_reason_core import CategoryCoreReason
from db.create_db import CATEGORIES_REASON

# revision identifiers, used by Alembic.
revision: str = '668c0a5a7fc1'
down_revision: Union[str, None] = 'a83380f0eece'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('category_core_reason',
    sa.Column('category_reason_code', sa.String(length=3), nullable=False),
    sa.Column('category_reason_name', sa.String(length=200), nullable=False),
    sa.PrimaryKeyConstraint('category_reason_code'),
    sa.UniqueConstraint('category_reason_name')
    )
    op.create_foreign_key(None, 'defect', 'category_core_reason', ['defect_core_category_reason_code'], ['category_reason_code'])
    # ### end Alembic commands ###
    bind = op.get_bind()
    session = orm.Session(bind=bind)

    for category_reason in CATEGORIES_REASON:
        category_core_reason = CategoryCoreReason(category_reason_code = category_reason[0], category_reason_name = category_reason[1])
        session.add(category_core_reason)
    session.commit()

def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'defect', type_='foreignkey')
    op.drop_table('category_core_reason')
    # ### end Alembic commands ###
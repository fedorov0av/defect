"""add tables: defect_reason_core, defect_direct_reason; del teble classification_defect

Revision ID: 9f812bc9b67d
Revises: 08bea1fbda48
Create Date: 2024-02-16 14:49:46.306792

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f812bc9b67d'
down_revision: Union[str, None] = '08bea1fbda48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('defect', sa.Column('defect_category_defect_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'defect', 'category_defect', ['defect_category_defect_id'], ['category_defect_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'defect', type_='foreignkey')
    op.drop_column('defect', 'defect_category_defect_id')
    # ### end Alembic commands ###

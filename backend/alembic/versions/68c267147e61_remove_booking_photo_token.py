
"""remove booking photo token"""

from alembic import op
import sqlalchemy as sa


revision = "68c267147e61"
down_revision = "2a3917c6b6f3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("bookings", "photo_token")


def downgrade() -> None:
    op.add_column(
        "bookings",
        sa.Column("photo_token", sa.String(length=64), nullable=True),
    )

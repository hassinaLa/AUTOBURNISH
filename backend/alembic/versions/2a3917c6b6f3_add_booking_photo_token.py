
"""add booking photo token

Revision ID: 2a3917c6b6f3
Revises: 0193b1ed7126
"""

import secrets
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2a3917c6b6f3"
down_revision: Union[str, Sequence[str], None] = "0193b1ed7126"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add the column temporarily as nullable.
    op.add_column(
        "bookings",
        sa.Column("photo_token", sa.String(length=64), nullable=True),
    )

    # 2. Generate a unique random token for every existing booking.
    connection = op.get_bind()

    booking_ids = connection.execute(
        sa.text("SELECT id FROM bookings WHERE photo_token IS NULL")
    ).scalars().all()

    for booking_id in booking_ids:
        connection.execute(
            sa.text(
                "UPDATE bookings "
                "SET photo_token = :token "
                "WHERE id = :booking_id"
            ),
            {
                "token": secrets.token_urlsafe(32),
                "booking_id": booking_id,
            },
        )

    # 3. Add a named unique constraint.
    op.create_unique_constraint(
        "uq_bookings_photo_token",
        "bookings",
        ["photo_token"],
    )

    # 4. Require a token for every booking.
    op.alter_column(
        "bookings",
        "photo_token",
        existing_type=sa.String(length=64),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_bookings_photo_token",
        "bookings",
        type_="unique",
    )

    op.drop_column("bookings", "photo_token")
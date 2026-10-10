from getpass import getpass

from app.database.database import SessionLocal
from app.models.admin import Admin
from app.core.security import hash_password


def main():

    db = SessionLocal()

    try:

        username = input("Admin username: ").strip()

        if not username:
            print("Username cannot be empty.")
            return

        existing_admin = (
            db.query(Admin)
            .filter(Admin.username == username)
            .first()
        )

        if existing_admin:
            print("This admin username already exists.")
            return

        password = getpass("Admin password: ")
        confirm_password = getpass("Confirm password: ")

        if not password:
            print("Password cannot be empty.")
            return

        if password != confirm_password:
            print("Passwords do not match.")
            return

        admin = Admin(
            username=username,
            hashed_password=hash_password(password)
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print()
        print("Admin created successfully.")
        print(f"Admin ID: {admin.id}")
        print(f"Username: {admin.username}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
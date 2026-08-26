import sqlite3

DATABASE_NAME = "lost_found.db"


def get_connection():

    connection = sqlite3.connect(DATABASE_NAME)

    connection.row_factory = sqlite3.Row

    return connection


def create_tables():

    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_type TEXT NOT NULL,
            description TEXT NOT NULL,
            keywords TEXT,
            status TEXT DEFAULT 'active',
            image_path TEXT
        )
    """)

    # Add image_path if using an older database
    columns = connection.execute(
        "PRAGMA table_info(items)"
    ).fetchall()

    column_names = [
        column["name"]
        for column in columns
    ]

    if "image_path" not in column_names:

        connection.execute(
            "ALTER TABLE items ADD COLUMN image_path TEXT"
        )

    connection.commit()

    connection.close()
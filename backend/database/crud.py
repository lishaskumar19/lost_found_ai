from .connection import get_connection


def create_item(
    item_type,
    description,
    keywords,
    image_path=None
):

    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO items
        (item_type, description, keywords, image_path)
        VALUES (?, ?, ?, ?)
        """,
        (
            item_type,
            description,
            keywords,
            image_path
        )
    )

    connection.commit()

    item_id = cursor.lastrowid

    connection.close()

    return item_id


def get_all_items():

    connection = get_connection()

    cursor = connection.execute(
        "SELECT * FROM items ORDER BY id DESC"
    )

    items = [
        dict(row)
        for row in cursor.fetchall()
    ]

    connection.close()

    return items
class Item:
    def __init__(
        self,
        item_type,
        description,
        keywords="",
        status="active"
    ):
        self.item_type = item_type
        self.description = description
        self.keywords = keywords
        self.status = status
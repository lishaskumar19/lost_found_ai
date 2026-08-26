def validate_item_description(text: str) -> bool:
    """
    Validate whether an item description is usable.
    """

    if not text:
        return False

    if len(text.strip()) < 3:
        return False

    return True
from .preprocessing import clean_text


def extract_keywords(text: str) -> list:
    """
    Extract important keywords from an item description.
    """

    cleaned_text = clean_text(text)

    words = cleaned_text.split()

    stop_words = {
        "the", "a", "an", "is", "was",
        "and", "or", "in", "on", "at",
        "to", "of", "for", "with",
        "my", "i", "it"
    }

    keywords = [
        word for word in words
        if word not in stop_words
    ]

    return keywords


def calculate_similarity(keywords1: list, keywords2: list) -> float:
    """
    Calculate similarity between two sets of keywords.
    """

    set1 = set(keywords1)
    set2 = set(keywords2)

    if not set1 or not set2:
        return 0.0

    common_words = set1.intersection(set2)

    similarity = len(common_words) / len(set1.union(set2))

    return round(similarity, 2)
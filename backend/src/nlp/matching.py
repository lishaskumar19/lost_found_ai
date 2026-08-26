from text_similarity import calculate_similarity


def match_items(lost_description, found_description):
    """
    Compare a lost item description with a found item description.
    Returns similarity score and match status.
    """

    score = calculate_similarity(
        lost_description,
        found_description
    )

    if score >= 0.70:
        status = "Potential Match"
    else:
        status = "Low Match"

    return {
        "similarity_score": score,
        "status": status
    }
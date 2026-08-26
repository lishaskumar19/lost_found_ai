def get_match_status(score):

    if score >= 0.70:
        return "Potential Match"

    elif score >= 0.50:
        return "Possible Match"

    else:
        return "Low Match"
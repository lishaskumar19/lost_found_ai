from matching import match_items


lost_item = "Black leather wallet with three card slots"

found_item = "Black leather purse containing card holders"


result = match_items(
    lost_item,
    found_item
)


print("Lost Item:", lost_item)
print("Found Item:", found_item)
print("Similarity Score:", result["similarity_score"])
print("Status:", result["status"])
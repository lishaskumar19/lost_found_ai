from text_similarity import calculate_similarity

lost_item = "Black leather wallet with three card slots"

found_item = "Black leather purse containing card holders"

score = calculate_similarity(lost_item, found_item)

print("Lost Item:", lost_item)
print("Found Item:", found_item)
print("Similarity Score:", score)
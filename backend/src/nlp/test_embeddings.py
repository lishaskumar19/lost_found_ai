from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Two example descriptions
text1 = "Black leather wallet with three card slots"
text2 = "Black leather purse containing card holders"

# Convert text into embeddings
embedding1 = model.encode([text1])
embedding2 = model.encode([text2])

# Calculate similarity
similarity = cosine_similarity(embedding1, embedding2)[0][0]

print("Text 1:", text1)
print("Text 2:", text2)
print("Similarity Score:", similarity)
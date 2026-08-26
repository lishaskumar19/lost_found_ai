from sklearn.metrics.pairwise import cosine_similarity

from src.embeddings.text_embeddings import generate_embedding


def calculate_text_similarity(text1, text2):
    """
    Calculate semantic similarity between two text descriptions.
    """

    embedding1 = generate_embedding(text1)
    embedding2 = generate_embedding(text2)

    score = cosine_similarity(
        [embedding1],
        [embedding2]
    )[0][0]

    return float(score)
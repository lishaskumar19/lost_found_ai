from feature_extractor import extract_features
from sklearn.metrics.pairwise import cosine_similarity


def compare_images(image1_path, image2_path):
    # Extract embeddings
    features1 = extract_features(image1_path)
    features2 = extract_features(image2_path)

    # Calculate cosine similarity
    similarity = cosine_similarity(
        [features1],
        [features2]
    )[0][0]

    return similarity


if __name__ == "__main__":
    lost_image = "uploads/lost.jpg"
    found_image = "uploads/found.jpg"

    similarity_score = compare_images(
        lost_image,
        found_image
    )

    print("Image similarity score:", round(float(similarity_score), 4))
    print("Similarity percentage:", round(float(similarity_score) * 100, 2), "%")
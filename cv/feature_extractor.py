import torch
from torchvision import models, transforms
from PIL import Image

# Load pre-trained ResNet18
model = models.resnet18(
    weights=models.ResNet18_Weights.DEFAULT
)

# Remove the final classification layer
model = torch.nn.Sequential(*list(model.children())[:-1])
model.eval()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def extract_features(image_path):
    image = Image.open(image_path).convert("RGB")

    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        features = model(image_tensor)

    # Convert from [1, 512, 1, 1] to [512]
    features = features.squeeze().numpy()

    return features


# Test the feature extractor
if __name__ == "__main__":
    image_path = "uploads/test.jpg"

    features = extract_features(image_path)

    print("Image embedding created successfully!")
    print("Embedding shape:", features.shape)
    print("First 10 values:", features[:10])
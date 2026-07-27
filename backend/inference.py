import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import io
import numpy as np
import cv2
import base64
import os
import gc
os.environ["OMP_NUM_THREADS"] = "1"
torch.set_num_threads(1)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, '..', 'model')

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

# Load label mapping
with open(os.path.join(MODEL_DIR, 'label_mapping.json'), 'r') as f:
    label_mapping = json.load(f)

idx_to_class = {v: k for k, v in label_mapping.items()}

NUM_CLASSES = len(label_mapping)
IMG_SIZE = 224

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Rebuild model architecture
model = models.efficientnet_b0(weights=None)
num_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_features, NUM_CLASSES)

model.load_state_dict(torch.load(os.path.join(MODEL_DIR, 'best_model.pth'), map_location=device))
model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

risk_levels = {
    'akiec': 'moderate',
    'bcc': 'high',
    'bkl': 'low',
    'df': 'low',
    'mel': 'high',
    'nv': 'low',
    'vasc': 'low'
}

# Set up Grad-CAM - target the last convolutional block of EfficientNet
target_layers = [model.features[-1]]
cam = GradCAM(model=model, target_layers=target_layers)


def predict(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image_resized = image.resize((IMG_SIZE, IMG_SIZE))
    image_tensor = transform(image).unsqueeze(0).to(device)

    # ---- Regular prediction ----
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]

    top3_prob, top3_idx = torch.topk(probabilities, 3)

    results = []
    for prob, idx in zip(top3_prob, top3_idx):
        class_name = idx_to_class[idx.item()]
        results.append({
            "condition": class_name,
            "confidence": round(prob.item() * 100, 2),
            "risk_level": risk_levels[class_name]
        })

    # ---- Grad-CAM heatmap for the TOP predicted class ----
    top_class_idx = top3_idx[0].item()
    grayscale_cam = cam(input_tensor=image_tensor, targets=None)[0]  # targets=None uses the top predicted class
    gc.collect()
    # Convert original image to a normalized numpy array (0-1 range) for overlay
    rgb_img = np.array(image_resized).astype(np.float32) / 255.0
    cam_overlay = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

    # Convert the overlay image to base64 so it can be sent as JSON (images can't be sent as raw JSON directly)
    _, buffer = cv2.imencode('.png', cv2.cvtColor(cam_overlay, cv2.COLOR_RGB2BGR))
    gradcam_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "predictions": results,
        "gradcam_image": gradcam_base64
    }
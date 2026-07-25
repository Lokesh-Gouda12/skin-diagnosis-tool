import requests
import base64

# Make sure your server is running first!
url = "http://127.0.0.1:8000/predict"

with open("../data/HAM10000_images_part_1/ISIC_0024306.jpg", "rb") as f:  # replace with any real image path from your dataset
    files = {"file": f}
    response = requests.post(url, files=files)

result = response.json()
print("Predictions:", result["predictions"])

# Decode and save the Grad-CAM image
gradcam_bytes = base64.b64decode(result["gradcam_image"])
with open("gradcam_output.png", "wb") as f:
    f.write(gradcam_bytes)

print("Saved heatmap to gradcam_output.png - open it to view!")
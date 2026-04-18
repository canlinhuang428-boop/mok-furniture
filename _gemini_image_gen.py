import requests
import base64
import json
import time

api_key = "AIzaSyCSwKRhdtoTPZW4xRvTJzJd925aVbdM00Q"
model = "gemini-2.0-flash-preview-image-generation"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

with open('/Users/huangcanlin/.openclaw/media/inbound/2d1e42da-12ae-4181-957f-752aa1f3c946.jpg', 'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode()

payload = {
    "contents": [{
        "parts": [
            {"text": "Remove background and replace with pure white background. Product centered with 8% whitespace at top and bottom. Keep exact product appearance, color, proportions, material. No text, logos, watermarks. High quality e-commerce photo. 1:1 square format."},
            {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}}
        ]
    }],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
}

print("Calling Gemini API...")
r = requests.post(url, json=payload, timeout=60)
print("Status:", r.status_code)
print("Response:", r.text[:2000])

#!/usr/bin/env python3
import subprocess
import json
import time
import os

base = "/Users/huangcanlin/mok-furniture/product-images"
out = "/Users/huangcanlin/mok-furniture/catbox_mok.json"

images = [
    ("products/MR01_1.jpg", f"{base}/MR01_1.jpg"),
    ("products/MR01_2.jpg", f"{base}/MR01_2.jpg"),
    ("products/MR01_3.jpg", f"{base}/MR01_3.jpg"),
    ("products/Y06A_1.jpg", f"{base}/Y06A_1.jpg"),
    ("products/Y06A_2.jpg", f"{base}/Y06A_2.jpg"),
    ("products/Y06A_3.jpg", f"{base}/Y06A_3.jpg"),
    ("products/Y06A_4.jpg", f"{base}/Y06A_4.jpg"),
    ("products/Y08B_1.jpg", f"{base}/Y08B_1.jpg"),
    ("products/Y08B_2.jpg", f"{base}/Y08B_2.jpg"),
    ("products/logo.jpg", f"{base}/logo.jpg"),
]

results = {}
for r2_key, local_path in images:
    filename = os.path.basename(local_path)
    print(f"Uploading {filename}...")
    try:
        result = subprocess.run(
            ["curl", "-s", "-F", "reqtype=fileupload", "-F", f"fileToUpload=@{local_path}",
             "https://catbox.moe/user/api.php"],
            capture_output=True, text=True, timeout=30
        )
        url = result.stdout.strip()
        if url.startswith("https://"):
            results[r2_key] = url
            print(f"  → {url}")
        else:
            results[r2_key] = None
            print(f"  ✗ Failed: {url}")
    except Exception as e:
        results[r2_key] = None
        print(f"  ✗ Exception: {e}")
    time.sleep(3)

with open(out, "w") as f:
    json.dump(results, f, indent=2)

print(f"\nDone. Results in {out}")

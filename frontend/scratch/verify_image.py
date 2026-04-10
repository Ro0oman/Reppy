from PIL import Image
import os

img_path = r"c:\Users\romai\Documents\GitHub\Reppy\frontend\public\goggins-post.png"

try:
    with Image.open(img_path) as img:
        print(f"Format: {img.format}")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
    print("SUCCESS: Image is valid.")
except Exception as e:
    print(f"FAILURE: {e}")

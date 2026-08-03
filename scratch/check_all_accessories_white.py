import os
import re
from PIL import Image

def find_referenced_images():
    folders = ["Tripod", "Storage", "lightings", "Microphones", "Gimbal", "Battery", "Bagpack", "Views"]
    workspace = os.getcwd()
    images = set()
    
    # Matches src="/Assets/..." or src="../Assets/..."
    pattern = re.compile(r'src=["\']([^"\']+\.(?:png|jpg|jpeg|webp))["\']', re.IGNORECASE)
    
    for folder in folders:
        if not os.path.exists(folder):
            continue
        for root, _, files in os.walk(folder):
            # Skip node_modules, .git
            if "node_modules" in root or ".git" in root or "scratch" in root:
                continue
            for file in files:
                if file.endswith(('.html', '.ejs', '.js')):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    matches = pattern.findall(content)
                    for m in matches:
                        # Clean up path
                        clean_path = m.strip()
                        if clean_path.startswith("http://") or clean_path.startswith("https://"):
                            continue
                        if clean_path.startswith("/"):
                            local_path = os.path.join(workspace, clean_path.lstrip("/"))
                        else:
                            local_path = os.path.normpath(os.path.join(root, clean_path))
                        if os.path.exists(local_path):
                            images.add(local_path)
                            
    return list(images)

def process_image(img_path, threshold=240):
    try:
        img = Image.open(img_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening {img_path}: {e}")
        return False
        
    w, h = img.size
    data = img.load()
    replaced = 0
    total = w * h
    
    # Count how many white pixels are currently in the image
    white_pixels = 0
    for x in range(w):
        for y in range(h):
            r, g, b, a = data[x, y]
            if a > 0 and r >= threshold and g >= threshold and b >= threshold:
                white_pixels += 1
                
    # If the white pixel percentage is high, we transparentize them!
    # Threshold: if more than 5% of the image is white and it is not already fully transparent
    percent_white = (white_pixels / total) * 100
    if percent_white > 3.0: # If more than 3% is white
        print(f"Found white background in {img_path} ({percent_white:.1f}% white). Processing...")
        
        for x in range(w):
            for y in range(h):
                r, g, b, a = data[x, y]
                if a > 0 and r >= threshold and g >= threshold and b >= threshold:
                    data[x, y] = (0, 0, 0, 0)
                    replaced += 1
                    
        # If it is a JPEG or WebP original, save as PNG and we might need to overwrite the file on disk
        # Wait, if the file is .png, we save it directly as PNG.
        # If it is .webp or .jpg, we can convert it to RGBA and save as PNG, but wait, the original file is .webp or .jpg.
        # If we overwrite a .jpg with a transparent image, JPEG does not support transparency! It will lose transparency!
        # So we MUST save it as PNG!
        # But wait! If the image is referenced as a PNG on disk (e.g. boya-by-bm2021.jpg.png or boya-by-bm2021_nobg.png), it supports transparency.
        # Let's see: are all the updated references pointing to PNGs?
        # Yes, our first script changed all references in the HTML files to point to `_nobg.png`!
        # E.g., `BOYA-BY-BM2021-5.jpg.png` was updated to `BOYA-BY-BM2021-5.jpg_nobg.png`!
        # Wait! Let's check: did our first script create `BOYA-BY-BM2021-5.jpg_nobg.png`?
        # No, because it was skipped during background removal!
        # Ah! So the HTML reference was NOT updated to `BOYA-BY-BM2021-5.jpg_nobg.png` because the file was skipped!
        # Wait, let's verify if `Microphones/boya-bm-2021.html` has `BOYA-BY-BM2021-5.jpg_nobg.png` or `BOYA-BY-BM2021-5.jpg.png`.
        # In the output of `boya-bm-2021.html`:
        # Line 34: `<img src="/Assets/BOYA-BY-BM2021-5.jpg_nobg.png"`
        # Line 107: `<img src="/Assets/BOYA-BY-BM2021-5.jpg.png"`
        # Ah! Line 34 has `_nobg.png`, but line 107 has `.jpg.png`!
        # Why did line 34 have `_nobg.png`? Probably from some previous model attempt.
        # So we should make sure that for ANY referenced image in the HTML files:
        # If it has a white background:
        # 1. We create its `_nobg.png` version (making all white pixels transparent).
        # 2. We update the reference in the HTML files to point to `_nobg.png`.
        # This is extremely robust!
        
        name, ext = os.path.splitext(img_path)
        if not name.endswith("_nobg"):
            output_path = f"{name}_nobg.png"
        else:
            output_path = img_path
            
        img.save(output_path, "PNG")
        print(f"Saved transparent version to {output_path} (removed {replaced} pixels)")
        return img_path, output_path
        
    return None

def main():
    referenced = find_referenced_images()
    print(f"Total referenced images in accessory views: {len(referenced)}")
    
    mapping = {}
    for img_path in referenced:
        res = process_image(img_path)
        if res:
            orig, nobg = res
            mapping[os.path.basename(orig)] = os.path.basename(nobg)
            
    if mapping:
        print("\nUpdating HTML/EJS/JS files with newly transparentized images...")
        search_dirs = [".", "Tripod", "Storage", "lightings", "Microphones", "Gimbal", "Battery", "Bagpack", "Views", "Data"]
        for s_dir in search_dirs:
            if not os.path.exists(s_dir):
                continue
            for root, _, files in os.walk(s_dir):
                if "node_modules" in root or ".git" in root or "scratch" in root:
                    continue
                for file in files:
                    if file.endswith(('.html', '.ejs', '.js')):
                        file_path = os.path.join(root, file)
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                        
                        orig_content = content
                        for orig_name, nobg_name in mapping.items():
                            if orig_name in content:
                                content = content.replace(orig_name, nobg_name)
                                
                        if content != orig_content:
                            with open(file_path, "w", encoding="utf-8") as f:
                                f.write(content)
                            print(f"Updated references in {file_path}")

if __name__ == "__main__":
    main()

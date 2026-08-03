import os
import re
from PIL import Image, ImageDraw

def is_near_white(pixel, threshold=240):
    if len(pixel) >= 3:
        r, g, b = pixel[:3]
        return r >= threshold and g >= threshold and b >= threshold
    return False

def remove_background(img_path, output_path, tolerance=30):
    try:
        img = Image.open(img_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening image {img_path}: {e}")
        return False
    
    width, height = img.size
    
    # Perform flood fill from borders
    border_pixels = []
    for x in range(0, width, 5):
        border_pixels.append((x, 0))
        border_pixels.append((x, height-1))
    for y in range(0, height, 5):
        border_pixels.append((0, y))
        border_pixels.append((width-1, y))
        
    filled = False
    for px in border_pixels:
        r, g, b, a = img.getpixel(px)
        if a > 0 and is_near_white((r, g, b), threshold=235):
            ImageDraw.floodfill(img, px, (0, 0, 0, 0), thresh=tolerance)
            filled = True
            
    # Also perform a global color replace for tripods/stands since they might have gaps
    # Let's check if the filename contains tripod or stand keywords
    lower_path = img_path.lower()
    if "tripod" in lower_path or "stand" in lower_path or "mvk" in lower_path or "gitzo" in lower_path or "sirui" in lower_path or "mefoto" in lower_path or "manfrotto" in lower_path:
        data = img.load()
        for x in range(width):
            for y in range(height):
                r, g, b, a = data[x, y]
                if a > 0 and r >= 240 and g >= 240 and b >= 240:
                    data[x, y] = (0, 0, 0, 0)
                    filled = True
                    
    img.save(output_path, "PNG")
    return True

def find_original_file(broken_path):
    assets_dir = "Assets"
    broken_filename = os.path.basename(broken_path)
    
    # e.g., if broken_filename is "eos-1500d-top-no-lens_nobg.png"
    # We strip "_nobg.png" or "_nobg" to find the base name "eos-1500d-top-no-lens"
    base_name = broken_filename
    if base_name.endswith("_nobg.png"):
        base_name = base_name[:-9]
    elif base_name.endswith("_nobg"):
        base_name = base_name[:-5]
        
    # Also support stripping intermediate extensions like .jpg_nobg.png -> base_name could be "eos-1500d-top-no-lens.jpg" or "eos-1500d-top-no-lens"
    # Let's clean up base_name
    possible_names = [base_name]
    if base_name.endswith(".jpg"):
        possible_names.append(base_name[:-4])
    elif base_name.endswith(".png"):
        possible_names.append(base_name[:-4])
    elif base_name.endswith(".jpeg"):
        possible_names.append(base_name[:-5])
    elif base_name.endswith(".webp"):
        possible_names.append(base_name[:-5])
        
    # Search in Assets directory for any file starting with base_name
    all_files = os.listdir(assets_dir)
    for f in all_files:
        f_lower = f.lower()
        # Skip nobg files as originals
        if "_nobg" in f_lower:
            continue
            
        f_name_part, _ = os.path.splitext(f)
        
        # Check if the filename without extension matches any of our possible base names
        # or if the entire filename matches
        if f_name_part in possible_names or f in possible_names:
            return os.path.join(assets_dir, f)
            
        # Also check if it starts with and is very similar
        for p in possible_names:
            if f_lower.startswith(p.lower()):
                return os.path.join(assets_dir, f)
                
    return None

def main():
    workspace = os.getcwd()
    search_dirs = [".", "Tripod", "Storage", "lightings", "Microphones", "Gimbal", "Battery", "Bagpack", "Views", "Data", "Camera", "Lens"]
    
    pattern = re.compile(r'["\']([^"\']*/Assets/[^"\']+)["\']', re.IGNORECASE)
    
    broken_refs = {}
    
    for s_dir in search_dirs:
        if not os.path.exists(s_dir):
            continue
        for root, _, files in os.walk(s_dir):
            if "node_modules" in root or ".git" in root or "scratch" in root:
                continue
            for file in files:
                if file.endswith(('.html', '.ejs', '.js', '.css')):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        
                    matches = pattern.findall(content)
                    for m in matches:
                        clean_path = m.strip()
                        if clean_path.startswith("/"):
                            local_path = os.path.join(workspace, clean_path.lstrip("/"))
                        elif clean_path.startswith("../"):
                            local_path = os.path.normpath(os.path.join(root, clean_path))
                        else:
                            local_path1 = os.path.normpath(os.path.join(root, clean_path))
                            local_path2 = os.path.join(workspace, clean_path)
                            if os.path.exists(local_path1):
                                local_path = local_path1
                            else:
                                local_path = local_path2
                                
                        if not os.path.exists(local_path):
                            broken_refs[local_path] = m
                            
    print(f"Total unique broken paths: {len(broken_refs)}")
    
    fixed_count = 0
    not_found = []
    
    for local_path, ref in broken_refs.items():
        original = find_original_file(local_path)
        if original:
            print(f"Broken Ref: {ref}")
            print(f"  Found original: {original}")
            print(f"  Generating transparent file at: {local_path}")
            success = remove_background(original, local_path)
            if success:
                fixed_count += 1
                print("  -> Success!")
            else:
                # If transparentization fails, just copy it so the image still shows up
                try:
                    img = Image.open(original)
                    img.save(local_path)
                    fixed_count += 1
                    print("  -> Fallback (copied original without changes)")
                except Exception as e:
                    print(f"  -> Failed: {e}")
        else:
            not_found.append(ref)
            
    print(f"\nRepair Summary:")
    print(f"Fixed broken images: {fixed_count}")
    print(f"Original files not found: {len(not_found)}")
    if not_found:
        print("Not found references:")
        for nf in not_found:
            print(f"  - {nf}")

if __name__ == "__main__":
    main()

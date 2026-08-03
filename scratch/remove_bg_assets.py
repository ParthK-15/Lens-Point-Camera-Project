import os
import sys
import re
from PIL import Image, ImageDraw

def is_near_white(pixel, threshold=240):
    if len(pixel) >= 3:
        r, g, b = pixel[:3]
        return r >= threshold and g >= threshold and b >= threshold
    return False

def has_transparency(img):
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # Check if there is actually any transparent pixel
        if img.mode == 'P':
            # Check palette transparency
            return True
        else:
            # Check alpha channel data
            alpha = img.getchannel('A')
            # If any pixel is less than 255 alpha, it has transparency
            extrema = alpha.getextrema()
            if extrema and extrema[0] < 255:
                return True
    return False

def remove_background(img_path, output_path, tolerance=30):
    try:
        img = Image.open(img_path)
    except Exception as e:
        print(f"Error opening image {img_path}: {e}")
        return False, "Error opening image"
    
    # 1. Skip if already has transparent pixels
    if has_transparency(img):
        return False, "Already has transparency"
        
    img = img.convert("RGBA")
    width, height = img.size
    
    # 2. Check corners to see if they are near-white
    corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    corner_whites = [is_near_white(img.getpixel(c)) for c in corners]
    
    # If not all corners are near-white, we might want to skip or flag for manual review
    if not all(corner_whites):
        # Check if at least 2 corners are white (could be a slightly cropped image or product touching a corner)
        if sum(corner_whites) < 2:
            return False, "Corners not white (requires manual review)"
            
    # 3. Perform flood fill from all border pixels
    # We will step along the borders to find near-white pixels and flood fill them
    border_pixels = []
    # Top and bottom borders
    for x in range(0, width, 5):
        border_pixels.append((x, 0))
        border_pixels.append((x, height-1))
    # Left and right borders
    for y in range(0, height, 5):
        border_pixels.append((0, y))
        border_pixels.append((width-1, y))
        
    filled = False
    for px in border_pixels:
        r, g, b, a = img.getpixel(px)
        if a > 0 and is_near_white((r, g, b), threshold=235):
            ImageDraw.floodfill(img, px, (0, 0, 0, 0), thresh=tolerance)
            filled = True
            
    if not filled:
        return False, "No background pixels filled"
        
    # Save the processed transparent image
    img.save(output_path, "PNG")
    return True, "Success"

def main():
    assets_dir = "Assets"
    if not os.path.exists(assets_dir):
        print(f"Assets directory not found at {assets_dir}")
        return
        
    all_files = os.listdir(assets_dir)
    image_files = [f for f in all_files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    # Filter out already processed files
    product_images = [f for f in image_files if not f.endswith('_nobg.png')]
    
    print(f"Total product images found in Assets: {len(product_images)}")
    
    processed_count = 0
    skipped_reasons = {}
    manual_review_images = []
    
    # Keep track of mapping: original filename -> new nobg filename
    mapping = {}
    
    for filename in product_images:
        input_path = os.path.join(assets_dir, filename)
        
        # Determine output filename
        name_part, _ = os.path.splitext(filename)
        output_filename = f"{name_part}_nobg.png"
        output_path = os.path.join(assets_dir, output_filename)
        
        success, reason = remove_background(input_path, output_path)
        if success:
            processed_count += 1
            mapping[filename] = output_filename
            print(f"Processed: {filename} -> {output_filename}")
        else:
            skipped_reasons[reason] = skipped_reasons.get(reason, 0) + 1
            if "manual review" in reason:
                manual_review_images.append(filename)
            # Remove output file if it was created by accident
            if os.path.exists(output_path):
                os.remove(output_path)
                
    print("\nBackground Removal Summary:")
    print(f"Total processed: {processed_count}")
    print("Skipped reasons:")
    for reason, count in skipped_reasons.items():
        print(f"  - {reason}: {count}")
    print(f"Manual review required: {len(manual_review_images)}")
    print(manual_review_images)
    
    # Step 4: Update all references in the project
    if processed_count > 0:
        print("\nUpdating references in files...")
        updated_files = set()
        
        # Scan directories
        search_dirs = [".", "Tripod", "Storage", "lightings", "Microphones", "Gimbal", "Battery", "Bagpack", "Views", "Routes", "Data"]
        for s_dir in search_dirs:
            if not os.path.exists(s_dir):
                continue
            for root, _, files in os.walk(s_dir):
                # Skip node_modules and .git
                if "node_modules" in root or ".git" in root or "scratch" in root:
                    continue
                for file in files:
                    if file.endswith(('.html', '.ejs', '.js', '.css')):
                        file_path = os.path.join(root, file)
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            
                        new_content = content
                        has_replacements = False
                        
                        for orig, nobg in mapping.items():
                            # We search for the filename exactly in content
                            # We can replace both absolute /Assets/filename and relative ../Assets/filename or Assets/filename
                            if orig in new_content:
                                new_content = new_content.replace(orig, nobg)
                                has_replacements = True
                                
                        if has_replacements:
                            with open(file_path, "w", encoding="utf-8") as f:
                                f.write(new_content)
                            updated_files.add(file_path)
                            print(f"Updated references in {file_path}")
                            
        print(f"Total files modified: {len(updated_files)}")
        print("Modified files:")
        for f in updated_files:
            print(f"  - {f}")
            
if __name__ == "__main__":
    main()

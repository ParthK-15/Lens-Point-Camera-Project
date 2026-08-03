import os
from PIL import Image

def remove_all_white_pixels(img_path, threshold=240):
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        return False
        
    try:
        img = Image.open(img_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening {img_path}: {e}")
        return False
        
    w, h = img.size
    data = img.load()
    replaced = 0
    
    for x in range(w):
        for y in range(h):
            r, g, b, a = data[x, y]
            if a > 0:
                # Check if pixel is near white
                if r >= threshold and g >= threshold and b >= threshold:
                    data[x, y] = (0, 0, 0, 0)
                    replaced += 1
                    
    img.save(img_path, "PNG")
    print(f"Overwrote {img_path} (removed {replaced} white pixels, {replaced/(w*h)*100:.1f}%)")
    return True

def main():
    assets_dir = "Assets"
    
    # List of all tripod image nobg filenames to process
    tripod_images = [
        "0017198_gitzo-gt5543ls-systematic-series-5-carbon-fiber-tripod_500_nobg.png",
        "Gitzo-GT3533LS-Systematic-Series-3-Carbon-Fiber-Tripod-2_nobg.png",
        "GTZ-GT3543LS-GHFG1_nobg.png",
        "MVK504TWINMC.jpg_nobg.png",
        "Manfrotto_Manfrotto_504HD_Video_Fluid_1285005659_735037_nobg.png",
        "manfrotto-504hd-head-w546gb-2-stage-aluminum-tripod-system-qatar4cam-2_nobg.png",
        "Manfrotto-Befree-Advanced-Designed-for-α-Cameras-from-Sony-MKBFRLA-BH-1-485x485_nobg.png",
        "professional_photo_tripod_befree-2.0_mvkbfrtc-live_sidehead-800x800.jpg_nobg.png",
        "MeFOTO-DayTrip-Compact-Tripod-Hot-Purple-Product-Photo-1_1024x.jpg_nobg.png",
        "27004489.png_nobg.png",
        "w8gi40jmjwqq3tk1wkti_500x.jpg_nobg.png",
        "0018825_peak-design-carbon-fiber-travel-tripod_500_nobg.png",
        "3d98d0321e01477885f6d9b01a03b0a0-product-assets_nobg.png",
        "8b0a48ccbaaf469089c8d6a69e66d37a-product-featured-lg_nobg.png",
        "Sirui-7C-Carbon-Fiber-Tripod-Online-Buy-India_1.jpg_nobg.png",
        "sirui-compact-traveler-5a-tripod-54-3-inches-lightweight-aluminum-travel-tripod-500x500.jpg_nobg.png",
        "61GE58lCHEL_nobg.png"
    ]
    
    # We will also add microphone tripods since they are black/grey and have white background stands
    mic_images = [
        "BOYA-BY-BM2021-5.jpg_nobg.png",
        "41bjMkzdCmL_nobg.png",
        "0016389_boya-by-bm3030-on-camera-supercardioid-shotgun-microphone_500_nobg.png"
    ]
    
    images_to_process = tripod_images + mic_images
    
    for filename in images_to_process:
        img_path = os.path.join(assets_dir, filename)
        if os.path.exists(img_path):
            # Threshold of 240 is perfect (very close to white)
            remove_all_white_pixels(img_path, threshold=240)
        else:
            print(f"File not found: {img_path}")

if __name__ == "__main__":
    main()

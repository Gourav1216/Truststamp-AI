import os
import random
from PIL import Image, ImageDraw

def generate_samples():
    os.makedirs("sample_data", exist_ok=True)
    
    # Let's create an image size 800x600
    # 1. Authentic Document
    img_auth = Image.new("RGB", (800, 600), "#F8FAFC")
    draw = ImageDraw.Draw(img_auth)
    
    # Double Border
    draw.rectangle([20, 20, 780, 580], outline="#06B6D4", width=3)
    draw.rectangle([25, 25, 775, 575], outline="#1E293B", width=1)
    
    # Draw texts
    draw.text((250, 60), "GLOBAL TRUST UNIVERSITY", fill="#0F172A")
    draw.text((200, 120), "CERTIFICATE OF ACADEMIC EXCELLENCE", fill="#475569")
    draw.text((220, 200), "This certificate is proudly presented to", fill="#64748B")
    draw.text((310, 240), "Gourav Choubey", fill="#0F172A")
    draw.text((120, 300), "For outstanding performance in Artificial Intelligence & Cryptography.", fill="#475569")
    draw.text((250, 360), "Verification ID: GTU-99281-A", fill="#334155")
    draw.text((250, 400), "Issue Date: June 15, 2026", fill="#334155")
    
    # Draw simulated QR code frame
    draw.rectangle([620, 440, 740, 560], fill="#FFFFFF", outline="#000000", width=2)
    # Corner square alignment markers
    draw.rectangle([630, 450, 660, 480], fill="#000000")
    draw.rectangle([635, 455, 655, 475], fill="#FFFFFF")
    draw.rectangle([638, 458, 652, 472], fill="#000000")
    
    draw.rectangle([700, 450, 730, 480], fill="#000000")
    draw.rectangle([705, 455, 725, 475], fill="#FFFFFF")
    draw.rectangle([708, 458, 722, 472], fill="#000000")
    
    draw.rectangle([630, 520, 660, 550], fill="#000000")
    draw.rectangle([635, 525, 655, 545], fill="#FFFFFF")
    draw.rectangle([638, 528, 652, 542], fill="#000000")
    
    # Fill standard random pixels to look like QR content data
    random.seed(42)
    for x in range(670, 700, 5):
        for y in range(450, 550, 5):
            if random.choice([True, False]):
                draw.rectangle([x, y, x+3, y+3], fill="#000000")
    for x in range(630, 730, 5):
        for y in range(490, 510, 5):
            if random.choice([True, False]):
                draw.rectangle([x, y, x+3, y+3], fill="#000000")
                
    img_auth.save("sample_data/doc_authentic.png")
    
    # 2. Tampered Document (Modified date text "June 28" shifted upward by 3px)
    img_tamp = img_auth.copy()
    draw_tamp = ImageDraw.Draw(img_tamp)
    # Paint white background over the original date
    draw_tamp.rectangle([250, 400, 500, 420], fill="#F8FAFC")
    # Draw new modified date text with a 3px vertical shift (y=397 instead of 400)
    draw_tamp.text((250, 397), "Issue Date: June 28, 2026", fill="#334155")
    img_tamp.save("sample_data/doc_tampered.png")
    
    # 3. QR Mismatch Document (Verification ID does not match QR ID)
    img_mis = img_auth.copy()
    draw_mis = ImageDraw.Draw(img_mis)
    # Paint white background over the original ID
    draw_mis.rectangle([250, 360, 500, 380], fill="#F8FAFC")
    # Draw mismatching ID
    draw_mis.text((250, 360), "Verification ID: GTU-88772-B", fill="#334155")
    img_mis.save("sample_data/qr_mismatch.png")
    
    print("Verification templates generated in 'sample_data/' successfully!")

if __name__ == "__main__":
    generate_samples()

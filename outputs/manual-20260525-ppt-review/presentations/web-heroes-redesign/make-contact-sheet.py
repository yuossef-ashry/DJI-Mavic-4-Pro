from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

out_dir = Path(r"C:\Users\USER\Desktop\Code7aga\outputs\manual-20260525-ppt-review\presentations\web-heroes-redesign\custom-inspect")
slides_dir = out_dir / "source-slides"
slide_paths = sorted(slides_dir.glob("slide-*.png"))
thumb_w, thumb_h = 320, 180
label_h, gap = 26, 18
cols = min(4, max(1, int(len(slide_paths) ** 0.5 + 0.999)))
rows = (len(slide_paths) + cols - 1) // cols
sheet_w = cols * thumb_w + (cols + 1) * gap
sheet_h = rows * (thumb_h + label_h) + (rows + 1) * gap
sheet = Image.new("RGB", (sheet_w, sheet_h), "#f3f4f6")
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("arial.ttf", 14)
except Exception:
    font = ImageFont.load_default()
for i, slide_path in enumerate(slide_paths):
    row, col = divmod(i, cols)
    x = gap + col * (thumb_w + gap)
    y = gap + row * (thumb_h + label_h + gap)
    img = Image.open(slide_path).convert("RGB")
    img.thumbnail((thumb_w, thumb_h), Image.LANCZOS)
    px = x + (thumb_w - img.width) // 2
    py = y + (thumb_h - img.height) // 2
    sheet.paste(img, (px, py))
    draw.rectangle([x, y + thumb_h, x + thumb_w, y + thumb_h + label_h], fill="#ffffff")
    draw.text((x + 8, y + thumb_h + 6), f"Slide {i + 1}", fill="#222222", font=font)
contact = out_dir / "contact-sheet.png"
sheet.save(contact)
print(contact)

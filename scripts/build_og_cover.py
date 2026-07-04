from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (14, 22, 32)
ACCENT = (34, 211, 238)
TEXT = (244, 246, 249)
MUTED = (154, 167, 181)
GRID = (40, 52, 74)

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

for y in range(125, H, 125):
    draw.line([(0, y), (W, y)], fill=GRID, width=1)
for x in range(240, W, 240):
    draw.line([(x, 0), (x, H)], fill=GRID, width=1)

font_bold = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 64)
font_reg = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 30)
font_sm = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 22)

draw.ellipse((96, 96, 160, 160), outline=ACCENT, width=4)
draw.text((96, 300), "Видеоаналитика", font=font_bold, fill=TEXT)
draw.text((96, 380), "для соблюдения ", font=font_bold, fill=TEXT)
w1 = draw.textlength("для соблюдения ", font=font_bold)
draw.text((96 + w1, 380), "СанПиН", font=font_bold, fill=ACCENT)
draw.text((96, 450), "комбинат питания · рестораны · производство", font=font_reg, fill=MUTED)

draw.rounded_rectangle((96, 530, 420, 578), radius=24, outline=ACCENT, width=2, fill=(20, 38, 48))
draw.text((170, 542), "Обсудить внедрение →", font=font_sm, fill=ACCENT)

out = Path(__file__).resolve().parents[1] / "assets" / "img" / "og-cover.png"
img.save(out, optimize=True)
print(out, out.stat().st_size)

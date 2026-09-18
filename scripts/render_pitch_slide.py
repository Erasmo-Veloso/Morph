"""Render the single-slide Morph pitch fallback as a 16:9 PNG."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "pitch-slide.png"
W, H = 1920, 1080
NAVY = "#101B3A"
BLUE = "#287BEA"
MUTED = "#66748A"
LINE = "#DCE6F2"
SURFACE = "#F4F7FB"


def font(size: int, bold: bool = False):
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)


canvas = Image.new("RGB", (W, H), "#FFFFFF")
draw = ImageDraw.Draw(canvas)

# Brand lockup, preserving its original proportions.
lockup = Image.open(ROOT / "web" / "public" / "brand" / "logo-lockup.png").convert("RGB")
lockup.thumbnail((145, 145), Image.Resampling.LANCZOS)
canvas.paste(lockup, (105, 60))
draw.text((W - 115, 96), "HACKTUDO 2026", font=font(22, True), fill=MUTED, anchor="ra")

draw.text((105, 253), "A aula programa", font=font(89, True), fill=NAVY)
draw.text((105, 355), "o smartphone.", font=font(89, True), fill=NAVY)
draw.rounded_rectangle((108, 477, 370, 485), radius=4, fill=BLUE)

draw.text((105, 497), "As aplicações mudam porque a tarefa da aula mudou.", font=font(34), fill=MUTED)

cards = [
    ("01", "COMPREENDER", "Material da aula", "Navegador limitado"),
    ("02", "MEDIR", "Calculadora + Notas", "Ferramentas da experiência"),
    ("03", "ANALISAR", "Navegador", "Agora permitido"),
    ("04", "REFLECTIR", "Conclusão", "Resposta final"),
]

x0, gap, cw, top, bottom = 105, 22, 410, 625, 928
for idx, (number, phase, tool, detail) in enumerate(cards):
    x = x0 + idx * (cw + gap)
    draw.rounded_rectangle((x, top, x + cw, bottom), radius=28, fill=SURFACE, outline=LINE, width=2)
    draw.rounded_rectangle((x + 28, top + 25, x + 88, top + 85), radius=17, fill=BLUE if idx == 2 else "#E5EEFA")
    draw.text((x + 58, top + 55), number, font=font(25, True), fill="#FFFFFF" if idx == 2 else BLUE, anchor="mm")
    draw.text((x + 28, top + 119), phase, font=font(27, True), fill=BLUE if idx == 2 else NAVY)
    draw.text((x + 28, top + 171), tool, font=font(32, True), fill=NAVY)
    draw.text((x + 28, top + 225), detail, font=font(24), fill=MUTED)
    if idx < 3:
        arrow_x = x + cw + 11
        draw.line((arrow_x - 6, top + 151, arrow_x + 6, top + 151), fill=BLUE, width=5)
        draw.polygon([(arrow_x + 8, top + 151), (arrow_x, top + 144), (arrow_x, top + 158)], fill=BLUE)

draw.text((105, 1009), "O mesmo telemóvel. Ferramentas certas em cada fase.", font=font(25, True), fill=NAVY)

OUT.parent.mkdir(parents=True, exist_ok=True)
canvas.save(OUT, optimize=True)
print(OUT)

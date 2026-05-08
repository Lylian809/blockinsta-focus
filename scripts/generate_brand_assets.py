from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "icons"
STORE_DIR = ROOT / "store_assets"

VIOLET = "#5B35F2"
VIOLET_DARK = "#30157D"
LILAC = "#EEE7FF"
LILAC_SOFT = "#F7F3FF"
LIME = "#C8F36A"
LIME_SOFT = "#E8F8BF"
INK = "#17131F"
MUTED = "#5F5A69"
WHITE = "#FFFFFF"
LINE = "#E9E2FF"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                Path("C:/Windows/Fonts/arialbd.ttf"),
                Path("C:/Windows/Fonts/seguiemj.ttf"),
                Path("C:/Windows/Fonts/segoeuib.ttf"),
            ]
        )
    candidates.extend(
        [
            Path("C:/Windows/Fonts/segoeui.ttf"),
            Path("C:/Windows/Fonts/arial.ttf"),
        ]
    )

    for candidate in candidates:
        if candidate.exists():
            try:
                return ImageFont.truetype(str(candidate), size=size)
            except OSError:
                continue

    return ImageFont.load_default()


FONT_H1 = load_font(82, bold=True)
FONT_H2 = load_font(44, bold=True)
FONT_H3 = load_font(28, bold=True)
FONT_BODY = load_font(28, bold=False)
FONT_SMALL = load_font(20, bold=False)
FONT_TINY = load_font(16, bold=False)


def rounded_box(draw: ImageDraw.ImageDraw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_logo(image: Image.Image, padding: int = 0) -> None:
    draw = ImageDraw.Draw(image)
    size = min(image.size) - padding * 2
    x0 = (image.width - size) // 2
    y0 = (image.height - size) // 2
    x1 = x0 + size
    y1 = y0 + size

    rounded_box(draw, (x0, y0, x1, y1), max(18, size // 5), fill=VIOLET)

    inner = int(size * 0.18)
    rounded_box(
        draw,
        (x0 + inner, y0 + inner, x1 - inner, y1 - inner),
        max(14, size // 8),
        fill=LILAC_SOFT,
    )

    stem_w = max(14, size // 7)
    bar_h = max(16, size // 7)
    left = x0 + int(size * 0.29)
    top = y0 + int(size * 0.24)
    bottom = y1 - int(size * 0.24)

    rounded_box(draw, (left, top, left + stem_w, bottom), stem_w // 2, fill=VIOLET)
    rounded_box(
        draw,
        (left, top, x1 - int(size * 0.22), top + bar_h),
        bar_h // 2,
        fill=VIOLET,
    )
    rounded_box(
        draw,
        (
            left,
            y0 + int(size * 0.47),
            x1 - int(size * 0.30),
            y0 + int(size * 0.47) + bar_h,
        ),
        bar_h // 2,
        fill=VIOLET,
    )

    dot_r = max(8, size // 12)
    dot_center = (x1 - int(size * 0.21), y0 + int(size * 0.24) + bar_h // 2)
    draw.ellipse(
        (
            dot_center[0] - dot_r,
            dot_center[1] - dot_r,
            dot_center[0] + dot_r,
            dot_center[1] + dot_r,
        ),
        fill=LIME,
    )


def make_icon(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_logo(image, padding=max(0, size // 16))
    return image


def save_icons() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 48, 128):
        make_icon(size).save(ICONS_DIR / f"icon{size}.png")


def text_block(draw, xy, text: str, font, fill, max_width: int, line_gap: int = 10) -> int:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)

    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += draw.textbbox((0, 0), line, font=font)[3] + line_gap
    return y


def panel_background(size=(1280, 800), left="#F1E2FF", right="#F3F0FF") -> Image.Image:
    image = Image.new("RGBA", size, right)
    draw = ImageDraw.Draw(image)
    rounded_box(draw, (24, 24, size[0] - 24, size[1] - 24), 28, fill=left)

    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((800, 90, 1230, 520), fill=(200, 243, 106, 60))
    glow_draw.ellipse((50, 500, 360, 780), fill=(91, 53, 242, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    return Image.alpha_composite(image, glow)


def draw_popup_mockup(base: Image.Image, x: int, y: int, width: int = 360, height: int = 560) -> None:
    draw = ImageDraw.Draw(base)
    rounded_box(draw, (x, y, x + width, y + height), 30, fill=WHITE, outline=LINE, width=2)
    rounded_box(draw, (x + 24, y + 24, x + 124, y + 54), 15, fill=LILAC, outline=None)
    draw.text((x + 40, y + 31), "Fokus", font=FONT_SMALL, fill=VIOLET_DARK)
    draw.text((x + 24, y + 84), "Reste concentré.", font=FONT_H3, fill=INK)
    draw.text((x + 24, y + 126), "Coupe le bruit, garde l'utile.", font=FONT_SMALL, fill=MUTED)

    rounded_box(draw, (x + 24, y + 176, x + width - 24, y + 332), 22, fill=LILAC_SOFT, outline=LINE, width=2)
    draw.text((x + 44, y + 196), "25:00", font=FONT_H1, fill=INK)
    draw.text((x + 44, y + 286), "Mode Focus actif", font=FONT_SMALL, fill=VIOLET_DARK)

    chips = [("Instagram", "#F7E3EE"), ("YouTube", "#FFE7E7"), ("TikTok", "#ECFCFF")]
    top = y + 360
    for index, (label, fill) in enumerate(chips):
        item_y = top + index * 58
        rounded_box(draw, (x + 24, item_y, x + width - 24, item_y + 46), 16, fill=fill, outline=None)
        draw.text((x + 40, item_y + 12), label, font=FONT_SMALL, fill=INK)
        rounded_box(draw, (x + width - 112, item_y + 9, x + width - 44, item_y + 37), 14, fill=WHITE)
        draw.text((x + width - 91, item_y + 12), "on", font=FONT_SMALL, fill=VIOLET)


def create_store_slide_01() -> Image.Image:
    image = panel_background(left="#EEDCFF", right="#F6F1FF")
    draw = ImageDraw.Draw(image)
    draw_popup_mockup(image, 80, 120, width=350, height=520)
    draw.text((590, 160), "Coupe le bruit.", font=FONT_H1, fill=INK)
    draw.text((590, 250), "Garde l'utile.", font=FONT_H1, fill=INK)
    text_block(
        draw,
        (590, 380),
        "Bloque Instagram, YouTube et TikTok sans couper ce qui reste vraiment utile dans ta journée.",
        FONT_BODY,
        MUTED,
        520,
    )
    return image


def create_store_slide_02() -> Image.Image:
    image = panel_background(left="#E4F7B9", right="#F4F9E6")
    draw = ImageDraw.Draw(image)
    draw.text((86, 138), "Passe en mode", font=FONT_H1, fill=INK)
    draw.text((86, 228), "Focus.", font=FONT_H1, fill=INK)
    text_block(
        draw,
        (86, 360),
        "Lance un Pomodoro, garde YouTube en mode recherche, coupe Instagram et TikTok, puis suis ton rythme sans te disperser.",
        FONT_BODY,
        "#374151",
        460,
    )
    rounded_box(draw, (760, 96, 1178, 690), 34, fill=WHITE, outline="#DDE7C1", width=2)
    rounded_box(draw, (792, 146, 1146, 294), 24, fill=LILAC_SOFT)
    draw.text((830, 176), "50:00", font=FONT_H1, fill=INK)
    draw.text((830, 264), "Session monstre", font=FONT_SMALL, fill=VIOLET_DARK)
    rounded_box(draw, (792, 330, 1146, 392), 18, fill="#FFF3F3")
    draw.text((822, 350), "YouTube · recherche only", font=FONT_SMALL, fill=INK)
    rounded_box(draw, (792, 412, 1146, 474), 18, fill="#EEF7FF")
    draw.text((822, 432), "Instagram · bloqué", font=FONT_SMALL, fill=INK)
    rounded_box(draw, (792, 494, 1146, 556), 18, fill="#F8F3FF")
    draw.text((822, 514), "TikTok · bloqué", font=FONT_SMALL, fill=INK)
    rounded_box(draw, (792, 592, 1146, 646), 22, fill=VIOLET)
    draw.text((888, 606), "Démarrer", font=FONT_SMALL, fill=WHITE)
    return image


def create_store_slide_03() -> Image.Image:
    image = panel_background(left="#F5F3FF", right="#FBFAFF")
    draw = ImageDraw.Draw(image)
    rounded_box(draw, (74, 92, 540, 696), 34, fill=WHITE, outline=LINE, width=2)
    draw.text((114, 140), "Stats Fokus", font=FONT_H2, fill=INK)
    stat_boxes = [
        ("Semaine", "8"),
        ("Total", "42"),
        ("Temps", "21h30"),
        ("Aujourd'hui", "2"),
    ]
    for idx, (label, value) in enumerate(stat_boxes):
        row = idx // 2
        col = idx % 2
        x = 114 + col * 180
        y = 234 + row * 136
        rounded_box(draw, (x, y, x + 150, y + 108), 22, fill=LILAC_SOFT)
        draw.text((x + 18, y + 18), label, font=FONT_SMALL, fill=MUTED)
        draw.text((x + 18, y + 48), value, font=FONT_H2, fill=INK)

    draw.text((640, 150), "Reprends le", font=FONT_H1, fill=INK)
    draw.text((640, 240), "contrôle.", font=FONT_H1, fill=INK)
    text_block(
        draw,
        (640, 370),
        "Des blocs plus calmes, des stats lisibles et un outil qui t'aide vraiment à rester aligné sur ce que tu veux faire.",
        FONT_BODY,
        MUTED,
        500,
    )
    rounded_box(draw, (640, 560, 1120, 650), 26, fill=VIOLET)
    draw.text((714, 585), "Instagram · YouTube · TikTok", font=FONT_H3, fill=WHITE)
    return image


def save_store_assets(images: Iterable[tuple[str, Image.Image]]) -> None:
    STORE_DIR.mkdir(parents=True, exist_ok=True)
    for name, image in images:
      image.convert("RGB").save(STORE_DIR / name, quality=95)


def main() -> None:
    save_icons()
    save_store_assets(
        [
            ("store-slide-01.png", create_store_slide_01()),
            ("store-slide-02.png", create_store_slide_02()),
            ("store-slide-03.png", create_store_slide_03()),
        ]
    )


if __name__ == "__main__":
    main()

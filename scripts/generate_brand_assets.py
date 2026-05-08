from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "icons"
STORE_DIR = ROOT / "store_assets"
SCREENSHOTS_DIR = STORE_DIR / "source_screenshots"

VIOLET = "#5B35F2"
VIOLET_DARK = "#2E176F"
LILAC_SOFT = "#F8F5FF"
PEACH_SOFT = "#FFF1DE"
SKY_SOFT = "#EDF3FF"
INK = "#17131F"
TEXT_MUTED = "#635C73"
WHITE = "#FFFFFF"
LINE = "#E8E1FB"
SHADOW = (62, 45, 119, 40)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                Path("C:/Windows/Fonts/segoeuib.ttf"),
                Path("C:/Windows/Fonts/seguisb.ttf"),
                Path("C:/Windows/Fonts/arialbd.ttf"),
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


FONT_HERO = load_font(66, bold=True)
FONT_H1 = load_font(58, bold=True)
FONT_H2 = load_font(42, bold=True)
FONT_H3 = load_font(28, bold=True)
FONT_BODY = load_font(28, bold=False)
FONT_SMALL = load_font(22, bold=False)
FONT_TINY = load_font(18, bold=False)
FONT_CAPTION = load_font(16, bold=False)
FONT_LABEL = load_font(16, bold=True)
FONT_SLIDE_HEADLINE = load_font(46, bold=True)
FONT_SLIDE_BODY = load_font(24, bold=False)


def rounded_box(draw: ImageDraw.ImageDraw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def linear_gradient(size: tuple[int, int], left_color: str, right_color: str) -> Image.Image:
    image = Image.new("RGBA", size)
    left = Image.new("RGBA", size, left_color)
    right = Image.new("RGBA", size, right_color)
    mask = Image.linear_gradient("L").resize(size)
    return Image.composite(right, left, mask)


def make_blur_glow(size: tuple[int, int], ellipses: Iterable[tuple[tuple[int, int, int, int], tuple[int, int, int, int]]]) -> Image.Image:
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    for rect, color in ellipses:
        draw.ellipse(rect, fill=color)
    return glow.filter(ImageFilter.GaussianBlur(42))


def build_surface(size=(1280, 800), left=PEACH_SOFT, right=LILAC_SOFT) -> Image.Image:
    image = linear_gradient(size, left, right)
    image = Image.alpha_composite(
        image,
        make_blur_glow(
            size,
            [
                ((-80, -50, 420, 620), (255, 207, 128, 85)),
                ((820, 120, 1320, 690), (107, 78, 255, 54)),
                ((720, 500, 1200, 900), (122, 177, 255, 30)),
            ],
        ),
    )
    return image


def draw_logo(image: Image.Image, padding: int = 0) -> None:
    draw = ImageDraw.Draw(image)
    size = min(image.size) - padding * 2
    x0 = (image.width - size) // 2
    y0 = (image.height - size) // 2
    x1 = x0 + size
    y1 = y0 + size

    shell = linear_gradient((size, size), "#8D76FF", VIOLET)
    shell_mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(shell_mask).rounded_rectangle((0, 0, size, size), radius=max(20, size // 3), fill=255)
    shell.putalpha(shell_mask)
    image.alpha_composite(shell, dest=(x0, y0))

    pill_margin_x = int(size * 0.16)
    pill_height = int(size * 0.42)
    pill_y = y0 + (size - pill_height) // 2
    pill_rect = (
        x0 + pill_margin_x,
        pill_y,
        x1 - pill_margin_x,
        pill_y + pill_height,
    )
    rounded_box(draw, pill_rect, pill_height // 2, fill="#D7CAFF")

    knob_size = int(pill_height * 0.74)
    knob_x = pill_rect[2] - knob_size - int(size * 0.07)
    knob_y = pill_y + (pill_height - knob_size) // 2
    knob = linear_gradient((knob_size, knob_size), "#6E50FF", VIOLET_DARK)
    knob_mask = Image.new("L", (knob_size, knob_size), 0)
    ImageDraw.Draw(knob_mask).ellipse((0, 0, knob_size, knob_size), fill=255)
    knob.putalpha(knob_mask)
    image.alpha_composite(knob, dest=(knob_x, knob_y))

    glare = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glare_draw = ImageDraw.Draw(glare)
    glare_draw.ellipse(
        (
            knob_x + knob_size * 0.18,
            knob_y + knob_size * 0.14,
            knob_x + knob_size * 0.52,
            knob_y + knob_size * 0.38,
        ),
        fill=(255, 255, 255, 35),
    )
    glare = glare.filter(ImageFilter.GaussianBlur(4))
    image.alpha_composite(glare)


def make_icon(size: int) -> Image.Image:
    supersample = 4
    hi_res_size = size * supersample
    image = Image.new("RGBA", (hi_res_size, hi_res_size), (0, 0, 0, 0))
    draw_logo(image, padding=max(0, hi_res_size // 14))
    return image.resize((size, size), Image.Resampling.LANCZOS)


def save_icons() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    for size in (16, 32, 48, 128):
        make_icon(size).save(ICONS_DIR / f"icon{size}.png")


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
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

    return lines


def text_block(draw, xy, text: str, font, fill, max_width: int, line_gap: int = 8) -> int:
    x, y = xy
    for line in wrap_text(draw, text, font, max_width):
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def draw_wrapped_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font, fill, max_width: int, line_gap: int = 10) -> int:
    return text_block(draw, xy, text, font, fill, max_width, line_gap=line_gap)


def draw_centered_text(draw: ImageDraw.ImageDraw, rect: tuple[int, int, int, int], text: str, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = rect[0] + ((rect[2] - rect[0]) - text_w) // 2
    y = rect[1] + ((rect[3] - rect[1]) - text_h) // 2 - 2
    draw.text((x, y), text, font=font, fill=fill)


def draw_centered_paragraph(draw: ImageDraw.ImageDraw, rect: tuple[int, int, int, int], text: str, font, fill, line_gap: int = 6):
    lines = wrap_text(draw, text, font, rect[2] - rect[0] - 24)
    line_boxes = [draw.textbbox((0, 0), line, font=font) for line in lines]
    total_height = sum((bbox[3] - bbox[1]) for bbox in line_boxes) + max(0, len(lines) - 1) * line_gap
    y = rect[1] + ((rect[3] - rect[1]) - total_height) // 2 - 2

    for line, bbox in zip(lines, line_boxes):
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = rect[0] + ((rect[2] - rect[0]) - text_w) // 2
        draw.text((x, y), line, font=font, fill=fill)
        y += text_h + line_gap


def add_shadow_panel(base: Image.Image, rect: tuple[int, int, int, int], radius: int = 36, fill=WHITE, outline=LINE):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(rect, radius=radius, fill=SHADOW)
    shadow = shadow.filter(ImageFilter.GaussianBlur(26))
    base.alpha_composite(shadow)

    draw = ImageDraw.Draw(base)
    rounded_box(draw, rect, radius=radius, fill=fill, outline=outline, width=2)


def make_rounded_image(image: Image.Image, size: tuple[int, int], radius: int = 26) -> Image.Image:
    fitted = ImageOps.fit(image.convert("RGBA"), size, method=Image.Resampling.LANCZOS)
    mask = Image.new("L", size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    fitted.putalpha(mask)
    return fitted


def open_screenshot(name: str) -> Image.Image:
    return Image.open(SCREENSHOTS_DIR / name).convert("RGBA")


def paste_card_image(base: Image.Image, image: Image.Image, rect: tuple[int, int, int, int], radius: int = 28):
    x0, y0, x1, y1 = rect
    add_shadow_panel(base, rect, radius=radius, fill=WHITE, outline=LINE)
    padded = 14
    rounded = make_rounded_image(image, (x1 - x0 - padded * 2, y1 - y0 - padded * 2), radius=max(18, radius - 8))
    base.alpha_composite(rounded, dest=(x0 + padded, y0 + padded))


def paste_contained_image(base: Image.Image, image: Image.Image, rect: tuple[int, int, int, int], radius: int = 28, canvas_fill=WHITE):
    x0, y0, x1, y1 = rect
    add_shadow_panel(base, rect, radius=radius, fill=canvas_fill, outline=LINE)
    padded = 18
    inner_size = (x1 - x0 - padded * 2, y1 - y0 - padded * 2)
    contained = ImageOps.contain(image.convert("RGBA"), inner_size, method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", inner_size, canvas_fill)
    offset = ((inner_size[0] - contained.width) // 2, (inner_size[1] - contained.height) // 2)
    canvas.alpha_composite(contained, dest=offset)
    rounded = make_rounded_image(canvas, inner_size, radius=max(18, radius - 8))
    base.alpha_composite(rounded, dest=(x0 + padded, y0 + padded))


def draw_store_label(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str):
    x, y = xy
    rounded_box(draw, (x, y, x + 178, y + 38), 19, fill=WHITE, outline=LINE, width=1)
    draw_centered_text(draw, (x, y, x + 178, y + 38), text, FONT_LABEL, VIOLET_DARK)


def create_small_promo() -> Image.Image:
    image = linear_gradient((440, 280), "#7D67FF", "#4F30DE")
    image = Image.alpha_composite(
        image,
        make_blur_glow(
            image.size,
            [
                ((250, -50, 520, 190), (255, 255, 255, 54)),
                ((-80, 120, 220, 360), (220, 210, 255, 42)),
            ],
        ),
    )
    draw = ImageDraw.Draw(image)
    icon = make_icon(76)
    image.alpha_composite(icon, dest=(72, 76))
    draw.text((166, 86), "Fokus", font=FONT_H2, fill=WHITE)
    draw.text((82, 156), "Rester concentré avec Fokus.", font=FONT_SMALL, fill=WHITE)
    return image


def create_hero_banner() -> Image.Image:
    image = linear_gradient((1400, 560), "#8B74FF", "#4E31D8")
    image = Image.alpha_composite(
        image,
        make_blur_glow(
            image.size,
            [
                ((960, -80, 1500, 380), (255, 255, 255, 60)),
                ((-120, 280, 520, 760), (255, 210, 145, 40)),
            ],
        ),
    )
    draw = ImageDraw.Draw(image)
    icon = make_icon(108)
    image.alpha_composite(icon, dest=(112, 150))
    draw.text((238, 162), "Fokus", font=FONT_H1, fill=WHITE)
    draw.text((120, 252), "Rester concentré avec Fokus.", font=FONT_H2, fill=WHITE)
    text_block(
        draw,
        (120, 320),
        "Pomodoro, blocage des réseaux sociaux intelligent et interface optimisée pour la productivité.",
        FONT_SMALL,
        "#F4EEFF",
        730,
        line_gap=6,
    )
    return image


def create_store_slide_01() -> Image.Image:
    image = build_surface(left="#FFEED6", right="#F7F3FF")
    draw = ImageDraw.Draw(image)
    draw_store_label(draw, (84, 88), "Session simple")
    draw_wrapped_text(
        draw,
        (84, 146),
        "Démarre vite et reste concentré longtemps.",
        FONT_SLIDE_HEADLINE,
        INK,
        470,
        line_gap=10,
    )
    text_block(
        draw,
        (84, 360),
        "Fokus te permet de lancer une session simplement, sans te perdre dans les réglages. Tu choisis ta durée, tu démarres, puis tu restes dans le flow.",
        FONT_SLIDE_BODY,
        TEXT_MUTED,
        400,
        line_gap=7,
    )
    pill_rect = (84, 606, 356, 666)
    rounded_box(draw, pill_rect, 30, fill=VIOLET)
    draw_centered_text(draw, pill_rect, "Bloc les notifications indésirables", FONT_CAPTION, WHITE)

    popup = open_screenshot("popup-focus.png")
    paste_contained_image(image, popup, (628, 88, 1190, 716), radius=40, canvas_fill=WHITE)
    return image


def create_store_slide_02() -> Image.Image:
    image = build_surface(left="#F4EFFF", right=SKY_SOFT)
    draw = ImageDraw.Draw(image)
    draw_store_label(draw, (84, 96), "Instagram utile")
    draw_wrapped_text(
        draw,
        (84, 150),
        "Supprime le bruit, mais garde les usages utiles.",
        FONT_SLIDE_HEADLINE,
        INK,
        430,
        line_gap=10,
    )
    text_block(
        draw,
        (84, 350),
        "Instagram même pour le travail peut rester utile pour envoyer des messages. Mais tu peux choisir de bloquer les storys, le feed, la page d'accueil et les reels.",
        FONT_SLIDE_BODY,
        TEXT_MUTED,
        410,
        line_gap=7,
    )
    pill_rect = (84, 606, 354, 666)
    rounded_box(draw, pill_rect, 30, fill=WHITE, outline=LINE, width=2)
    draw_centered_text(draw, pill_rect, "0 distraction que du focus", FONT_TINY, VIOLET_DARK)

    instagram = open_screenshot("instagram-mode.png")
    paste_card_image(image, instagram, (542, 94, 1192, 708), radius=38)
    return image


def create_store_slide_03() -> Image.Image:
    image = build_surface(left=PEACH_SOFT, right="#F3EEFF")
    draw = ImageDraw.Draw(image)
    draw_store_label(draw, (84, 92), "Toujours visible")
    draw_wrapped_text(
        draw,
        (84, 146),
        "Ton focus reste visible et te suit.",
        FONT_SLIDE_HEADLINE,
        INK,
        430,
        line_gap=10,
    )
    text_block(
        draw,
        (84, 350),
        "Le timer reste avec toi sur ton onglet pour t'accompagner. Tu peux y voir ton temps de concentration et ton chrono.",
        FONT_SLIDE_BODY,
        TEXT_MUTED,
        410,
        line_gap=7,
    )
    pill_rect = (84, 598, 442, 674)
    rounded_box(draw, pill_rect, 30, fill=VIOLET)
    draw_centered_paragraph(draw, pill_rect, "pas de pub, pas de distraction que du focus pur", FONT_CAPTION, WHITE)

    widget = open_screenshot("focus-widget.png")
    paste_card_image(image, widget, (534, 120, 1186, 520), radius=34)
    return image


def save_store_assets(images: Iterable[tuple[str, Image.Image]]) -> None:
    STORE_DIR.mkdir(parents=True, exist_ok=True)
    for name, image in images:
        image.convert("RGB").save(STORE_DIR / name, quality=95)


def main() -> None:
    save_icons()
    save_store_assets(
        [
            ("store-small-promo.png", create_small_promo()),
            ("store-hero-banner.png", create_hero_banner()),
            ("store-slide-01.png", create_store_slide_01()),
            ("store-slide-02.png", create_store_slide_02()),
            ("store-slide-03.png", create_store_slide_03()),
        ]
    )


if __name__ == "__main__":
    main()

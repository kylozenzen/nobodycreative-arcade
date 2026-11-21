#!/usr/bin/env python3
"""Draw the Nobody Arcade pixel coin and write every icon the site uses.

Run from the repo root:  python3 scripts/make-coin-icons.py
Needs Pillow (pip install pillow). Writes:
  assets/favicon.svg, assets/favicon.ico, assets/icons/coin.svg
  assets/icons/icon-192.png, icon-512.png, icon-maskable-512.png,
  assets/icons/apple-touch-icon.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
GOLD = "#ffd23f"
GOLD_DARK = "#d9a21b"
GOLD_LIGHT = "#fff1a8"
INK = "#14102a"
BG = "#0b0718"

# 5x7 pixel N
N = [
    "X...X",
    "X...X",
    "XX..X",
    "X.X.X",
    "X..XX",
    "X...X",
    "X...X",
]
# geometry on a 64-unit canvas
C, R_OUT, STROKE, R_RING, PX = 32, 29, 3, 23, 5
NX, NY = C - 2.5 * PX, C - 3.5 * PX


def n_cells():
    for row, line in enumerate(N):
        for col, ch in enumerate(line):
            if ch == "X":
                yield NX + col * PX, NY + row * PX


def svg(size_attr=""):
    rects = "".join(
        f'<rect x="{x:g}" y="{y:g}" width="{PX}" height="{PX}"/>' for x, y in n_cells()
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"{size_attr} shape-rendering="crispEdges">'
        f'<circle cx="{C}" cy="{C}" r="{R_OUT}" fill="{GOLD}" stroke="{INK}" stroke-width="{STROKE}" shape-rendering="geometricPrecision"/>'
        f'<circle cx="{C}" cy="{C}" r="{R_RING}" fill="none" stroke="{GOLD_DARK}" stroke-width="3" shape-rendering="geometricPrecision"/>'
        f'<path d="M14 24 A19 19 0 0 1 24 13" fill="none" stroke="{GOLD_LIGHT}" stroke-width="3" stroke-linecap="round" shape-rendering="geometricPrecision"/>'
        f'<g fill="{INK}">{rects}</g>'
        "</svg>\n"
    )


def coin_png(size, scale=1.0, background=None):
    """Draw at 8x and downsample for clean edges."""
    big = size * 8
    img = Image.new("RGBA", (big, big), background or (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = big / 64 * scale
    off = big / 2 - 32 * u

    def p(v):
        return off + v * u

    d.ellipse([p(C - R_OUT - STROKE / 2), p(C - R_OUT - STROKE / 2), p(C + R_OUT + STROKE / 2), p(C + R_OUT + STROKE / 2)], fill=INK)
    d.ellipse([p(C - R_OUT + STROKE / 2), p(C - R_OUT + STROKE / 2), p(C + R_OUT - STROKE / 2), p(C + R_OUT - STROKE / 2)], fill=GOLD)
    d.ellipse([p(C - R_RING - 1.5), p(C - R_RING - 1.5), p(C + R_RING + 1.5), p(C + R_RING + 1.5)], outline=GOLD_DARK, width=max(1, round(3 * u)))
    d.arc([p(C - 19), p(C - 19), p(C + 19), p(C + 19)], start=192, end=240, fill=GOLD_LIGHT, width=max(1, round(3 * u)))
    for x, y in n_cells():
        d.rectangle([p(x), p(y), p(x + PX) - 1, p(y + PX) - 1], fill=INK)
    return img.resize((size, size), Image.LANCZOS)


def main():
    icons = ROOT / "assets" / "icons"
    (ROOT / "assets" / "favicon.svg").write_text(svg())
    (icons / "coin.svg").write_text(svg())
    coin_png(192).save(icons / "icon-192.png")
    coin_png(512).save(icons / "icon-512.png")
    coin_png(512, scale=0.72, background=BG).save(icons / "icon-maskable-512.png")
    coin_png(180, scale=0.84, background=BG).convert("RGB").save(icons / "apple-touch-icon.png")
    coin_png(64).save(ROOT / "assets" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Coin icons written.")


if __name__ == "__main__":
    main()

from PIL import Image, ImageDraw
import math

def draw_tomato(size, bg=None, padding_ratio=0.0):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if bg:
        d.rectangle([0, 0, size, size], fill=bg)

    pad = size * padding_ratio
    cx, cy = size / 2, size / 2 + size * 0.04
    r = (size - 2 * pad) * 0.36

    # tomato body
    body_color = (229, 83, 60, 255)
    d.ellipse([cx - r, cy - r * 0.96, cx + r, cy + r * 1.04], fill=body_color)

    # subtle highlight
    hl_r = r * 0.28
    hl_cx, hl_cy = cx - r * 0.35, cy - r * 0.35
    d.ellipse([hl_cx - hl_r, hl_cy - hl_r, hl_cx + hl_r, hl_cy + hl_r], fill=(255, 255, 255, 60))

    # leaf/stem (simple 5-point star-ish leaf cluster in green)
    leaf_color = (60, 166, 110, 255)
    leaf_r = r * 0.5
    leaf_cy = cy - r * 0.92
    points_count = 5
    for i in range(points_count):
        angle = -90 + i * (360 / points_count)
        lx = cx + leaf_r * 0.9 * math.cos(math.radians(angle))
        ly = leaf_cy + leaf_r * 0.9 * math.sin(math.radians(angle)) * 0.6
        leaf_w = leaf_r * 0.55
        d.ellipse([lx - leaf_w / 2, ly - leaf_w / 2, lx + leaf_w / 2, ly + leaf_w / 2], fill=leaf_color)
    d.ellipse([cx - leaf_r * 0.5, leaf_cy - leaf_r * 0.4, cx + leaf_r * 0.5, leaf_cy + leaf_r * 0.4], fill=leaf_color)

    return img

# Standard 'any' icons — transparent background
draw_tomato(192).save("icon-192.png")
draw_tomato(512).save("icon-512.png")

# Maskable icons — need safe zone padding (~20%) and opaque background so OS masks don't clip content
bg = (27, 27, 31, 255)  # matches --bg from style.css
draw_tomato(192, bg=bg, padding_ratio=0.15).save("icon-192-maskable.png")
draw_tomato(512, bg=bg, padding_ratio=0.15).save("icon-512-maskable.png")

print("done")

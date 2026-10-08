#!/usr/bin/env python3
"""Turn pixel icons written as text grids into PNG files.

The source is a text file. Each icon is rows of characters, one character per
pixel, and each character names a colour in the file's palette. The text is the
artwork: to change a pixel, change a letter and run this again.

Source format:

    # a comment
    palette
    . none          # transparent
    k #210c0e
    end

    icon file16     # the name; the size is read from the rows
    ....kkkk....
    ...
    end

Usage:

    python scripts/pixel_icons.py namefile-icons/icons.txt --out img/namefile
    python scripts/pixel_icons.py namefile-icons/icons.txt --out img/namefile --scale 10

Writes <out>/<name>.png for each icon, and <out>/preview.png showing every icon
enlarged with its actual size beside it. Requires Pillow.
"""

import argparse
import sys
from pathlib import Path

from PIL import Image


def parse(path):
    palette, icons = {}, {}
    mode, name, rows = None, None, []
    for n, raw in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        if mode == "icon":
            # Rows are taken whole: "#" and spaces may not appear in a grid.
            line = raw.rstrip()
            if line == "end":
                icons[name] = rows
                mode, rows = None, []
            elif line:
                rows.append((n, line))
            continue
        line = raw.strip()
        if not line or line.startswith("#"):      # a comment is a whole line
            continue
        if mode == "palette":
            if line == "end":
                mode = None
                continue
            key, value = line.split()[:2]
            if len(key) != 1:
                sys.exit(f"{path}:{n}: a palette key is one character, got {key!r}")
            palette[key] = None if value == "none" else tuple(int(value[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
        elif line == "palette":
            mode = "palette"
        elif line.startswith("icon "):
            mode, name = "icon", line.split()[1]
        else:
            sys.exit(f"{path}:{n}: expected 'palette' or 'icon <name>', got {line!r}")
    if mode:
        sys.exit(f"{path}: the last block has no 'end'")
    return palette, icons


def render(name, rows, palette, path):
    width = len(rows[0][1])
    img = Image.new("RGBA", (width, len(rows)), (0, 0, 0, 0))
    for y, (n, line) in enumerate(rows):
        if len(line) != width:
            sys.exit(f"{path}:{n}: icon {name}: row is {len(line)} wide, the first row is {width}")
        for x, ch in enumerate(line):
            if ch not in palette:
                sys.exit(f"{path}:{n}: icon {name}: {ch!r} is not in the palette")
            if palette[ch]:
                img.putpixel((x, y), palette[ch])
    return img


def preview(images, scale, ground):
    gap = 12
    width = sum(i.width * scale + i.width + 3 * gap for i in images.values()) + gap
    height = max(i.height for i in images.values()) * scale + 2 * gap
    sheet = Image.new("RGBA", (width, height), ground)
    x = gap
    for img in images.values():
        sheet.alpha_composite(img.resize((img.width * scale, img.height * scale), Image.NEAREST), (x, gap))
        x += img.width * scale + gap
        sheet.alpha_composite(img, (x, gap))
        x += img.width + 2 * gap
    return sheet


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("source", help="text file of palette and icon grids")
    ap.add_argument("--out", required=True, help="directory to write PNGs into")
    ap.add_argument("--scale", type=int, default=8, help="enlargement in preview.png (default 8)")
    ap.add_argument("--ground", default="#c5c8db", help="preview background colour (default #c5c8db)")
    args = ap.parse_args()

    palette, icons = parse(args.source)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    images = {}
    for name, rows in icons.items():
        images[name] = render(name, rows, palette, args.source)
        images[name].save(out / f"{name}.png")
        print(f"{name}: {images[name].width}x{images[name].height}")
    g = args.ground
    preview(images, args.scale, tuple(int(g[i:i + 2], 16) for i in (1, 3, 5)) + (255,)).save(out / "preview.png")
    print(f"wrote {len(images)} icons and preview.png to {out}")


if __name__ == "__main__":
    main()

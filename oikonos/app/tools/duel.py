#!/usr/bin/env python3
"""
Blind side-by-side compositor.

Places our render and the master reference on one sheet at matched
height, labelled only "A" and "B", with the assignment decided by a
seed the critic does not see. The answer key is written next to the
image so the orchestrator can decode the verdict afterwards.

  python3 tools/duel.py home reference/phone2.png        -> duels/home.png + home.key
  python3 tools/duel.py home reference/phone2.png --seed 4
"""
import argparse, hashlib, json, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD = 54
GAP = 44
LABEL_H = 74
TARGET_H = 1500
BG = (238, 235, 228)


def load(p):
    im = Image.open(p).convert("RGB")
    s = TARGET_H / im.height
    return im.resize((max(1, round(im.width * s)), TARGET_H), Image.LANCZOS)


def label_font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("ours")
    ap.add_argument("theirs")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--out", default=os.path.join(ROOT, "duels"))
    a = ap.parse_args()

    os.makedirs(a.out, exist_ok=True)
    ours = load(a.ours)
    theirs = load(a.theirs)

    # Deterministic but unguessable-from-the-image side assignment.
    h = hashlib.sha256(f"{a.name}|{a.seed}".encode()).digest()[0]
    ours_left = bool(h & 1)
    left, right = (ours, theirs) if ours_left else (theirs, ours)

    W = PAD * 2 + left.width + GAP + right.width
    H = PAD * 2 + LABEL_H + TARGET_H
    sheet = Image.new("RGB", (W, H), BG)
    sheet.paste(left, (PAD, PAD + LABEL_H))
    sheet.paste(right, (PAD + left.width + GAP, PAD + LABEL_H))

    d = ImageDraw.Draw(sheet)
    f = label_font(44)
    for text, x0, w in (("A", PAD, left.width),
                        ("B", PAD + left.width + GAP, right.width)):
        bb = d.textbbox((0, 0), text, font=f)
        d.text((x0 + (w - (bb[2] - bb[0])) / 2, PAD + 8), text,
               font=f, fill=(40, 44, 52))

    img_path = os.path.join(a.out, f"{a.name}.png")
    sheet.save(img_path)

    # The answer key lives OUTSIDE the duel directory so a critic reading
    # only its assigned image cannot accidentally (or deliberately) peek.
    keydir = os.path.join(ROOT, ".duelkeys")
    os.makedirs(keydir, exist_ok=True)
    key = {"name": a.name, "seed": a.seed,
           "A": "ours" if ours_left else "reference",
           "B": "reference" if ours_left else "ours"}
    with open(os.path.join(keydir, f"{a.name}.key.json"), "w") as fh:
        json.dump(key, fh)

    print(img_path)
    print(json.dumps(key))


if __name__ == "__main__":
    main()

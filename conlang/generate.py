#!/usr/bin/env python3
"""Generate the Basin conlang: reference grammar, lexicon (Markdown + CSV),
and a single-file web page with the grammar, lexicon and a translator.

Deterministic: identical inputs in basin/data.py produce identical output.
"""

import pathlib
import sys

from basin.history import build
from basin.render import render_grammar, render_lexicon_csv, render_lexicon_md
from basin.site import render_site

OUT = pathlib.Path(__file__).parent / "output"


def main():
    h = build()
    grammar = render_grammar(h)
    files = {
        "grammar.md": grammar,
        "dospevne.html": render_site(h, grammar),
        "lexicon.md": render_lexicon_md(h),
        "lexicon.csv": render_lexicon_csv(h),
    }
    if "--check" in sys.argv:
        stale = [n for n, t in files.items()
                 if not (OUT / n).exists() or (OUT / n).read_text(encoding="utf-8") != t]
        print("stale: " + ", ".join(stale) if stale else "output/ is up to date")
        sys.exit(1 if stale else 0)
    OUT.mkdir(exist_ok=True)
    for name, text in files.items():
        (OUT / name).write_text(text, encoding="utf-8")
        print(f"wrote output/{name} ({len(text.splitlines())} lines)")


if __name__ == "__main__":
    main()

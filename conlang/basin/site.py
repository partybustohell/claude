"""Single-file web page: translator + searchable lexicon + reference grammar.

The grammar is the generated Markdown converted to HTML (small converter for
the subset render.py emits). The translator data is the export bundle.
"""

import html
import json
import math
import pathlib
import re

from . import changes as ch
from .data import SEED
from .export import build_export
from .phonology import roman

WEB = pathlib.Path(__file__).parent / "web"


# ------------------------------------------------------------------ Markdown

def gloss_html(g):
    out = []
    for piece in re.split(r"([=\-.])", g):
        if re.fullmatch(r"[0-9]*[A-Z][A-Z0-9]*", piece):
            out.append(f'<span class="sc">{piece.lower()}</span>')
        else:
            out.append(html.escape(piece))
    return "".join(out)


def interlinear(lines):
    rows = [re.split(r"\s{2,}", ln.strip()) for ln in lines]
    words = "".join(f'<span class="w"><span class="wf">{html.escape(f)}</span>'
                    f'<span class="wg">{gloss_html(g)}</span></span>'
                    for f, g in zip(rows[0], rows[1]))
    return f'<div class="igl">{words}</div>'


def inline(text, forms):
    text = html.escape(text, quote=False).replace("\\*", "\x00")
    keep = []

    def stash(s):
        keep.append(s)
        return f"\x01{len(keep) - 1}\x01"

    text = re.sub(r"`([^`]+)`", lambda m: stash(f"<code>{m.group(1)}</code>"), text)

    def bold(m):
        t = m.group(1)
        cls = ' class="form"' if t in forms else ""
        return stash(f"<strong{cls}>{t}</strong>")

    text = re.sub(r"\*\*([^*]+)\*\*", bold, text)
    text = re.sub(r"\*([^*\s][^*]*?)\*", r"<em>\1</em>", text)
    text = re.sub(r"\x01(\d+)\x01", lambda m: keep[int(m.group(1))], text)
    text = re.sub(r"\x01(\d+)\x01", lambda m: keep[int(m.group(1))], text)
    return text.replace("\x00", "*")


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def md_to_html(md, forms):
    lines = md.split("\n")
    out, toc, i = [], [], 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            block = []
            i += 1
            while not lines[i].startswith("```"):
                block.append(lines[i])
                i += 1
            i += 1
            cells = [re.split(r"\s{2,}", b.strip()) for b in block]
            if len(block) == 2 and len(cells[0]) == len(cells[1]):
                out.append(interlinear(block))
            else:
                out.append(f"<pre>{html.escape(chr(10).join(block))}</pre>")
            continue
        if line.startswith("#"):
            level = len(line) - len(line.lstrip("#"))
            text = line[level:].strip()
            i += 1
            if level == 1:
                continue
            hid = slug(text)
            if level == 2:
                toc.append((hid, text))
            out.append(f'<h{level + 1} id="{hid}">{inline(text, forms)}</h{level + 1}>')
            continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            head, body = rows[0], rows[2:]
            t = ["<div class=\"tw\"><table><thead><tr>"]
            t += [f"<th>{inline(c, forms)}</th>" for c in head]
            t.append("</tr></thead><tbody>")
            for r in body:
                t.append("<tr>" + "".join(f"<td>{inline(c, forms)}</td>" for c in r) + "</tr>")
            t.append("</tbody></table></div>")
            out.append("".join(t))
            continue
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(lines[i][2:])
                i += 1
            out.append("<ul>" + "".join(f"<li>{inline(x, forms)}</li>" for x in items) + "</ul>")
            continue
        if not line.strip():
            i += 1
            continue
        para = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("#", "|", "- ", "```")):
            para.append(lines[i])
            i += 1
        out.append(f"<p>{inline(' '.join(para), forms)}</p>")
    return "\n".join(out), toc


# ------------------------------------------------------------------ compass

def compass_svg(h):
    cx = cy = 160
    lex = h.lexicon

    def pt(r, deg):
        a = math.radians(deg - 90)
        return cx + r * math.cos(a), cy + r * math.sin(a)

    def f(x):
        return f"{x:.1f}"

    peaks = []
    for k in range(48):
        x, y = pt(150 if k % 2 == 0 else 132, k * 7.5)
        peaks.append(f"{f(x)},{f(y)}")
    rivers = []
    for deg in (20, 95, 160, 230, 300):
        x0, y0 = pt(130, deg)
        x1, y1 = pt(26, deg + 25)
        qx, qy = pt(80, deg + 30)
        rivers.append(f'<path class="cv-river" d="M{f(x0)} {f(y0)} Q{f(qx)} {f(qy)} {f(x1)} {f(y1)}"/>')

    def arc(r, a0, a1):
        x0, y0 = pt(r, a0)
        x1, y1 = pt(r, a1)
        sweep = 1 if a1 > a0 else 0
        return f"M{f(x0)} {f(y0)} A{r} {r} 0 0 {sweep} {f(x1)} {f(y1)}"

    ox0, oy0 = pt(38, 40)
    ox1, oy1 = pt(112, 40)
    ix0, iy0 = pt(112, 196)
    ix1, iy1 = pt(36, 196)
    lab = []

    def label(r, deg, word, gloss, anchor="middle"):
        x, y = pt(r, deg)
        lab.append(f'<text class="cv-dos" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}">{word}</text>'
                   f'<text class="cv-en" x="{f(x)}" y="{f(y + 13)}" text-anchor="{anchor}">{gloss}</text>')

    label(92, 52, roman(lex["rimward"].mod), "rimward")
    label(92, 236, roman(lex["hubward"].mod), "hubward")
    label(104, 120, roman(lex["sunwise"].mod), "sunwise")
    label(104, 300, roman(lex["nightwise"].mod), "nightwise")
    mx, my = pt(0, 0)
    return f'''<svg class="compass" viewBox="0 0 320 320" role="img" aria-labelledby="cv-t">
<title id="cv-t">The basin's absolute directions: rimward, hubward, sunwise, nightwise</title>
<defs><marker id="cv-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="cv-head" d="M0 0 L10 5 L0 10 z"/></marker></defs>
<polygon class="cv-rim" points="{' '.join(peaks)}"/>
<circle class="cv-plain" cx="{cx}" cy="{cy}" r="131"/>
{''.join(rivers)}
<ellipse class="cv-marsh" cx="{f(mx)}" cy="{f(my)}" rx="26" ry="19"/>
<path class="cv-arrow" d="M{f(ox0)} {f(oy0)} L{f(ox1)} {f(oy1)}" marker-end="url(#cv-ah)"/>
<path class="cv-arrow" d="M{f(ix0)} {f(iy0)} L{f(ix1)} {f(iy1)}" marker-end="url(#cv-ah)"/>
<path class="cv-arrow cv-turn" d="{arc(70, 95, 145)}" marker-end="url(#cv-ah)"/>
<path class="cv-arrow cv-turn" d="{arc(70, 325, 275)}" marker-end="url(#cv-ah)"/>
{''.join(lab)}
</svg>'''


# ------------------------------------------------------------------ page

def known_forms(data, h):
    forms = set()
    for n in data["nouns"].values():
        forms |= {re.sub(r"[=\-]", "", p[0]) for p in n["forms"].values()}
    for v in data["verbs"].values():
        forms |= {re.sub(r"[=\-]", "", p[0]) for p in v["forms"].values()}
    for group in ("adjs", "nums", "dirs", "gram", "post", "cls"):
        forms |= {x["f"] for x in data[group].values()}
    for p in data["pron"].values():
        forms |= {p["f"], p["gen"]}
    for e in h.lexicon.values():
        if e.mod:
            forms.add(roman(e.mod))
        if e.rim:
            forms.add(roman(e.rim))
    for row in h.paradigms["nouns"].values():
        forms |= {roman(c["mod"]) for c in row.values()} | {roman(c["rim"]) for c in row.values()}
    for row in h.paradigms["verbs"].values():
        forms |= {roman(c["mod"]) for c in row.values()}
    return forms


def render_site(h, grammar_md):
    data = build_export(h)
    forms = known_forms(data, h)
    body, toc = md_to_html(grammar_md, forms)
    toc_html = "".join(f'<li><a href="#{hid}">{inline(t, forms)}</a></li>' for hid, t in toc)
    lex = h.lexicon
    stats = (f"{len(data['lexicon'])} words · {len(h.roots)} proto roots · "
             f"{sum(r['std'] for r in h.slang_results)} of {len(h.slang_results)} slang terms standardized · seed {SEED}")
    page = (WEB / "page.html").read_text(encoding="utf-8")
    js = (WEB / "translator.js").read_text(encoding="utf-8")
    ui = (WEB / "ui.js").read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    repl = {
        "%%NAME%%": roman(lex["glossonym"].mod).capitalize(),
        "%%IPA%%": "ˈ" + "".join(lex["glossonym"].mod),
        "%%PEOPLE%%": roman(lex["ethnonym"].mod).capitalize(),
        "%%STATS%%": html.escape(stats),
        "%%COMPASS%%": compass_svg(h),
        "%%TOC%%": toc_html,
        "%%GRAMMAR%%": body,
        "%%SEED%%": SEED,
        "%%NCHANGES%%": str(len(ch.STAGE_A) + len(ch.STAGE_B_STD) + len(ch.STAGE_C_STD) + len(ch.STAGE_C_RIM)),
        "%%NWORDS%%": str(len(data["lexicon"])),
        "%%DATA%%": payload,
        "%%TRANSLATOR%%": js,
        "%%UI%%": ui,
    }
    for k, v in repl.items():
        page = page.replace(k, v)
    return page

"""Data bundle for the web translator.

Every inflected form is computed here with the same machinery as the
grammar (proto inflection + sound change, or Middle Basin affixation +
Stage C), so the translator never builds a form the history did not.
"""

import re

from . import changes as ch
from .data import CLASSIFIER_MEMBERS, CLASSIFIERS, DIRECTIONALS
from .history import PERSONS, inflect, productive_suffix
from .modern import elide, realize
from .phonology import ipa, roman

NUMERALS = ["one", "two", "three", "four", "five", "six", "seven", "eight",
            "nine", "ten", "twenty", "hundred"]
ADJ_KEYS = {"stony", "horsy"}
SKIP = {"ethnonym", "glossonym", "highlander"}
PRON = {"1sg": "1SG", "2sg": "2SG", "that": "3", "1pl": "1PL", "2pl": "2PL"}
POSTPOSITIONS = ["PROG", "ON", "BEHIND", "BEFORE", "UNDER", "BESIDE", "WITH", "TO", "FROM"]


def headwords(gloss):
    g = re.sub(r"\(.*?\)", "", gloss)
    out = []
    for part in re.split(r"[,;]", g):
        p = part.strip().lower()
        if p.startswith("to "):
            p = p[3:]
        if p and p not in out:
            out.append(p)
    return out


def pos_of(key, e):
    if key in NUMERALS:
        return "num"
    if key in ADJ_KEYS:
        return "adj"
    return {"verb": "verb", "quality": "adj", "direction": "dir",
            "pronoun": "pron", "deixis": "func"}.get(e.field, "noun")


def form(pieces):
    _surface, seg, gloss = realize(pieces)
    return [seg, gloss]


def modern_form(pieces):
    """Affixation on a word that has no Middle Basin stage (Modern coinage):
    concatenate Modern forms and apply only cluster sandhi."""
    pieces = elide(pieces)
    flat, bounds = [], []
    for segs, _g, _s in pieces:
        flat += segs
        bounds.append(len(flat))
    rep = ch.b8_cluster_repair(flat)
    gloss = "".join(sep + g for _x, g, sep in pieces)
    if len(rep) != len(flat):
        return [roman(rep), gloss.replace("-", ".").replace("=", ".")]
    seg, start = "", 0
    for (_x, _g, sep), end in zip(pieces, bounds):
        seg += sep + roman(rep[start:end])
        start = end
    return [seg, gloss]


def build_export(h):
    G = h.gram
    DEF = G["DEF"]["mb"]
    PL = productive_suffix("ra")
    GEN = productive_suffix("os")
    cl_of = {k: c for c, ks in CLASSIFIER_MEMBERS.items() for k in ks}
    data = {"nouns": {}, "verbs": {}, "adjs": {}, "nums": {}, "dirs": {},
            "pron": {}, "gram": {}, "post": {}, "cls": {}, "lexicon": []}

    for key, e in h.lexicon.items():
        if (e.status not in ("current", "narrowed") or key in SKIP or e.mod is None
                or e.field == "grammar"):
            continue
        hw = headwords(e.gloss)
        if not hw:
            continue
        pos = pos_of(key, e)
        label = hw[0].replace(" ", ".")
        base = {"hw": hw, "f": roman(e.mod), "ipa": ipa(e.mod), "status": e.status}

        if pos == "noun":
            if e.mb is not None:
                if e.proto:
                    pl = [(inflect(e.proto, "ra")["mb"], f"{label}.PL", "")]
                    gen = [(inflect(e.proto, "os")["mb"], f"{label}.GEN", "")]
                else:
                    pl = [(e.mb, label, ""), (PL, "PL", "-")]
                    gen = [(e.mb, label, ""), (GEN, "GEN", "-")]
                sg = [(e.mb, label, "")]
                forms = {
                    "sg": [roman(e.mod), label], "def": form(sg + [(DEF, "DEF", "=")]),
                    "pl": form(pl), "pldef": form(pl + [(DEF, "DEF", "=")]),
                    "gen": form(gen), "plgen": form(pl + [(GEN, "GEN", "-")]),
                }
            else:
                dm, pm, gm = G["DEF"]["mod"], ch.evolve(PL, ch.STAGE_C_STD), ch.evolve(GEN, ch.STAGE_C_STD)
                sg = [(e.mod, label, "")]
                pl = sg + [(pm, "PL", "-")]
                forms = {
                    "sg": [roman(e.mod), label], "def": modern_form(sg + [(dm, "DEF", "=")]),
                    "pl": modern_form(pl), "pldef": modern_form(pl + [(dm, "DEF", "=")]),
                    "gen": modern_form(sg + [(gm, "GEN", "-")]), "plgen": modern_form(pl + [(gm, "GEN", "-")]),
                }
            data["nouns"][key] = dict(base, forms=forms, cl=cl_of.get(key, "CL.CLOD"))
        elif pos == "verb" and e.proto:
            cells = {}
            for tense, pre in (("PRS", []), ("PST", ["ta"])):
                for pers, sfx in PERSONS:
                    mb = inflect(e.proto, *pre, sfx)["mb"]
                    cells[f"{tense}.{pers}"] = form([(mb, f"{label}.{tense}.{pers}", "")])
                    if tense == "PRS":
                        cells[f"FUT.{pers}"] = form([(G["FUT"]["mb"], "FUT", ""),
                                                     (mb, f"{label}.PRS.{pers}", "=")])
            nm = inflect(e.proto, "ni")["mb"]
            cells["NMLZ"] = form([(nm, f"{label}.NMLZ", "")])
            cells["PROG"] = form([(nm, f"{label}.NMLZ", ""), (G["PROG"]["mb"], "PROG", "=")])
            data["verbs"][key] = dict(base, forms=cells)
        elif pos == "adj":
            data["adjs"][key] = base
        elif pos == "num":
            data["nums"][key] = base
        elif pos == "dir":
            data["dirs"][key] = base
        elif key in PRON:
            gen = h.paradigms["pronouns_gen"][key]
            data["pron"][PRON[key]] = dict(base, gen=roman(gen["mod"]))
        else:
            data["gram"][key] = base

    for fn in ("DEF", "NEG", "Q", "FUT", "PROG"):
        data["gram"][fn] = {"f": roman(G[fn]["mod"]), "src": G[fn]["src"]}
    for fn in POSTPOSITIONS:
        data["post"][fn] = {"f": roman(G[fn]["mod"]), "src": G[fn]["src"],
                            "label": "IN" if fn == "PROG" else fn}
    for label, use, src in CLASSIFIERS:
        data["cls"][label] = {"f": roman(G[label]["mod"]), "use": use, "src": src}
    data["dirs_meta"] = {k: g for k, g, _n in DIRECTIONALS}

    for k, e in h.lexicon.items():
        if e.mod is None:
            continue
        data["lexicon"].append([roman(e.mod), ipa(e.mod), roman(e.rim) if e.rim else "",
                                e.gloss, e.status, e.origin,
                                "*" + ipa(e.proto) if e.proto else "", e.etym])
    data["lexicon"].sort(key=lambda r: r[0])
    return data

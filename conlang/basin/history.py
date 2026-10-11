"""Runs the language's history: lexicon through three stages of sound change,
two contact layers, slang formation and consolidation, learned borrowing,
grammaticalization, and paradigm erosion.
"""

import random
from dataclasses import dataclass, field

from . import changes as ch
from .data import (CLASSIFIERS, CONSOLIDATION, DERIVED, DIRECTIONALS,
                   GRAMMATICALIZATION, GROUPS, LEARNED, LOANS,
                   MODERN_COMPOUNDS, ROOTS, SEED, SLANG)
from .phonology import is_cons, is_vowel, shorten, tokenize
from .proto import attach, build_derived, generate_highland, generate_roots


@dataclass
class Entry:
    key: str
    gloss: str
    field: str
    origin: str
    etym: str
    proto: list | None = None
    ob: list | None = None
    mb: list | None = None
    mb_rim: list | None = None
    mod: list | None = None
    rim: list | None = None
    status: str = "current"
    stability: float | None = None
    rim_note: str = ""


def run_std_from_proto(p):
    ob = ch.evolve(p, ch.STAGE_A)
    return ob, ch.evolve(ob, ch.STAGE_B_STD), ch.evolve(ob, ch.STAGE_B_RIM)


def finish(entry):
    if entry.mb is not None:
        entry.mod = ch.evolve(entry.mb, ch.STAGE_C_STD)
    if entry.mb_rim is not None:
        entry.rim = ch.evolve(entry.mb_rim, ch.STAGE_C_RIM)
    return entry


def from_ob(ob):
    return ch.evolve(ob, ch.STAGE_B_STD), ch.evolve(ob, ch.STAGE_B_RIM)


def join(a, b):
    """Concatenate two forms of the same stage (compounding, cliticization)."""
    if a and b and is_vowel(a[-1]) and is_vowel(b[0]):
        return a[:-1] + b
    return a + b


def mb_join(*parts):
    out = []
    for p in parts:
        out = join(out, p) if out else list(p)
    return ch.b8_cluster_repair(out)


# ------------------------------------------------------------- loans

EARLY_MAP = {"pʼ": "p", "tʼ": "t", "kʼ": "k", "qʼ": "k", "q": "k", "χ": "k",
             "ts": "s", "tsʼ": "s", "ʃ": "s"}
LATE_MAP = {"pʼ": "p", "tʼ": "t", "kʼ": "k", "qʼ": "k", "q": "k", "χ": "x",
            "tsʼ": "ts"}
SONORANTS = {"m", "n", "l", "r"}


def nativize_early(src):
    s = [EARLY_MAP.get(x, x) for x in src]
    vowels = [x for x in s if is_vowel(x)]
    if len(s) > 1 and is_cons(s[0]) and is_cons(s[1]):
        s = [s[0], vowels[0]] + s[1:]          # copy-vowel anaptyxis
    if len(s) > 1 and is_cons(s[-1]) and is_cons(s[-2]):
        s = s + [vowels[-1]]                   # echo vowel
    return ch.b8_cluster_repair(s) if any(
        s[i] == s[i + 1] for i in range(len(s) - 1)) else s


def nativize_late(src):
    s = [LATE_MAP.get(x, x) for x in src]
    if len(s) > 1 and is_cons(s[0]) and is_cons(s[1]) and s[0] not in ("s", "ʃ"):
        s = [s[0], "ə"] + s[1:]
    if len(s) > 1 and is_cons(s[-1]) and is_cons(s[-2]) and s[-2] not in SONORANTS:
        s = s + ["ə"]
    return [x for i, x in enumerate(s) if not (i and is_cons(x) and x == s[i - 1])]


def learned_adapt(ob):
    """Scribal reading pronunciation of a written Old Basin word."""
    out = []
    for x in ob:
        x = shorten(x)
        out.append({"dʒ": "ʒ", "w": "v"}.get(x, x))
    return out


# ------------------------------------------------------------- the run

@dataclass
class History:
    roots: dict
    derived: dict
    etyma: dict                     # every inherited etymon, by concept key
    lexicon: dict                   # current concept -> Entry
    highland: dict
    slang_results: list = field(default_factory=list)
    gram: dict = field(default_factory=dict)
    paradigms: dict = field(default_factory=dict)
    homophones_mb: list = field(default_factory=list)
    learned_skipped: list = field(default_factory=list)


def build():
    roots = generate_roots()
    derived = build_derived(roots)
    meta = {k: (g, f, st) for k, g, f, st, _t in ROOTS}
    meta.update({k: (g, "derived", None) for k, g, _p in DERIVED})

    etyma = {}
    for key, p in list(roots.items()) + list(derived.items()):
        gloss, fld, stab = meta[key]
        ob, mb, mbr = run_std_from_proto(p)
        if key in derived:
            parts = next(pp for k, _g, pp in DERIVED if k == key)
            etym = "Proto-Basin derivative: " + " + ".join(
                ("*-" + "".join(tokenize_affix(x))) if x.startswith("-") else f"*{''.join(roots.get(x) or derived[x])} '{x}'"
                for x in parts)
            origin = "inherited (proto derivative)"
        else:
            etym = "Proto-Basin root"
            origin = "inherited"
        etyma[key] = finish(Entry(key, gloss, fld, origin, etym, p, ob, mb, mbr,
                                  stability=stab))

    lexicon = {k: e for k, e in etyma.items()}

    # ---- Highland contact
    hl_keys = [k for k, _g, _l in LOANS] + ["people"]
    highland = generate_highland(hl_keys)
    for key, gloss, layer in LOANS:
        src = highland[key]
        if layer == "early":
            ob = nativize_early(src)
            mb, mbr = from_ob(ob)
            e = Entry(key, gloss, "contact", "loan (early Highland)",
                      f"Highland {''.join(src)}, borrowed into Old Basin", None, ob, mb, mbr)
        else:
            mb = nativize_late(src)
            e = Entry(key, gloss, "contact", "loan (late Highland)",
                      f"Highland {''.join(src)}, borrowed into Middle Basin", None, None, mb, list(mb))
        lexicon[key] = finish(e)
    hp = nativize_late(highland["people"])
    lexicon["highlander"] = finish(Entry(
        "highlander", "Highlander (exonym)", "contact", "loan (late Highland)",
        f"Highland {''.join(highland['people'])} 'people', borrowed into Middle Basin",
        None, None, hp, list(hp)))

    h = History(roots, derived, etyma, lexicon, highland)
    _homophony(h)
    for era in ("old", "middle"):
        for cand in [c for c in SLANG if c[4] == era]:
            _slang(h, cand)
    _learned(h)
    _grammaticalize(h)
    _modern_compounds(h)
    _paradigms(h)
    return h


def tokenize_affix(name):
    from .data import PROTO_AFFIXES
    return tokenize(PROTO_AFFIXES[name])


def _homophony(h):
    seen = {}
    for k, e in h.lexicon.items():
        seen.setdefault("".join(e.mb), []).append(k)
    h.homophones_mb = [(form, ks) for form, ks in seen.items() if len(ks) > 1]


def _clashes(h, key):
    form = "".join(h.etyma[key].mb)
    return [k for k, e in h.lexicon.items()
            if k != key and e.mb is not None and "".join(e.mb) == form and e.status == "current"]


def _slang(h, cand):
    target, parts, mech, group, era, expr, fate, why = cand
    old = h.lexicon[target]
    g = GROUPS[group]
    c = CONSOLIDATION

    # form of the innovation
    if era == "old":
        if len(parts) == 1:
            src = h.lexicon[parts[0]]
            ob, mb, mbr = src.ob, src.mb, src.mb_rim
            proto = src.proto
        else:
            ob = []
            for p in parts:
                ob = join(ob, h.lexicon[p].ob) if ob else list(h.lexicon[p].ob)
            mb, mbr = from_ob(ob)
            proto = None
    else:
        if len(parts) == 1:
            src = h.lexicon[parts[0]]
            ob, mb, mbr, proto = src.ob, src.mb, src.mb_rim, src.proto
        else:
            ob, proto = None, None
            mb = mb_join(*[h.lexicon[p].mb for p in parts])
            mbr = mb_join(*[h.lexicon[p].mb_rim for p in parts])

    # score
    clash = _clashes(h, target) if target in h.etyma else []
    eroded = target in h.etyma and len(h.etyma[target].mb) <= 2
    stab = old.stability
    eff_stab = max(0.0, stab - (c["homophony_penalty"] if clash else 0)
                   - (c["erosion_penalty"] if eroded else 0))
    social = c["w_reach"] * g["reach"] + c["w_prestige"] * g["prestige"]
    rng = random.Random(f"{SEED}:slang:{target}")
    noise = rng.uniform(-c["noise"], c["noise"])
    score = social * expr * (1 - eff_stab) * c["era_multiplier"][era] + noise
    std = score >= c["threshold_standard"]
    rim = score >= c["threshold_rim"]

    src_desc = " + ".join(f"'{p}'" for p in parts)
    etym = f"{group} slang ({mech}) from {src_desc}, {era.title()} Basin period. {why}"
    new = finish(Entry(target, old.gloss, old.field, f"slang → standard ({group})",
                       etym, proto, ob, mb, mbr))

    h.slang_results.append({
        "target": target, "parts": parts, "mech": mech, "group": group,
        "era": era, "expr": expr, "stab": stab, "eff_stab": eff_stab,
        "clash": clash, "eroded": eroded, "social": social, "noise": noise,
        "score": score, "std": std, "rim": rim, "form": new, "old": old,
        "fate": fate, "why": why,
    })

    if std:
        if not rim:
            new.rim = old.rim
            new.rim_note = "Rim keeps the inherited word"
        h.lexicon[target] = new
        if fate:
            nk, ng = fate
            moved = Entry(nk, ng, old.field, old.origin + ", narrowed",
                          f"{old.etym}; meant '{old.gloss}' until displaced by {group} slang",
                          old.proto, old.ob, old.mb, old.mb_rim, old.mod, old.rim,
                          status="narrowed", stability=old.stability)
            if not rim:
                moved.rim_note = f"in Rim still means '{old.gloss}'"
            h.lexicon[nk] = moved
        else:
            old.status = "obsolete"
            old.etym += f"; displaced by {group} slang, survives only in fixed phrases"
            h.lexicon[target + "_obs"] = old
    else:
        reg = finish(Entry(target + "_slang", f"{old.gloss} ({group} register only)",
                           old.field, f"slang, not standardized ({group})", etym,
                           proto, ob, mb, mbr, status="register"))
        h.lexicon[target + "_slang"] = reg


def _learned(h):
    for key, gloss in LEARNED:
        src = h.etyma[key]
        form = learned_adapt(src.ob)
        if form == src.mod:
            h.learned_skipped.append(key)
            continue
        e = Entry(key + "_learned", gloss, src.field, "learned (scribal Old Basin)",
                  f"re-borrowed by scribes from written Old Basin {''.join(src.ob)}; "
                  f"doublet of inherited '{key}'",
                  src.proto, src.ob, None, None, form, list(form))
        h.lexicon[e.key] = e


def _grammaticalize(h):
    for fn, label, src_key, level, why in GRAMMATICALIZATION:
        src = h.etyma[src_key]
        mb = ch.erode(src.mb, level)
        mbr = ch.erode(src.mb_rim, level)
        h.gram[fn] = {"label": label, "src": src_key, "level": level, "why": why,
                      "src_mb": src.mb, "mb": mb, "mb_rim": mbr,
                      "mod": ch.evolve(mb, ch.STAGE_C_STD),
                      "rim": ch.evolve(mbr, ch.STAGE_C_RIM)}
    ward = h.gram["WARD"]
    for key, gloss, noun in DIRECTIONALS:
        n = h.lexicon[noun]
        mb = mb_join(n.mb, ward["mb"])
        mbr = mb_join(n.mb_rim, ward["mb_rim"])
        h.lexicon[key] = finish(Entry(key, gloss, "direction", "grammaticalized compound",
                                      f"Middle Basin '{noun}' + '-ward' (< 'road')",
                                      None, None, mb, mbr))
    for label, use, src_key in CLASSIFIERS:
        n = h.lexicon[src_key]
        mb, mbr = ch.erode(n.mb, 1), ch.erode(n.mb_rim, 1)
        h.gram[label] = {"label": f"classifier: {use}", "src": src_key, "level": 1,
                         "why": "measure noun → numeral classifier (market counting)",
                         "src_mb": n.mb, "mb": mb, "mb_rim": mbr,
                         "mod": ch.evolve(mb, ch.STAGE_C_STD),
                         "rim": ch.evolve(mbr, ch.STAGE_C_RIM)}


def _modern_compounds(h):
    for key, gloss, parts in MODERN_COMPOUNDS:
        mod, rim = [], []
        for p in parts:
            mod = mod + h.lexicon[p].mod
            rim = rim + h.lexicon[p].rim
        h.lexicon[key] = Entry(key, gloss, "modern", "Modern compound",
                               "Modern Basin " + " + ".join(f"'{p}'" for p in parts),
                               mod=mod, rim=rim)


# ------------------------------------------------------------- paradigms

NOUN_CELLS = [("NOM", ""), ("ACC", "em"), ("GEN", "os"), ("DAT", "ei"),
              ("LOC", "i"), ("ABL", "et"), ("INS", "bi"), ("PL", "es"),
              ("COLL", "ra")]
PERSONS = [("1SG", "mi"), ("2SG", "si"), ("3SG", "ti"),
           ("1PL", "mes"), ("2PL", "te"), ("3PL", "nti")]


def inflect(proto_stem, *suffixes):
    p = list(proto_stem)
    for s in suffixes:
        if s:
            p = attach(p, tokenize(s))
    ob, mb, mbr = run_std_from_proto(p)
    return {"proto": p, "ob": ob, "mb": mb, "mb_rim": mbr,
            "mod": ch.evolve(mb, ch.STAGE_C_STD),
            "rim": ch.evolve(mbr, ch.STAGE_C_RIM)}


NOUN_FIELDS = {"body", "people", "nature", "water", "time", "crops", "herding", "society"}


def _pick_by_shape(stems, shapes):
    out = []
    for shape in shapes:
        for k, p in stems:
            sh = "".join("V" if is_vowel(x) else "C" for x in p)
            if sh == shape and k not in [x for x, _ in out]:
                out.append((k, p))
                break
    return out


def _merger_rates(table, cells, stage):
    """Share of stems in which two paradigm cells have become identical."""
    rates = {}
    for i, a in enumerate(cells):
        for b in cells[i + 1:]:
            same = sum(1 for row in table.values() if row[a][stage] == row[b][stage])
            if same:
                rates[(a, b)] = same / len(table)
    return rates


def productive_suffix(suffix, stem="tan"):
    """Middle Basin shape of a suffix after a neutral consonant-final stem.
    Returns None when the suffix fused with the stem (umlaut etc.)."""
    bare = inflect(tokenize(stem))["mb"]
    full = inflect(tokenize(stem), suffix)["mb"]
    if full[:len(bare)] == bare:
        return full[len(bare):]
    return None


def _paradigms(h):
    cells = [c for c, _ in NOUN_CELLS]
    nouns = [(k, h.roots[k]) for k, _g, f, _s, t in ROOTS if f in NOUN_FIELDS]
    undisplaced = lambda stems: [(k, p) for k, p in stems if h.lexicon.get(k) is h.etyma[k]]
    ntab = {k: {c: inflect(p, s) for c, s in NOUN_CELLS} for k, p in nouns}

    verbs = [(k, h.roots[k]) for k, _g, f, _s, t in ROOTS
             if f == "verb" and "gram" not in t]
    vtab = {}
    for k, p in verbs:
        row = {}
        for pers, s in PERSONS:
            row["PRS." + pers] = inflect(p, s)
        for pers, s in PERSONS:
            row["PST." + pers] = inflect(p, "ta", s)
        row["NMLZ"] = inflect(p, "ni")
        vtab[k] = row
    vcells = list(next(iter(vtab.values())))

    pron_keys = ("1sg", "2sg", "that", "1pl", "2pl")
    pron = {k: inflect(h.roots[k]) for k in pron_keys}
    pron_gen = {k: inflect(h.roots[k], "os") for k in pron_keys}
    gen_sfx = productive_suffix("os")
    reformed = []
    for k in pron_keys:
        clash = [o for o in pron_keys if o != k and pron_gen[o]["mb"] == pron_gen[k]["mb"]]
        if clash:
            reformed.append(k)
    for k in reformed:
        mb = mb_join(pron[k]["mb"], gen_sfx)
        pron_gen[k] = dict(pron_gen[k], mb=mb, mod=ch.evolve(mb, ch.STAGE_C_STD),
                           reformed=True)

    h.paradigms = {
        "nouns": ntab, "noun_cells": cells,
        "noun_samples": _pick_by_shape(undisplaced(nouns), ["CVC", "CVCV", "CVCVC", "CVCCV", "VCV"]),
        "noun_rates_std": _merger_rates(ntab, cells, "mod"),
        "noun_rates_rim": _merger_rates(ntab, cells, "rim"),
        "verbs": vtab, "verb_cells": vcells,
        "verb_samples": _pick_by_shape(undisplaced(verbs), ["CVC", "CVCV", "CVCVC"]),
        "verb_rates_std": _merger_rates(vtab, vcells, "mod"),
        "verb_rates_rim": _merger_rates(vtab, vcells, "rim"),
        "pronouns": pron, "pronouns_gen": pron_gen, "pron_reformed": reformed,
        "suffix": {name: productive_suffix(sfx) for name, sfx in NOUN_CELLS if sfx},
    }

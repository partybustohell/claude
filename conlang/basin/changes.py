"""Ordered sound changes, one list per historical stage.

Every rule is a pure function on a segment list. Rules are applied in the
order listed; the order is part of the design (e.g. umlaut must precede
vowel reduction, or the triggering /i/ is gone before it can act).
"""

from dataclasses import dataclass
from typing import Callable

from .phonology import (DEVOICING, FRONT_VOWELS, HIGH_FRONT, LABIALS, VELARS,
                        VOICING, is_cons, is_long, is_short, is_vowel,
                        lengthen, nuclei, shorten)


@dataclass(frozen=True)
class Rule:
    code: str
    name: str        # the natural process, in standard terminology
    statement: str   # the rule in rewrite notation
    why: str         # motivation / typological parallel
    fn: Callable


def _between_vowels(s, i):
    return 0 < i < len(s) - 1 and is_vowel(s[i - 1]) and is_vowel(s[i + 1])


# ---------------------------------------------------------------- Stage A
# Proto-Basin -> Old Basin

def a1_laryngeal_lengthening(s):
    out = []
    for i, seg in enumerate(s):
        nxt = s[i + 1] if i + 1 < len(s) else None
        if seg == "h" and out and is_short(out[-1]) and (nxt is None or is_cons(nxt)):
            out[-1] = lengthen(out[-1])
            continue
        out.append(seg)
    return out


def a2_laryngeal_loss(s):
    return [seg for seg in s if seg != "h"]


_HIATUS = {
    ("a", "i"): "eː", ("a", "e"): "eː", ("e", "i"): "eː", ("i", "e"): "eː",
    ("a", "u"): "oː", ("a", "o"): "oː", ("o", "u"): "oː", ("u", "o"): "oː",
    ("o", "e"): "eː", ("e", "o"): "oː",
}


def a3_hiatus(s):
    s = list(s)
    i = 0
    while i < len(s) - 1:
        v1, v2 = s[i], s[i + 1]
        if is_vowel(v1) and is_vowel(v2):
            b1, b2 = shorten(v1), shorten(v2)
            if b1 == b2:
                s[i:i + 2] = [lengthen(b1)]
            elif (b1, b2) in _HIATUS:
                s[i:i + 2] = [_HIATUS[(b1, b2)]]
            elif b1 == "i":
                s[i] = "j"
            elif b1 == "u":
                s[i] = "w"
            else:
                s[i:i + 2] = [lengthen(b2)]
            continue
        i += 1
    return s


def a4_labiovelars(s):
    out = []
    for i, seg in enumerate(s):
        nxt = s[i + 1] if i + 1 < len(s) else ""
        rounded = shorten(nxt) in ("o", "u")
        if seg == "kʷ":
            out.append("k" if rounded else "p")
        elif seg == "gʷ":
            out.append("g" if rounded else "b")
        else:
            out.append(seg)
    return out


def a5_palatalization(s):
    out = []
    for i, seg in enumerate(s):
        nxt = s[i + 1] if i + 1 < len(s) else ""
        if seg in ("k", "g") and (nxt in FRONT_VOWELS or nxt == "j"):
            out.append("tʃ" if seg == "k" else "dʒ")
        else:
            out.append(seg)
    return out


def a6_intervocalic_voicing(s):
    return [VOICING[seg] if seg in ("p", "t", "k", "s", "tʃ") and _between_vowels(s, i)
            else seg for i, seg in enumerate(s)]


def a7_final_m(s):
    return s[:-1] + ["n"] if s and s[-1] == "m" else list(s)


STAGE_A = [
    Rule("A1", "Compensatory lengthening", "Vh → Vː / _C, _#",
         "Loss of a coda laryngeal leaves its timing slot to the vowel (cf. PIE *h₂ → Greek/Latin long vowels).",
         a1_laryngeal_lengthening),
    Rule("A2", "Laryngeal loss", "h → ∅",
         "Remaining /h/ (initial, intervocalic) is lost; glottal fricatives are the least stable consonants cross-linguistically.",
         a2_laryngeal_loss),
    Rule("A3", "Hiatus resolution", "V₁V₁ → Vː; aI → eː; aU → oː; i,u → j,w / _V",
         "Vowels brought together by A2 contract or glide; standard coalescence pattern (cf. Sanskrit sandhi).",
         a3_hiatus),
    Rule("A4", "Labiovelar split", "kʷ,gʷ → k,g / _o,u; → p,b elsewhere",
         "Rounding is absorbed by a following rounded vowel, otherwise reinterpreted as labial place (cf. P-Celtic, Greek).",
         a4_labiovelars),
    Rule("A5", "Velar palatalization", "k,g → tʃ,dʒ / _[front V], _j",
         "Coarticulation with front vowels (cf. Latin → Italian, Old English cirice → church).",
         a5_palatalization),
    Rule("A6", "Intervocalic voicing", "p,t,k,s,tʃ → b,d,g,z,dʒ / V_V",
         "First step of lenition between vowels (cf. Latin → Western Romance).",
         a6_intervocalic_voicing),
    Rule("A7", "Final nasal neutralization", "m → n / _#",
         "Place contrast in nasals neutralizes word-finally (cf. Ancient Greek).",
         a7_final_m),
]


# ---------------------------------------------------------------- Stage B
# Old Basin -> Middle Basin

_UMLAUT = {"a": "e", "aː": "eː", "o": "ø", "oː": "øː", "u": "y", "uː": "yː"}


def b1_umlaut(s):
    n = nuclei(s)
    if len(n) < 2:
        return list(s)
    first, second = n[0], n[1]
    trigger = s[second] in HIGH_FRONT or "j" in s[first + 1:second]
    if trigger and s[first] in _UMLAUT:
        s = list(s)
        s[first] = _UMLAUT[s[first]]
    return list(s)


def b2_spirantization(s):
    spir = {"b": "v", "d": "ð", "g": "ɣ"}
    return [spir[seg] if seg in spir and _between_vowels(s, i) else seg
            for i, seg in enumerate(s)]


def b3_velar_gliding(s):
    out = []
    for i, seg in enumerate(s):
        if seg == "ɣ":
            out.append("j" if i > 0 and s[i - 1] in FRONT_VOWELS else "w")
        else:
            out.append(seg)
    return out


def b4_final_nasal_loss(s):
    n = nuclei(s)
    if len(n) >= 2 and s[-1] in ("n", "m") and is_vowel(s[-2]) and len(s) - 2 != n[0]:
        return s[:-1]
    return list(s)


def b5_reduction(s):
    n = nuclei(s)
    out = list(s)
    for i in n[1:]:
        if is_short(out[i]):
            out[i] = "ə"
        elif is_long(out[i]):
            out[i] = shorten(out[i])
    return out


def b6_syncope(s):
    n = nuclei(s)
    if len(n) < 3:
        return list(s)
    for i in n[1:-1]:
        if (s[i] == "ə" and i >= 2 and is_cons(s[i - 1]) and is_vowel(s[i - 2])
                and i + 2 < len(s) and is_cons(s[i + 1]) and is_vowel(s[i + 2])):
            return s[:i] + s[i + 1:]
    return list(s)


def b7_apocope(s):
    if len(nuclei(s)) < 2 or s[-1] != "ə":
        return list(s)
    if is_vowel(s[-2]) or (is_cons(s[-2]) and len(s) >= 3 and is_vowel(s[-3])):
        return s[:-1]
    return list(s)


def b8_cluster_repair(s):
    s = list(s)
    # degemination
    s = [seg for i, seg in enumerate(s) if not (i > 0 and is_cons(seg) and seg == s[i - 1])]
    # three-consonant clusters lose the middle member
    i = 1
    while i < len(s) - 1:
        if is_cons(s[i - 1]) and is_cons(s[i]) and is_cons(s[i + 1]):
            del s[i]
            continue
        i += 1
    # nasal place assimilation
    for i in range(len(s) - 1):
        nxt = s[i + 1]
        if s[i] == "n" and nxt in LABIALS:
            s[i] = "m"
        elif s[i] == "n" and nxt in VELARS:
            s[i] = "ŋ"
        elif s[i] == "m" and nxt in VELARS:
            s[i] = "ŋ"
        elif s[i] == "m" and is_cons(nxt) and nxt not in LABIALS:
            s[i] = "n"
    # regressive voicing assimilation in obstruent clusters
    for i in range(len(s) - 2, -1, -1):
        a, b = s[i], s[i + 1]
        if b in VOICING and a in DEVOICING:
            s[i] = DEVOICING[a]
        elif b in DEVOICING and a in VOICING:
            s[i] = VOICING[a]
    s = [seg for i, seg in enumerate(s) if not (i > 0 and is_cons(seg) and seg == s[i - 1])]
    return s


_B_COMMON_HEAD = [
    Rule("B1", "i-umlaut", "[back V] → [front V] / _C₀{i, iː, j}",
         "Anticipatory fronting of the stressed vowel before a high front vowel in the next syllable (cf. Germanic: *mūsiz → mice).",
         b1_umlaut),
    Rule("B2", "Spirantization", "b,d,g → v,ð,ɣ / V_V",
         "Second lenition step: voiced stops become fricatives between vowels (cf. Spanish, Celtic).",
         b2_spirantization),
    Rule("B3", "Velar gliding", "ɣ → j / [front V]_; ɣ → w elsewhere",
         "Weak velar fricative vocalizes toward the preceding vowel (cf. Old English dæg → day).",
         b3_velar_gliding),
    Rule("B4", "Final nasal loss", "n,m → ∅ / unstressed V_#",
         "Unstressed final nasals weaken and drop (cf. Latin -um → Romance -o).",
         b4_final_nasal_loss),
    Rule("B5", "Unstressed vowel reduction", "V̆ → ə, Vː → V̆ / unstressed σ",
         "Fixed initial stress starves later syllables (cf. Old → Middle English).",
         b5_reduction),
    Rule("B6", "Medial syncope", "ə → ∅ / VC_CV (one per word)",
         "Schwa in an internal open syllable deletes (cf. Latin calidum → caldo).",
         b6_syncope),
]
B7 = Rule("B7", "Apocope", "ə → ∅ / VC_# (polysyllables)",
          "Final schwa after a single consonant is lost (cf. Middle English name /naːmə/ → /naːm/).",
          b7_apocope)
B8 = Rule("B8", "Cluster repair", "CC → C (geminates); CCC → CC; nasal place and obstruent voicing assimilation",
          "New clusters created by B6/B7 are simplified to fit Middle Basin phonotactics.",
          b8_cluster_repair)

STAGE_B_STD = _B_COMMON_HEAD + [B7, B8]
STAGE_B_RIM = _B_COMMON_HEAD + [B8]   # Rim dialect never undergoes apocope


# ---------------------------------------------------------------- Stage C
# Middle Basin -> Modern Basin (Standard / River-Court norm)

def c1_final_devoicing(s):
    if s and s[-1] in DEVOICING:
        return s[:-1] + [DEVOICING[s[-1]]]
    return list(s)


_VOWEL_SHIFT = {"iː": "ei", "uː": "ou", "yː": "øy",
                "eː": "iː", "oː": "uː", "øː": "yː", "aː": "ɔː"}


def c2_long_vowel_shift(s):
    return [_VOWEL_SHIFT.get(seg, seg) for seg in s]


def c3_deaffrication(s):
    return ["ʒ" if seg == "dʒ" else seg for seg in s]


def c4_labiodentalization(s):
    return ["v" if seg == "w" and (i == 0 or is_vowel(s[i - 1])) else seg
            for i, seg in enumerate(s)]


STAGE_C_STD = [
    Rule("C1", "Final devoicing", "[+voice obstruent] → [−voice] / _#",
         "Exposed by apocope; extremely common (German, Dutch, Russian, Turkish).",
         c1_final_devoicing),
    Rule("C2", "Long-vowel chain shift", "iː→ei, uː→ou, yː→øy; eː→iː, oː→uː, øː→yː; aː→ɔː",
         "High long vowels diphthongize, mid vowels rise into the vacated slots, aː rounds (drag chain; cf. the English Great Vowel Shift).",
         c2_long_vowel_shift),
    Rule("C3", "Deaffrication", "dʒ → ʒ",
         "Affricate loses its stop phase (cf. Old French /dʒ/ → French /ʒ/).",
         c3_deaffrication),
    Rule("C4", "Labiodentalization", "w → v / #_, V_",
         "Labial glide becomes labiodental fricative (cf. Latin /w/ → /v/, German).",
         c4_labiodentalization),
]


# Rim dialect (mountain-adjacent periphery): conservative vowels, no apocope,
# dental fricatives merged with stops.

def r1_stopping(s):
    return ["d" if seg == "ð" else seg for seg in s]


def r2_final_schwa_lowering(s):
    if len(nuclei(s)) >= 2 and s[-1] == "ə":
        return s[:-1] + ["a"]
    return list(s)


STAGE_C_RIM = [
    Rule("R1", "Fricative stopping", "ð → d",
         "Dental fricative merges with /d/; Highland speakers, the Rim's main contact group, lack dental fricatives.",
         r1_stopping),
    Rule("R2", "Final schwa lowering", "ə → a / _# (polysyllables)",
         "Final schwa, kept because the Rim skipped apocope, is lowered (cf. Bavarian Sunna for German Sonne).",
         r2_final_schwa_lowering),
]


def evolve(segs, rules, trace=None):
    s = list(segs)
    for rule in rules:
        new = rule.fn(s)
        if trace is not None and new != s:
            trace.append((rule.code, s, new))
        s = new
    return s


def erode(segs, level):
    """Phonological reduction of a grammaticalizing word.

    level 1: keep the first syllable (onset, nucleus, at most one coda C)
    level 2: level 1, coda dropped and nucleus reduced to schwa
    """
    n = nuclei(segs)
    if not n:
        return list(segs)
    v = n[0]
    out = list(segs[:v + 1])
    if level == 1 and v + 1 < len(segs) and is_cons(segs[v + 1]):
        if v + 2 >= len(segs) or is_cons(segs[v + 2]):
            out.append(segs[v + 1])
    if level >= 2:
        out[v] = "ə"
    return out

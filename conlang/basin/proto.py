"""Procedural generation of Proto-Basin roots and of Highland source words.

Each concept gets its own RNG seeded from (SEED, concept key), so adding or
removing a concept does not reshuffle the forms of the others.
"""

import random

from .data import (DERIVED, HIGHLAND_ALTITUDE_M, PROTO_AFFIXES, ROOTS, SEED,
                   SETTING)
from .phonology import is_vowel, tokenize

# --------------------------------------------------------- derived parameters


def derived_parameters():
    """Map the physical/social setting onto generator parameters.

    open_syllable_bias: warmer climates show more open (CV) syllables in
        cross-linguistic samples (Ember & Ember 1999; Fought et al. 2004).
        A statistical tendency, used here only as a weight.
    ejectives: ejective consonants correlate with high-altitude homelands
        (Everett 2013). Contested; used only to decide that the Highland
        neighbour has them and the Basin does not.
    """
    t = SETTING["mean_annual_temp_c"]
    bias = max(0.0, min(1.0, (t - 5) / 25))
    return {
        "open_syllable_bias": round(bias, 2),
        "basin_ejectives": SETTING["basin_floor_altitude_m"] >= 1500,
        "highland_ejectives": HIGHLAND_ALTITUDE_M >= 1500,
    }


PARAMS = derived_parameters()

# --------------------------------------------------------- Proto-Basin

ONSETS = {"t": 10, "k": 9, "p": 7, "s": 8, "m": 7, "n": 8, "l": 6, "r": 2,
          "d": 6, "g": 5, "b": 4, "h": 5, "w": 4, "j": 3, "kʷ": 4, "gʷ": 2}
CODAS_MEDIAL = {"n": 6, "r": 5, "l": 4, "s": 4, "m": 3, "h": 4}
CODAS_FINAL = {"n": 6, "r": 5, "l": 4, "s": 4, "m": 3, "h": 4, "t": 3, "k": 2}
CLUSTER_SECOND = {"t": 5, "k": 4, "p": 3, "d": 3, "g": 2, "b": 2, "s": 2, "kʷ": 1}
VOWELS_DEFAULT = {"a": 10, "e": 8, "i": 6, "o": 6, "u": 5}
VOWELS_SMALL = {"a": 3, "e": 8, "i": 12, "o": 2, "u": 2}
VOWELS_BIG = {"a": 10, "e": 2, "i": 1, "o": 9, "u": 6}


def _shape_weights(tags):
    if "gram" in tags:
        return {"CV": 6, "CVC": 4}
    b = PARAMS["open_syllable_bias"]
    # open shapes gain weight with b, closed shapes lose it
    return {
        "CV": 4 + 4 * b, "CVCV": 24 + 12 * b, "VCV": 3 + 2 * b,
        "CVC": 34 - 10 * b, "CVCCV": 12, "CVCVC": 12 - 4 * b,
    }


def _pick(rng, weights):
    keys = list(weights)
    return rng.choices(keys, weights=[weights[k] for k in keys])[0]


def _build(shape, rng, vowels):
    segs = []
    for i, slot in enumerate(shape):
        if slot == "V":
            segs.append(_pick(rng, vowels))
            continue
        prev = shape[i - 1] if i > 0 else None
        nxt = shape[i + 1] if i + 1 < len(shape) else None
        if prev == "C":
            segs.append(_pick(rng, CLUSTER_SECOND))
        elif nxt == "C":
            segs.append(_pick(rng, CODAS_MEDIAL))
        elif nxt is None and prev == "V" and i > 0:
            segs.append(_pick(rng, CODAS_FINAL))
        else:
            segs.append(_pick(rng, ONSETS))
    # homorganic nasal + stop
    for i in range(len(segs) - 1):
        if segs[i] in ("n", "m") and segs[i + 1] in CLUSTER_SECOND:
            segs[i] = "m" if segs[i + 1] in ("p", "b", "kʷ") else "n"
    return segs


def _valid(segs):
    cons = [s for s in segs if not is_vowel(s)]
    if len(cons) != len(set(cons)):
        return False
    for i, s in enumerate(segs[:-1]):
        nxt = segs[i + 1]
        if s == "w" and nxt in ("o", "u"):
            return False
        if s == "j" and nxt in ("i", "e"):
            return False
        if s in ("kʷ", "gʷ") and nxt in ("o", "u"):
            return False
        if s == "h" and i > 0 and not is_vowel(segs[i - 1]):
            return False
    if not is_vowel(segs[-1]) and segs[-1] in ("w", "j"):
        return False
    return True


def generate_roots():
    """Return {key: segs} for every root concept, all distinct."""
    taken = set()
    roots = {}
    for key, _gloss, _field, _stab, tags in ROOTS:
        vowels = VOWELS_SMALL if "small" in tags else VOWELS_BIG if "big" in tags else VOWELS_DEFAULT
        attempt = 0
        while True:
            rng = random.Random(f"{SEED}:root:{key}:{attempt}")
            segs = _build(_pick(rng, _shape_weights(tags)), rng, vowels)
            form = "".join(segs)
            if _valid(segs) and form not in taken:
                break
            attempt += 1
        taken.add(form)
        roots[key] = segs
    return roots


def attach(stem, suffix):
    """Proto morpheme concatenation with vowel elision at V+V junctures."""
    if stem and suffix and is_vowel(stem[-1]) and is_vowel(suffix[0]):
        return stem[:-1] + suffix
    return stem + suffix


def proto_affix(name):
    return tokenize(PROTO_AFFIXES[name])


def build_derived(roots):
    out = {}
    for key, _gloss, parts in DERIVED:
        segs = []
        for p in parts:
            piece = proto_affix(p) if p.startswith("-") else (roots.get(p) or out[p])
            segs = attach(segs, piece) if segs else list(piece)
        out[key] = segs
    return out


# --------------------------------------------------------- Highland

H_CONS = {"p": 3, "t": 5, "k": 5, "q": 5, "s": 4, "ʃ": 4, "χ": 5, "ts": 3,
          "m": 3, "n": 4, "l": 3, "r": 4, "w": 2, "j": 2}
H_EJECTIVES = {"pʼ": 2, "tʼ": 3, "kʼ": 3, "qʼ": 3, "tsʼ": 2}
H_VOWELS = {"a": 6, "i": 4, "u": 5, "e": 2, "o": 2}
H_SHAPES = {"CVC": 3, "CCVC": 3, "CVCVC": 3, "CVCC": 1, "CCV": 1}


def generate_highland(keys):
    cons = dict(H_CONS)
    if PARAMS["highland_ejectives"]:
        cons.update(H_EJECTIVES)
    taken, out = set(), {}
    for key in keys:
        attempt = 0
        while True:
            rng = random.Random(f"{SEED}:highland:{key}:{attempt}")
            segs = [_pick(rng, H_VOWELS) if c == "V" else _pick(rng, cons)
                    for c in _pick(rng, H_SHAPES)]
            cs = [s for s in segs if not is_vowel(s)]
            sib = {"s", "ʃ", "ts", "tsʼ"}
            ok = (len(cs) == len(set(cs)) and segs[0] not in ("w", "j")
                  and not any(a in sib and b in sib for a, b in zip(segs, segs[1:])))
            if ok and "".join(segs) not in taken:
                break
            attempt += 1
        taken.add("".join(segs))
        out[key] = segs
    return out

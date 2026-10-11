"""Segment inventory, natural classes, tokenizer and romanization.

Words are represented as lists of segment strings (IPA), never as raw
strings, so multi-character segments (kʷ, tʃ, aː, ei) are atomic and sound
changes can match on whole segments.
"""

SHORT_VOWELS = ["a", "e", "i", "o", "u", "y", "ø", "ə", "ɔ"]
LONG_VOWELS = [v + "ː" for v in "aeiouyøɔ"]
DIPHTHONGS = ["ei", "ou", "øy"]
VOWELS = frozenset(SHORT_VOWELS + LONG_VOWELS + DIPHTHONGS)

FRONT_VOWELS = frozenset(["i", "e", "y", "ø", "iː", "eː", "yː", "øː", "ei", "øy"])
HIGH_FRONT = frozenset(["i", "iː"])

VOICING = {"p": "b", "t": "d", "k": "g", "s": "z", "tʃ": "dʒ", "f": "v",
           "θ": "ð", "x": "ɣ", "ʃ": "ʒ"}
DEVOICING = {v: k for k, v in VOICING.items()}
OBSTRUENTS = frozenset(list(VOICING) + list(DEVOICING) +
                       ["kʷ", "gʷ", "ts", "q", "χ", "pʼ", "tʼ", "kʼ", "qʼ", "tsʼ"])
NASALS = frozenset(["m", "n", "ŋ"])
LIQUIDS = frozenset(["l", "r"])
LABIALS = frozenset(["p", "b", "m", "f", "v", "w"])
VELARS = frozenset(["k", "g", "ŋ", "x", "ɣ"])

# Inventories used only for tokenizing hand-written strings.
PROTO_INVENTORY = ["kʷ", "gʷ", "p", "t", "k", "b", "d", "g", "m", "n", "s",
                   "h", "l", "r", "w", "j", "a", "e", "i", "o", "u"]
HIGHLAND_INVENTORY = ["tsʼ", "pʼ", "tʼ", "kʼ", "qʼ", "ts", "p", "t", "k", "q",
                      "s", "ʃ", "χ", "m", "n", "l", "r", "w", "j",
                      "a", "e", "i", "o", "u"]


def is_vowel(seg):
    return seg in VOWELS


def is_cons(seg):
    return seg not in VOWELS


def is_short(seg):
    return seg in SHORT_VOWELS


def is_long(seg):
    return seg in LONG_VOWELS


def lengthen(v):
    return v + "ː" if v in SHORT_VOWELS and v != "ə" else v


def shorten(v):
    return v[:-1] if v in LONG_VOWELS else v


def nuclei(segs):
    """Indices of syllable nuclei. Stress is fixed on the first one."""
    return [i for i, s in enumerate(segs) if is_vowel(s)]


def syllable_count(segs):
    return len(nuclei(segs))


def tokenize(text, inventory=PROTO_INVENTORY):
    """Greedy longest-match split of an IPA string into segments."""
    inv = sorted(inventory, key=len, reverse=True)
    out, i = [], 0
    text = text.replace("-", "")
    while i < len(text):
        for seg in inv:
            if text.startswith(seg, i):
                out.append(seg)
                i += len(seg)
                break
        else:
            raise ValueError(f"cannot tokenize {text!r} at {i}")
    return out


def ipa(segs):
    return "".join(segs)


ROMAN = {
    "a": "a", "e": "e", "i": "i", "o": "o", "u": "u", "y": "ü", "ø": "ö",
    "ə": "ë", "ɔ": "o",
    "aː": "ā", "eː": "ē", "iː": "ii", "oː": "ō", "uː": "uu", "yː": "üü",
    "øː": "öö", "ɔː": "å",
    "ei": "ei", "ou": "ou", "øy": "öy",
    "p": "p", "t": "t", "k": "k", "b": "b", "d": "d", "g": "g",
    "m": "m", "n": "n", "ŋ": "ng", "s": "s", "z": "z", "ʃ": "sh", "ʒ": "zh",
    "tʃ": "ch", "dʒ": "j", "f": "f", "v": "v", "θ": "th", "ð": "dh",
    "x": "kh", "ɣ": "gh", "h": "h", "l": "l", "r": "r", "w": "w", "j": "y",
    "ts": "ts", "kʷ": "kw", "gʷ": "gw",
}


def roman(segs):
    return "".join(ROMAN.get(s, s) for s in segs)

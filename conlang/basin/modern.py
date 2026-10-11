"""Modern Standard sentence synthesis.

Constructions are assembled at the Middle Basin stage (where the analytic
morphology arose) and then pushed through the Stage C rules, so clitics and
suffixes undergo the same final devoicing and vowel shift as everything else.
"""

from . import changes as ch
from .history import inflect, productive_suffix
from .phonology import is_vowel, roman

PERSON_SFX = {"1SG": "mi", "2SG": "si", "3SG": "ti", "1PL": "mes", "2PL": "te", "3PL": "nti"}


def elide(pieces):
    """Schwa at a vowel + vowel morpheme juncture is dropped."""
    out = [list(p) for p in pieces]
    for i in range(1, len(out)):
        prev, cur = out[i - 1][0], out[i][0]
        if prev and cur and is_vowel(prev[-1]) and is_vowel(cur[0]):
            if prev[-1] == "ə":
                out[i - 1][0] = prev[:-1]
            elif cur[0] == "ə":
                out[i][0] = cur[1:]
    return [tuple(p) for p in out]


def realize(pieces):
    """pieces: list of (mb_segs, gloss, sep) with sep in {'', '-', '='}.
    Returns (surface, segmented_surface, gloss)."""
    pieces = elide(pieces)
    flat, bounds = [], []
    for mb, _g, _sep in pieces:
        flat += mb
        bounds.append(len(flat))
    repaired = ch.b8_cluster_repair(flat)
    mod = ch.evolve(repaired, ch.STAGE_C_STD)
    surface = roman(mod)
    gloss = "".join((sep + g) for _m, g, sep in pieces)
    if len(repaired) != len(flat):
        return surface, surface, gloss.replace("-", ".").replace("=", ".")
    seg, start = "", 0
    for (mb, _g, sep), end in zip(pieces, bounds):
        seg += sep + roman(mod[start:end])
        start = end
    return surface, seg, gloss


class Grammar:
    def __init__(self, h):
        self.h = h
        self.lex = h.lexicon
        self.gram = h.gram
        self.pl = productive_suffix("ra")
        self.gen = productive_suffix("os")

    def _entry(self, key):
        return self.lex[key]

    def noun(self, key, pl=False, defn=False, gen=False):
        e = self._entry(key)
        label = key
        if pl and e.proto:
            pieces = [(inflect(e.proto, "ra")["mb"], f"{label}.PL", "")]
        elif pl:
            pieces = [(e.mb, label, ""), (self.pl, "PL", "-")]
        else:
            pieces = [(e.mb, label, "")]
        if gen:
            pieces.append((self.gen, "GEN", "-"))
        if defn:
            pieces.append((self.gram["DEF"]["mb"], "DEF", "="))
        return pieces

    def pron(self, key, gen=False):
        p = self.h.paradigms["pronouns_gen" if gen else "pronouns"][key]
        label = {"1sg": "1SG", "2sg": "2SG", "that": "3SG", "1pl": "1PL", "2pl": "2PL"}[key]
        return [(p["mb"], label + (".GEN" if gen else ""), "")]

    def verb(self, key, tense, person, fut=False):
        e = self._entry(key)
        sfx = ["ta"] if tense == "PST" else []
        mb = inflect(e.proto, *sfx, PERSON_SFX[person])["mb"]
        pieces = [(mb, f"{key}.{tense}.{person}", "")]
        if fut:
            pieces = [(self.gram["FUT"]["mb"], "FUT", "")] + [(mb, f"{key}.{tense}.{person}", "=")]
        return pieces

    def vnoun(self, key, prog=False):
        e = self._entry(key)
        pieces = [(inflect(e.proto, "ni")["mb"], f"{key}.NMLZ", "")]
        if prog:
            pieces.append((self.gram["PROG"]["mb"], "PROG", "="))
        return pieces

    def word(self, key, gloss=None):
        e = self._entry(key)
        return [(e.mb, gloss or key, "")]

    def particle(self, fn, gloss=None):
        return [(self.gram[fn]["mb"], gloss or fn, "")]


def sentences(h):
    g = Grammar(h)
    S = []

    S.append(("The herders drove the herd rimward.", [
        g.noun("herder", pl=True, defn=True), g.noun("herd", defn=True),
        g.word("rimward"), g.verb("drive", "PST", "3PL")]))

    S.append(("I will not eat the bread.", [
        g.pron("1sg"), g.noun("bread", defn=True),
        g.verb("eat", "PRS", "1SG", fut=True), g.particle("NEG")]))

    S.append(("The river gives, the mountain keeps. (proverb)", [
        g.noun("river", defn=True), g.verb("give", "PRS", "3SG"),
        g.noun("mountain", defn=True), g.verb("hold", "PRS", "3SG")]))

    S.append(("Is your granary full? (everyday greeting)", [
        g.pron("2sg", gen=True), g.word("granary"), g.word("full"),
        g.verb("be", "PRS", "3SG"), g.particle("Q")]))

    S.append(("Very full! (standard reply)", [
        g.word("very"), g.word("full"), g.verb("be", "PRS", "3SG")]))

    S.append(("Three cows stand beside the house.", [
        g.word("three"), g.particle("CL.HORN"), g.word("cattle"),
        g.noun("house", defn=True), g.particle("BESIDE", "beside"),
        g.verb("stand", "PRS", "3PL")]))

    S.append(("The boatmen are drifting hubward.", [
        g.noun("boatman", pl=True, defn=True), g.word("hubward"),
        g.vnoun("drift", prog=True), g.verb("be", "PRS", "3PL")]))

    S.append(("The stranger carried salt from the pass.", [
        g.noun("stranger", defn=True), g.noun("pass", defn=True),
        g.particle("FROM", "from"), g.word("salt"),
        g.verb("carry", "PST", "3SG")]))

    out = []
    for translation, words in S:
        rows = [realize(w) for w in words]
        out.append({
            "translation": translation,
            "surface": " ".join(r[0] for r in rows),
            "segmented": " ".join(r[1] for r in rows),
            "gloss": " ".join(r[2] for r in rows),
            "words": rows,
        })
    return out

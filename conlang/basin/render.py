"""Markdown/CSV output. Every form and number printed here is computed."""

import csv
import io
import unicodedata
from collections import Counter

from . import changes as ch
from .data import (CLASSIFIERS, CONSOLIDATION, DIRECTIONALS, GROUPS, LOANS,
                   MODERN_COMPOUNDS, PROTO_AFFIXES, ROOTS, SEED, SETTING)
from .history import NOUN_CELLS, PERSONS, inflect, productive_suffix
from .modern import sentences
from .phonology import ipa, is_vowel, roman
from .proto import (CODAS_FINAL, CODAS_MEDIAL, ONSETS, PARAMS,
                    _shape_weights)


def table(headers, rows):
    out = ["| " + " | ".join(headers) + " |",
           "|" + "|".join("---" for _ in headers) + "|"]
    for r in rows:
        out.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(out)


def ascii_name(s):
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if not unicodedata.combining(c))


def R(segs):
    return f"**{roman(segs)}**" if segs is not None else "—"


def I(segs):
    return f"/{ipa(segs)}/" if segs is not None else "—"


def pct(x):
    return f"{round(100 * x)}%"


# ------------------------------------------------------------------ helpers

def rule_examples(h):
    """First two lexicon words changed by each rule, in concept order."""
    ex = {}
    keys = [k for k, *_ in ROOTS] + [k for k in h.derived]
    for k in keys:
        e = h.etyma[k]
        for rules, start, label in ((ch.STAGE_A, e.proto, "A"),
                                    (ch.STAGE_B_STD, e.ob, "B"),
                                    (ch.STAGE_C_STD, e.mb, "C"),
                                    (ch.STAGE_C_RIM, e.mb_rim, "R")):
            tr = []
            ch.evolve(start, rules, tr)
            for code, before, after in tr:
                lst = ex.setdefault(code, [])
                if len(lst) < 2 and k not in [x[0] for x in lst]:
                    lst.append((k, before, after))
    return ex


def derivation(h, key):
    e = h.etyma[key]
    steps = [("Proto-Basin", "", e.proto)]
    for stage, rules, start in (("Old Basin", ch.STAGE_A, e.proto),
                                ("Middle Basin", ch.STAGE_B_STD, e.ob),
                                ("Modern Standard", ch.STAGE_C_STD, e.mb)):
        tr = []
        ch.evolve(start, rules, tr)
        for code, _b, after in tr:
            steps.append((stage, code, after))
    return steps


PLACE_MANNER = {
    "p": ("Stop", "Labial"), "b": ("Stop", "Labial"), "t": ("Stop", "Alveolar"),
    "d": ("Stop", "Alveolar"), "k": ("Stop", "Velar"), "g": ("Stop", "Velar"),
    "ts": ("Affricate", "Alveolar"), "tʃ": ("Affricate", "Postalveolar"),
    "dʒ": ("Affricate", "Postalveolar"), "f": ("Fricative", "Labiodental"),
    "v": ("Fricative", "Labiodental"), "θ": ("Fricative", "Dental"),
    "ð": ("Fricative", "Dental"), "s": ("Fricative", "Alveolar"),
    "z": ("Fricative", "Alveolar"), "ʃ": ("Fricative", "Postalveolar"),
    "ʒ": ("Fricative", "Postalveolar"), "x": ("Fricative", "Velar"),
    "ɣ": ("Fricative", "Velar"), "h": ("Fricative", "Glottal"),
    "m": ("Nasal", "Labial"), "n": ("Nasal", "Alveolar"), "ŋ": ("Nasal", "Velar"),
    "l": ("Lateral", "Alveolar"), "r": ("Rhotic", "Alveolar"),
    "w": ("Approximant", "Labial"), "j": ("Approximant", "Palatal"),
}
PLACES = ["Labial", "Labiodental", "Dental", "Alveolar", "Postalveolar", "Palatal", "Velar", "Glottal"]
MANNERS = ["Stop", "Affricate", "Fricative", "Nasal", "Lateral", "Rhotic", "Approximant"]


def consonant_chart(counts, marginal):
    rows = []
    for m in MANNERS:
        row = [m]
        for p in PLACES:
            cell = [s for s, (mm, pp) in PLACE_MANNER.items() if mm == m and pp == p and s in counts]
            row.append(" ".join(f"{s}" + ("†" if s in marginal else "") + f" ‹{roman([s])}›" for s in cell))
        if any(row[1:]):
            rows.append(row)
    used = [i for i in range(1, len(PLACES) + 1) if any(r[i] for r in rows)]
    return table(["", *[PLACES[i - 1] for i in used]], [[r[0], *[r[i] for i in used]] for r in rows])


def inventory(entries):
    counts, sources = Counter(), {}
    for e in entries:
        for s in e.mod or []:
            counts[s] += 1
            sources.setdefault(s, set()).add(e.origin.startswith("loan"))
    marginal = {s for s, src in sources.items() if src == {True}}
    return counts, marginal


def pos(e):
    return {"verb": "verb", "quality": "adjective", "number": "numeral",
            "pronoun": "function", "deixis": "function"}.get(e.field, "noun")


def skeleton(segs):
    return "".join("V" if is_vowel(s) else "C" for s in segs)


# ------------------------------------------------------------------ grammar

def render_grammar(h):
    lex = h.lexicon
    P = h.paradigms
    G = h.gram
    name = roman(lex["glossonym"].mod).capitalize()
    people = roman(lex["ethnonym"].mod).capitalize()
    hl_name = roman(lex["highlander"].mod).capitalize()
    current = [e for e in lex.values() if e.status in ("current", "narrowed")]
    out = []
    w = out.append

    # ------------------------------------------------------------ title
    w(f"# {name} ({ascii_name(name)}): reference grammar\n")
    w(f"*{name}* /{ipa(lex['glossonym'].mod)}/ is the language of the *{people}* "
      f"/{ipa(lex['ethnonym'].mod)}/, farmers, herders and river traders of a fertile "
      f"plain enclosed by a mountain ring. The name is an opaque Proto-Basin compound, "
      f"*{ipa(h.derived['glossonym'])} 'bowl-speech'; the people's name is "
      f"*{ipa(h.derived['ethnonym'])} 'bowl-person-COLLECTIVE'.\n")
    w(f"Every form in this document is produced by `generate.py` (seed `{SEED}`) from a "
      f"procedurally generated proto-language and an ordered set of historical processes. "
      f"Re-running the generator reproduces this file byte for byte.\n")

    # ------------------------------------------------------------ summary
    surviving = [c for c in ("GEN", "DAT", "ABL", "INS")
                 if P["noun_rates_std"].get(("NOM", c), 0) < .3]
    n_roots = len(ROOTS)
    n_slang = len(h.slang_results)
    n_std = sum(r["std"] for r in h.slang_results)
    w("## Summary\n")
    w(table(["Property", "Value"], [
        ["Word order", "SOV; postpositions; genitive–noun; numeral–classifier–noun"],
        ["Stress", "fixed, first syllable (inherited from Proto-Basin)"],
        ["Morphological type", "fusional verbs and inherited case suffixes + analytic tense/aspect, negation, definiteness"],
        ["Surviving cases", "NOM, " + ", ".join(surviving) + " (ACC and LOC lost; see §5)"],
        ["Number", f"plural suffix -{roman(productive_suffix('ra') or [])} (from a herders' collective)"],
        ["Definiteness", f"enclitic ={roman(G['DEF']['mod'])} (from 'that')"],
        ["Negation", f"postverbal {roman(G['NEG']['mod'])} (from 'seed')"],
        ["Spatial frame", "absolute: rimward / hubward / sunwise / nightwise"],
        ["Proto roots generated", n_roots],
        ["Lexicon entries (all strata)", len(lex)],
        ["Sound changes", f"{len(ch.STAGE_A)} (Old) + {len(ch.STAGE_B_STD)} (Middle) + {len(ch.STAGE_C_STD)} (Modern) + {len(ch.STAGE_C_RIM)} Rim-only"],
        ["Slang innovations modelled", f"{n_slang}; {n_std} became standard, {n_slang - n_std} stayed in-group"],
        ["Highland loanwords", len(LOANS)],
    ]))
    w("")

    # ------------------------------------------------------------ 1 factors
    w("## 1. Inputs: setting, derived parameters, social model\n")
    w("### 1.1 Setting\n")
    w(table(["Parameter", "Value"], [[k.replace("_", " "), v] for k, v in SETTING.items()]))
    w("")
    w("### 1.2 Parameters derived from the setting\n")
    w(table(["Parameter", "Value", "Derivation"], [
        ["open-syllable bias", PARAMS["open_syllable_bias"],
         "(mean temp − 5) / 25, clamped 0–1. Warmer climates show more open syllables in cross-linguistic samples (Ember & Ember 1999; Fought et al. 2004). Shifts proto root-shape weights toward CV/CVCV."],
        ["Basin ejectives", PARAMS["basin_ejectives"],
         "floor altitude < 1500 m. Ejectives correlate weakly with high-altitude homelands (Everett 2013; contested)."],
        ["Highland ejectives", PARAMS["highland_ejectives"],
         "Highland altitude ≥ 1500 m. Their loss in loans is a diagnostic of borrowing (§11.3)."],
        ["Lexical density by field", "§2.4", "More roots in culturally salient domains (water, crops, herding)."],
        ["Contact layers", "2", "Early (Old Basin) and late (Middle Basin) Highland loans, nativized by the phonology of the period."],
        ["Prestige register", "scribes", "Granary record-keepers re-borrow written Old Basin words (§11.4)."],
    ]))
    w("")
    w("### 1.3 Social groups (sources of innovation)\n")
    w("`reach` = how far the group's speech travels through the social network (loose, wide networks spread change; Milroy & Milroy 1985). "
      "`prestige` = how much other speakers imitate the group.\n")
    w(table(["Group", "Reach", "Prestige", "Profile"],
            [[g, v["reach"], v["prestige"], v["desc"]] for g, v in GROUPS.items()]))
    w("")

    # ------------------------------------------------------------ 2 proto
    w("## 2. Proto-Basin\n")
    w("### 2.1 Inventory\n")
    w("Consonants: " + ", ".join(f"*{c}" for c in ONSETS) +
      ". Vowels: *a *e *i *o *u. *h is a laryngeal; its only trace in the daughter stages is length on a preceding vowel (A1).\n")
    w("Onset weights (relative frequency used by the generator): " +
      ", ".join(f"{k} {v}" for k, v in ONSETS.items()) + ".\n")
    w("Medial codas: " + ", ".join(CODAS_MEDIAL) + "; final codas: " + ", ".join(CODAS_FINAL) +
      ". A medial nasal is homorganic with the following stop. No root repeats a consonant; *w, *j and the labiovelars do not precede rounded/front vowels of the same place.\n")
    w("### 2.2 Root shapes\n")
    sw = _shape_weights("")
    tot = sum(sw.values())
    w(table(["Shape", "Weight", "Share"], [[s, round(v, 1), pct(v / tot)] for s, v in sw.items()]))
    w("\nFunction words (pronouns, demonstratives, copula) are drawn from CV/CVC only. "
      "Sound symbolism: concepts tagged *small* favour *i, *e; concepts tagged *big* favour *a, *o, *u.\n")
    w("### 2.3 Morphology\n")
    w(table(["Category", "Suffix"], [
        *[[c, "*-" + s if s else "∅"] for c, s in NOUN_CELLS],
        *[["verb " + p, "*-" + s] for p, s in PERSONS],
        ["past", "*-ta- (before person)"],
        *[[k.strip("-"), "*-" + v] for k, v in PROTO_AFFIXES.items()],
    ]))
    w("\nAt a vowel + vowel morpheme boundary the stem vowel elides. Compounds are modifier–head.\n")
    w("### 2.4 Lexical density by semantic field\n")
    fc = Counter(f for _k, _g, f, _s, _t in ROOTS)
    w(table(["Field", "Roots"], fc.most_common()))
    w("")

    # ------------------------------------------------------------ 3 sound changes
    w("## 3. Sound changes\n")
    w("Rules apply in the order listed. Examples are the first words in the concept list that each rule changes.\n")
    ex = rule_examples(h)
    for title, rules in (("3.1 Proto-Basin → Old Basin", ch.STAGE_A),
                         ("3.2 Old Basin → Middle Basin", ch.STAGE_B_STD),
                         ("3.3 Middle Basin → Modern Standard", ch.STAGE_C_STD),
                         ("3.4 Middle Basin → Modern Rim dialect (Rim skips B7)", ch.STAGE_C_RIM)):
        w(f"### {title}\n")
        rows = []
        for r in rules:
            e = "; ".join(f"'{k}' {ipa(b)} → {ipa(a)}" for k, b, a in ex.get(r.code, [])) or "—"
            rows.append([r.code, r.name, f"`{r.statement}`", r.why, e])
        w(table(["#", "Process", "Rule", "Motivation", "Examples"], rows))
        w("")
    w("### 3.5 Worked derivations\n")
    for key in ("grain", "granary", "glossonym", "bread", "sleep"):
        steps = derivation(h, key)
        w(f"**'{lex[key].gloss if key in lex else key}'**: " + " → ".join(
            (f"*{ipa(f)}" if st == "Proto-Basin" else f"{ipa(f)} ({code})") for st, code, f in steps)
          + f" = **{roman(steps[-1][2])}**\n")
    w("")

    # ------------------------------------------------------------ 4 phonology
    w("## 4. Modern Standard phonology\n")
    counts, marginal = inventory(current)
    w("### 4.1 Consonants\n")
    w("IPA with romanization in ‹›. † = occurs only in loanwords (marginal phoneme).\n")
    w(consonant_chart(counts, marginal))
    w("\n### 4.2 Vowels\n")
    vs = [s for s in counts if is_vowel(s)]
    order = ["i", "y", "e", "ø", "ə", "a", "o", "u", "iː", "yː", "eː", "øː", "aː", "ɔː", "oː", "uː", "ei", "øy", "ou"]
    w(table(["Vowel", "Romanized", "Tokens in lexicon"],
            [[v, roman([v]), counts[v]] for v in order if v in vs]))
    w("\nShort *ë* /ə/ occurs only in unstressed syllables. Long /aː/ was lost in the Standard (C2: aː → ɔː *å*); "
      "it survives in the Rim dialect and in learned words is replaced by short *a*.\n")
    w("### 4.3 Word shapes\n")
    sk = Counter(skeleton(e.mod) for e in current if e.mod)
    w(table(["Shape", "Count"], sk.most_common(10)))
    w("\n### 4.4 Productive alternations\n")
    w("- **Final devoicing** (C1): voiced obstruents alternate with voiceless ones at the word edge: "
      f"'grain' {R(lex['grain'].mod)}, GEN {R(inflect(h.roots['grain'], 'os')['mod'])}.\n"
      "- **Umlaut** (B1): a back stem vowel fronts in forms that once had *-i: LOC, INS, and the 1SG/2SG/3SG/3PL verb forms "
      f"('give' 1PL {R(inflect(h.roots['give'], 'mes')['mod'])} vs 3SG {R(inflect(h.roots['give'], 'ti')['mod'])}).\n"
      "- **Velar palatalization** (A5): stem-final velars alternate with palato-alveolars before old front-vowel suffixes "
      f"('eye' {R(inflect(h.roots['eye'])['mod'])}, GEN {R(inflect(h.roots['eye'], 'os')['mod'])}, old PL {R(inflect(h.roots['eye'], 'es')['mod'])}).\n"
      "- **Nasal assimilation** (B8) across clitic boundaries: 'house' "
      f"{R(lex['house'].mod)} + ={roman(G['DEF']['mod'])} → {R(ch.evolve(ch.b8_cluster_repair(lex['house'].mb + G['DEF']['mb']), ch.STAGE_C_STD))}.\n")

    # ------------------------------------------------------------ 5 nouns
    w("## 5. Nouns\n")
    w("### 5.1 Case erosion (computed over all inherited nouns)\n")
    w(f"Each Proto-Basin case form of every inherited noun ({len(P['nouns'])} nouns) was run through the sound changes. "
      "The table gives the share of nouns in which two paradigm cells became identical. "
      "A merger affecting ≥ 30% of nouns is treated as functionally ambiguous and triggers a repair.\n")
    rows = sorted(P["noun_rates_std"].items(), key=lambda x: -x[1])
    w(table(["Cells", "Merged (Standard)", "Merged (Rim)", "Consequence"], [
        [f"{a} = {b}", pct(r), pct(P["noun_rates_rim"].get((a, b), 0)),
         {"GEN = PL": "inherited plural abandoned; collective *-ra becomes the plural",
          "NOM = ACC": "accusative lost; objects unmarked, SOV order fixed",
          "NOM = LOC": "locative replaced by postposition 'in' (< 'belly')",
          "ACC = LOC": "(follows from the two above)"}.get(f"{a} = {b}", "tolerated" if r < .3 else "repaired")]
        for (a, b), r in rows if r >= .03]))
    w("")
    w("### 5.2 Modern paradigms\n")
    w("Old LOC forms survive only as fossilized adverbs; the old plural is replaced by the collective.\n")
    cells = ["NOM", "GEN", "DAT", "ABL", "INS", "COLL", "LOC"]
    hdr = ["Noun", "NOM", "GEN", "DAT", "ABL", "INS", "PL (< COLL)", "old LOC (fossil)"]
    w(table(hdr, [[f"'{k}'"] + [roman(P["nouns"][k][c]["mod"]) for c in cells]
                  for k, _p in P["noun_samples"]]))
    w("")
    sfx = P["suffix"]
    w(f"Productive endings for nouns that entered after the Old period (loans, slang compounds): "
      f"GEN -{roman(sfx['GEN'])}, DAT -{roman(sfx['DAT'])}, ABL -{roman(sfx['ABL'])}, PL -{roman(sfx['COLL'])}.\n")
    w("### 5.3 Definiteness\n")
    w(f"The distal demonstrative 'that' ({R(G['DEF']['src_mb'])} in Middle Basin) reduced to an enclitic "
      f"={roman(G['DEF']['mod'])}, attached to the last word of the noun phrase. The full form {R(lex['that'].mod)} remains the "
      "3rd-person pronoun. Indefinite nouns are bare.\n")
    w("### 5.4 Postpositions\n")
    pp = [k for k in ("PROG", "ON", "BEHIND", "BEFORE", "UNDER", "BESIDE", "WITH", "TO", "FROM")]
    w(table(["Postposition", "Meaning", "Source (Middle Basin)", "Path"],
            [[R(G[k]["mod"]), G[k]["label"] if k != "PROG" else "'in, inside'; also progressive",
              f"'{G[k]['src']}' {I(G[k]['src_mb'])}", G[k]["why"]] for k in pp]))
    w("")
    if "summit" in lex:
        w(f"'On' {R(G['ON']['mod'])} comes from the inherited word for 'head', which as a noun was displaced by herders' slang "
          f"'gourd' {R(lex['head'].mod)} and survives lexically only as 'summit' {R(lex['summit'].mod)}.\n")
    w("### 5.5 Numeral classifiers\n")
    w("A numeral cannot modify a noun directly; a classifier intervenes. The system was spread by market traders counting goods by measure units.\n")
    w(table(["Classifier", "Used for", "Source"],
            [[R(G[c]["mod"]), use, f"'{src}' {R(lex[src].mod)}"] for c, use, src in CLASSIFIERS]))
    w("")

    # ------------------------------------------------------------ 6 pronouns
    w("## 6. Pronouns\n")
    rows = []
    for k, lab in (("1sg", "1SG"), ("2sg", "2SG"), ("that", "3SG/3PL"), ("1pl", "1PL"), ("2pl", "2PL")):
        g = P["pronouns_gen"][k]
        rows.append([lab, R(P["pronouns"][k]["mod"]), R(g["mod"]) + (" (re-formed)" if g.get("reformed") else "")])
    w(table(["Person", "Independent", "Possessive"], rows))
    if P["pron_reformed"]:
        old = inflect(h.roots[P["pron_reformed"][0]], "os")["mod"]
        w(f"\nThe inherited 1PL and 2PL possessives both became {R(old)} (A4 turned *kʷ into *k before *o). "
          "Speakers rebuilt both from the independent pronoun + the productive genitive ending.\n")
    w("")

    # ------------------------------------------------------------ 7 verbs
    w("## 7. Verbs\n")
    w("### 7.1 Person endings and their erosion\n")
    rows = sorted(P["verb_rates_std"].items(), key=lambda x: -x[1])
    w(table(["Cells", "Merged (Standard)", "Merged (Rim)"],
            [[f"{a} = {b}", pct(r), pct(P["verb_rates_rim"].get((a, b), 0))] for (a, b), r in rows if r >= .1]))
    if P["verb_rates_std"].get(("PRS.3SG", "PRS.2PL"), 0) >= .3:
        w(f"\n3SG and 2PL fell together in {pct(P['verb_rates_std'][('PRS.3SG', 'PRS.2PL')])} of verbs (present) and "
          f"{pct(P['verb_rates_std'].get(('PST.3SG', 'PST.2PL'), 0))} (past): *-ti and *-te both reduced to -ë, -dhë or -th "
          "depending on the stem. Consequence: subject pronouns are obligatory in all persons; "
          "a finite verb without an overt subject is read as 3rd person.\n")
    w("### 7.2 Sample paradigms\n")
    for k, _p in P["verb_samples"]:
        row = P["verbs"][k]
        w(f"**'{k}'** (*{ipa(h.roots[k])})\n")
        w(table(["", *[p for p, _ in PERSONS]],
                [["Present", *[roman(row["PRS." + p]["mod"]) for p, _ in PERSONS]],
                 ["Past", *[roman(row["PST." + p]["mod"]) for p, _ in PERSONS]]]))
        w(f"\nVerbal noun: {R(row['NMLZ']['mod'])}\n")
    w("### 7.3 Analytic tense, aspect, negation\n")
    w(table(["Category", "Marker", "Position", "Source", "Path"], [
        ["Future", R(G["FUT"]["mod"]), "proclitic on the present", f"'go' {I(G['FUT']['src_mb'])}", G["FUT"]["why"]],
        ["Progressive", R(G["PROG"]["mod"]), "enclitic on the verbal noun + copula", f"'belly' {I(G['PROG']['src_mb'])}", G["PROG"]["why"]],
        ["Negation", R(G["NEG"]["mod"]), "after the verb", f"'seed' {I(G['NEG']['src_mb'])}", G["NEG"]["why"]],
        ["Polar question", R(G["Q"]["mod"]), "clause-final", f"'what' {I(G['Q']['src_mb'])}", G["Q"]["why"]],
    ]))
    neg_old = h.etyma["neg"]
    w(f"\n**Negation cycle.** Old Basin: *{ipa(neg_old.ob)}* + verb. Middle Basin: farmers' emphatic "
      f"*{ipa(ch.erode(neg_old.mb, 2))}* + verb + *{ipa(h.etyma['seed'].mb)}* 'not a seed'. "
      f"The preverbal particle, reduced to a schwa syllable, dropped; Modern Standard: verb + **{roman(G['NEG']['mod'])}**. "
      f"The full noun 'seed' is still {R(lex['seed'].mod)}; the negator kept only its first syllable.\n")

    # ------------------------------------------------------------ 8 numerals
    w("## 8. Numerals\n")
    nums = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "twenty", "hundred"]
    w(table(["Value", "Modern", "Proto-Basin", "Note"], [
        [n, R(lex[n].mod), "*" + ipa(lex[n].proto),
         "opaque *five + n" if n in ("six", "seven", "eight", "nine") else
         "*two + ten" if n == "twenty" else "*big + ten" if n == "hundred" else ""]
        for n in nums]))
    five = next(r for r in h.slang_results if r["target"] == "five")
    w(f"\nMarket traders counted 'hand' for five; the usage scored {five['score']:.3f} (threshold {CONSOLIDATION['threshold_standard']}) "
      f"and stayed a market-register word: {R(five['form'].mod)}. Numerals have very high replacement resistance.\n")

    # ------------------------------------------------------------ 9 space
    w("## 9. Spatial reference\n")
    w("Because the mountain ring is visible from every point of the plain and every river flows from rim to centre, "
      "speakers use a basin-relative absolute frame instead of left/right for anything larger than the body. "
      "'Rimward' is also 'upstream'; 'hubward' is also 'downstream'.\n")
    w(table(["Term", "Meaning", "Formation"],
            [[R(lex[k].mod), g, f"'{n}' {R(lex[n].mod)} + -{roman(G['WARD']['mod'])} (< 'road')"] for k, g, n in DIRECTIONALS]))
    w("")

    # ------------------------------------------------------------ 10 syntax
    w("## 10. Syntax\n")
    w("- Clause: Subject – Object – (Adverbial) – Verb – NEG – Q.\n"
      "- Noun phrase: Possessor – Numeral – Classifier – Adjective – Noun – PL –=DEF – Postposition.\n"
      "- Subjects are always overt (see §7.1). Objects are unmarked; definiteness is marked by =DEF.\n"
      "- Polar questions add the clause-final particle; content questions put the question word in situ.\n"
      "- Progressive: verbal noun =PROG + copula agreeing with the subject.\n")

    # ------------------------------------------------------------ 11 lexical history
    w("## 11. Lexical history and society\n")
    w("### 11.1 Slang consolidation\n")
    c = CONSOLIDATION
    w("Each candidate innovation is scored:\n")
    w("```\n"
      f"social      = {c['w_reach']} × reach + {c['w_prestige']} × prestige\n"
      f"stability'  = stability − {c['homophony_penalty']} (if the old word is homophonous with another word in Middle Basin)\n"
      f"                        − {c['erosion_penalty']} (if the old word eroded to ≤ 2 segments)\n"
      f"score       = social × expressiveness × (1 − stability') × era + noise(±{c['noise']}, seeded)\n"
      f"era         = {c['era_multiplier']['old']} for Old-period slang (more generations to spread), 1.0 for Middle\n"
      f"Standard adopts if score ≥ {c['threshold_standard']}; the Rim adopts if score ≥ {c['threshold_rim']}\n"
      "```\n")
    w("Stability values are hand-set, ordered after published lexical replacement-rate rankings (Pagel, Atkinson & Meade 2007): "
      "pronouns and low numerals change slowest; evaluatives, intensifiers, expressive body-part words ('head') and taboo "
      "targets ('die', 'kill') fastest. Homophony as a driver of replacement follows Gilliéron's gallus/cattus case in Gascon.\n")
    rows = []
    for r in sorted(h.slang_results, key=lambda r: -r["score"]):
        pen = []
        if r["clash"]:
            pen.append("homophone of " + ", ".join(f"'{x}'" for x in r["clash"]))
        if r["eroded"]:
            pen.append("eroded")
        rows.append([f"'{r['target']}'", " + ".join(f"'{p}'" for p in r["parts"]), r["mech"], r["group"], r["era"],
                     r["expr"], f"{r['stab']}" + (f" → {r['eff_stab']:.2f}" if pen else ""), "; ".join(pen) or "—",
                     f"{r['score']:.3f}", "yes" if r["std"] else "no", "yes" if r["rim"] else "no",
                     R(r["form"].mod)])
    w(table(["Target", "Source", "Mechanism", "Group", "Era", "Expr.", "Stability", "Pressure", "Score", "Standard", "Rim", "Form"], rows))
    w("\n**Fate of displaced words.**\n")
    rows = []
    for r in h.slang_results:
        if not r["std"]:
            continue
        old = r["old"]
        if r["fate"]:
            fate = f"narrowed to '{r['fate'][1]}'"
        else:
            fate = "obsolete (fixed phrases only)"
        rows.append([f"'{r['target']}'", R(old.mod), fate, r["why"]])
    w(table(["Concept", "Inherited word", "Fate", "Social motivation of the replacement"], rows))
    w("")
    w("### 11.2 Homophony created by sound change\n")
    w(table(["Middle Basin form", "Words", "Outcome"], [
        [f"/{f}/", ", ".join(f"'{k}'" for k in ks),
         "resolved by replacement" if any(r["target"] in ks and r["std"] for r in h.slang_results)
         else "tolerated (different word classes)" if len({pos(lex[k]) for k in ks}) > 1 else "tolerated; same word class, disambiguated by context"]
        for f, ks in h.homophones_mb]))
    w("")
    w("### 11.3 Highland loanwords\n")
    w(f"The Highland language (Basin name *{hl_name}*) has ejectives, uvulars and initial clusters. "
      "Loans were nativized by the phonology of the period of borrowing, so two layers are distinguishable:\n")
    w("- **Early** (into Old Basin): ejectives → plain, uvulars → velar, *ts, ʃ* → *s*, clusters broken by a copy vowel. "
      "They then underwent all Middle and Modern changes, but they arrived after intervocalic voicing (A6) and palatalization (A5), "
      "so they keep intervocalic voiceless stops and *k* before front vowels — a diagnostic of borrowing.\n"
      "- **Late** (into Middle Basin): ejectives → plain, *q* → *k*, but *χ* → /x/ ‹kh›, and *ts*, *ʃ* kept: the loans introduced three new marginal phonemes. "
      "Clusters broken by schwa.\n")
    rows = []
    for k, g, layer in LOANS:
        e = lex[k]
        rows.append([g, layer, f"/{ipa(h.highland[k])}/", I(e.ob) if e.ob else "—", I(e.mb), R(e.mod)])
    w(table(["Meaning", "Layer", "Highland", "Old Basin", "Middle Basin", "Modern"], rows))
    w("")
    w("### 11.4 Learned doublets\n")
    w("Granary scribes kept records in Old Basin spelling. From the Modern period they re-borrowed written words with a reading "
      "pronunciation (long vowels read short, unstressed vowels read full, no lenition). Each learned word coexists with its "
      "inherited descendant, which keeps the everyday sense.\n")
    rows = []
    for k in [x for x in lex if x.endswith("_learned")]:
        base = k[:-8]
        rows.append([f"'{base}'", R(h.etyma[base].mod), R(lex[k].mod), lex[k].gloss])
    w(table(["Source", "Inherited", "Learned", "Learned meaning"], rows))
    if h.learned_skipped:
        w(f"\nNo doublet arose for {', '.join(repr(x) for x in h.learned_skipped)}: the inherited form was already identical to the reading pronunciation.\n")
    w("")
    w("### 11.5 Opaque vs transparent compounds\n")
    w("Proto-Basin compounds went through every sound change and are no longer analysable; Modern compounds are transparent.\n")
    rows = []
    for k in ("granary", "boatman", "harvest", "lineage", "hundred"):
        e = h.etyma[k]
        rows.append([e.gloss, "*" + ipa(e.proto), R(e.mod), "opaque"])
    for k, g, parts in MODERN_COMPOUNDS:
        rows.append([g, " + ".join(roman(lex[p].mod) for p in parts), R(lex[k].mod), "transparent"])
    w(table(["Meaning", "Parts", "Modern", "Status"], rows))
    w("")

    # ------------------------------------------------------------ 12 dialects
    w("## 12. Dialects: Standard and Rim\n")
    w("The Standard is the speech of the river towns and the granary court. The Rim dialect is spoken in the foothill villages "
      "nearest the passes: smaller, denser networks and more Highland contact. Differences, all computed:\n")
    w("- **No apocope (B7)**: final schwa kept, so more endings survive; it is then lowered to -a (R2).\n"
      "- **No long-vowel shift (C2)**: /aː eː iː oː uː/ kept.\n"
      "- **No w → v, no dʒ → ʒ.**\n"
      "- **ð → d** (R1), matching the Highland lack of dental fricatives.\n"
      f"- **Fewer lexical innovations**: adoption threshold {c['threshold_rim']} vs {c['threshold_standard']}.\n")
    rows = []
    for k in ("water", "tooth", "bread", "star", "father", "field", "spring", "grain", "sun", "hearth",
              "village", "thaw", "eat", "small", "stranger", "quick", "rimward"):
        e = lex[k]
        rows.append([f"'{k}'", R(e.mod), R(e.rim), e.rim_note])
    w(table(["Concept", "Standard", "Rim", "Note"], rows))
    nl = P["noun_rates_rim"].get(("NOM", "ACC"), 0)
    w(f"\nBecause the Rim kept the final vowel, NOM and ACC merged in {pct(nl)} of nouns there vs "
      f"{pct(P['noun_rates_std'].get(('NOM', 'ACC'), 0))} in the Standard; Rim speakers still mark many objects.\n")

    # ------------------------------------------------------------ 13 texts
    w("## 13. Texts\n")
    w("Interlinear glosses follow the Leipzig conventions: `-` suffix, `=` clitic, `.` fused categories.\n")
    for i, s in enumerate(sentences(h), 1):
        w(f"**{i}.** *{s['surface']}*\n")
        w("```\n" + _align(s["words"]) + "\n```")
        w(f"'{s['translation']}'\n")

    # ------------------------------------------------------------ 14 repro
    w("## 14. Reproducing and varying\n")
    w("```\npython3 generate.py            # rewrites output/\n```\n")
    w("- Change `SEED` in `basin/data.py` to generate a different proto-language; all history re-runs on the new roots.\n"
      "- Change `SETTING` (temperature, altitudes) to shift derived parameters.\n"
      "- Change `GROUPS` or `CONSOLIDATION` to change which slang becomes standard.\n"
      "- Reorder or edit rules in `basin/changes.py` to change the sound history.\n")
    return "\n".join(out) + "\n"


def _align(words):
    segs = [wd[1] for wd in words]
    gls = [wd[2] for wd in words]
    widths = [max(len(a), len(b)) for a, b in zip(segs, gls)]
    l1 = "  ".join(a.ljust(n) for a, n in zip(segs, widths)).rstrip()
    l2 = "  ".join(b.ljust(n) for b, n in zip(gls, widths)).rstrip()
    return l1 + "\n" + l2


# ------------------------------------------------------------------ lexicon

LEX_COLS = ["key", "modern", "modern_ipa", "rim", "gloss", "field", "status",
            "origin", "middle_basin", "old_basin", "proto", "etymology"]


def lexicon_rows(h):
    rows = []
    for k, e in h.lexicon.items():
        rows.append({
            "key": k, "modern": roman(e.mod), "modern_ipa": ipa(e.mod),
            "rim": roman(e.rim) if e.rim else "", "gloss": e.gloss, "field": e.field,
            "status": e.status, "origin": e.origin,
            "middle_basin": ipa(e.mb) if e.mb else "", "old_basin": ipa(e.ob) if e.ob else "",
            "proto": "*" + ipa(e.proto) if e.proto else "", "etymology": e.etym,
        })
    rows.sort(key=lambda r: (r["modern"], r["key"]))
    return rows


def render_lexicon_md(h):
    rows = lexicon_rows(h)
    name = roman(h.lexicon["glossonym"].mod).capitalize()
    out = [f"# {name} lexicon\n",
           f"{len(rows)} entries, sorted by Modern Standard form. Status: *current* = standard word; "
           "*narrowed* = inherited word that lost its basic sense to slang; *register* = slang that never standardized; "
           "*obsolete* = displaced, fixed phrases only.\n",
           table(["Modern", "IPA", "Rim", "Meaning", "Status", "Origin", "Middle", "Old", "Proto"],
                 [[f"**{r['modern']}**", f"/{r['modern_ipa']}/", r["rim"], r["gloss"], r["status"], r["origin"],
                   r["middle_basin"], r["old_basin"], r["proto"]] for r in rows]),
           "\n## Etymological notes\n"]
    for r in rows:
        if r["origin"] != "inherited":
            out.append(f"- **{r['modern']}** '{r['gloss']}': {r['etymology']}")
    return "\n".join(out) + "\n"


def render_lexicon_csv(h):
    buf = io.StringIO()
    wr = csv.DictWriter(buf, fieldnames=LEX_COLS, lineterminator="\n")
    wr.writeheader()
    for r in lexicon_rows(h):
        wr.writerow(r)
    return buf.getvalue()

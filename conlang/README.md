# Döspëvnë: a procedurally evolved conlang

Language of a farming, herding and river-trading people on a fertile plain ringed by mountains.
Nothing in the output is hand-written. A seeded generator builds a proto-language, then runs
three stages of history over it (Old, Middle, Modern): sound change, contact, slang becoming standard,
scribal borrowing, grammaticalization, and dialect divergence.

- `output/grammar.md`: reference grammar (phonology, morphology, syntax, history, dialects, glossed texts)
- `output/lexicon.md`, `output/lexicon.csv`: 256 entries with forms at every stage and etymologies

## Run

```
python3 generate.py          # rewrite output/
python3 generate.py --check  # exit 1 if output/ is stale
```

Python 3.10+, standard library only. The output is the same on every run (per-concept seeded
RNGs, no reliance on hash order).

## Pipeline

| Step | What is computed | Where |
|---|---|---|
| 1. Setting → parameters | Climate sets an open-syllable bias on root shapes. Altitude gives the Highland neighbours ejectives and leaves the Basin without them. | `proto.derived_parameters` |
| 2. Proto-Basin | 182 roots, generated under phonotactic constraints and sound-symbolic vowel bias. Crops, herding and water get more roots because they matter more to this culture. 20 proto compounds/derivatives. | `proto.py`, `data.ROOTS` |
| 3. Sound change | 7 Old + 8 Middle + 4 Modern ordered rules, plus a Rim-dialect branch. Each rule is a known natural process (lenition, umlaut, reduction, apocope, chain shift). | `changes.py` |
| 4. Contact | Highland words generated in their own phonology, borrowed in two layers. Each layer is nativized by the phonology of its period, so the layers can be told apart. | `history.nativize_*` |
| 5. Slang → standard | 20 in-group innovations scored on group reach and prestige, expressiveness, word stability, homophony and erosion pressure. 12 standardize; displaced words narrow or go obsolete. | `history._slang`, `data.SLANG` |
| 6. Learned layer | Scribes re-borrow written Old Basin words, which creates doublets. | `history._learned` |
| 7. Grammaticalization | Future from 'go', negator from 'seed' (Jespersen cycle), article from 'that', postpositions from body parts, classifiers from measure nouns, directionals from 'road'. | `history._grammaticalize` |
| 8. Paradigm erosion | Every inherited noun and verb is inflected in Proto and evolved. Mergers are measured across the whole lexicon, and a merger affecting ≥30% of stems triggers a repair. | `history._paradigms` |
| 9. Texts | Sentences are assembled at the Middle stage and run through Modern rules, so the clitics undergo sandhi too. | `modern.py` |

## What is specified vs computed

Specified by hand (`basin/data.py`): the concept list and stability values, the rule set and its
order, the social groups and their parameters, which slang candidates exist and what they are
built from, grammaticalization sources, and basic syntax (SOV).

Computed: every form at every stage, which slang becomes standard (in the Standard and in the
Rim), which case and person distinctions survive, which repairs fire, the homophones, the
Modern phoneme inventory, the dialect differences, and the glossed texts.

## Selected results

- 'head' → *dalgë* (< 'gourd', herders). Sound change had made the inherited 'head' homophonous with 'go'. The old word survives as *koth* 'summit' and as the postposition 'on'.
- 'very' → *pas* (< 'flood', boatmen); 'good' → *ka* (< 'fat', youth); 'die' → *gal* (< 'lie fallow', farmers' euphemism).
- 'five' ← 'hand' (market traders) **failed** because numerals resist replacement. It stays a market-register word.
- Genitive and plural merged in 73% of nouns, so the herders' collective *-rë* became the plural.
- Negation: *tol* V → *tə* V *lej* → V ***ley*** ('not a seed').
- Spatial frame: *salko* 'rimward', *nothko* 'hubward', *tengko* 'sunwise', *veko* 'nightwise'.

```
yos=pë     döth          sal=pë        riktë
river=DEF  give.PRS.3SG  mountain=DEF  hold.PRS.3SG
'The river gives, the mountain keeps.'
```

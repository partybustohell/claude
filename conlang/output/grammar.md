# Döspëvnë (Dospevne): reference grammar

*Döspëvnë* /døspəvnə/ is the language of the *Doslënrë* /doslənrə/, farmers, herders and river traders of a fertile plain enclosed by a mountain ring. The name is an opaque Proto-Basin compound, *doskʷibeni 'bowl-speech'; the people's name is *doslamara 'bowl-person-COLLECTIVE'.

Every form in this document is produced by `generate.py` (seed `ringed-basin/v1`) from a procedurally generated proto-language and an ordered set of historical processes. Re-running the generator reproduces this file byte for byte.

## Summary

| Property | Value |
|---|---|
| Word order | SOV; postpositions; genitive–noun; numeral–classifier–noun |
| Stress | fixed, first syllable (inherited from Proto-Basin) |
| Morphological type | fusional verbs and inherited case suffixes + analytic tense/aspect, negation, definiteness |
| Surviving cases | NOM, GEN, DAT, ABL, INS (ACC and LOC lost; see §5) |
| Number | plural suffix -rë (from a herders' collective) |
| Definiteness | enclitic =pë (from 'that') |
| Negation | postverbal ley (from 'seed') |
| Spatial frame | absolute: rimward / hubward / sunwise / nightwise |
| Proto roots generated | 182 |
| Lexicon entries (all strata) | 256 |
| Sound changes | 7 (Old) + 8 (Middle) + 4 (Modern) + 2 Rim-only |
| Slang innovations modelled | 20; 12 became standard, 8 stayed in-group |
| Highland loanwords | 14 |

## 1. Inputs: setting, derived parameters, social model

### 1.1 Setting

| Parameter | Value |
|---|---|
| basin floor altitude m | 350 |
| rim altitude m | 2900 |
| pass altitude m | 1900 |
| mean annual temp c | 15 |
| annual rain mm | 650 |
| water source | snowmelt rivers draining from the rim to a central marsh |
| economy | irrigated cereals, cattle, river transport, market towns |
| population estimate | 400000 |
| contact | Highland pastoralists who control the passes |

### 1.2 Parameters derived from the setting

| Parameter | Value | Derivation |
|---|---|---|
| open-syllable bias | 0.4 | (mean temp − 5) / 25, clamped 0–1. Warmer climates show more open syllables in cross-linguistic samples (Ember & Ember 1999; Fought et al. 2004). Shifts proto root-shape weights toward CV/CVCV. |
| Basin ejectives | False | floor altitude < 1500 m. Ejectives correlate weakly with high-altitude homelands (Everett 2013; contested). |
| Highland ejectives | True | Highland altitude ≥ 1500 m. Their loss in loans is a diagnostic of borrowing (§11.3). |
| Lexical density by field | §2.4 | More roots in culturally salient domains (water, crops, herding). |
| Contact layers | 2 | Early (Old Basin) and late (Middle Basin) Highland loans, nativized by the phonology of the period. |
| Prestige register | scribes | Granary record-keepers re-borrow written Old Basin words (§11.4). |

### 1.3 Social groups (sources of innovation)

`reach` = how far the group's speech travels through the social network (loose, wide networks spread change; Milroy & Milroy 1985). `prestige` = how much other speakers imitate the group.

| Group | Reach | Prestige | Profile |
|---|---|---|---|
| boatmen | 0.75 | 0.25 | river transport crews; link every riverside settlement |
| market | 0.85 | 0.5 | market-town traders; daily contact with all other groups |
| farmers | 0.6 | 0.35 | majority population; dense village networks |
| herders | 0.55 | 0.3 | cattle drovers moving between pastures and markets |
| youth | 0.65 | 0.15 | age-grade slang; spreads by generational turnover |
| guards | 0.35 | 0.45 | pass-wardens and armed retainers of the granary lords |
| scribes | 0.3 | 0.9 | granary record-keepers; source of learned vocabulary |

## 2. Proto-Basin

### 2.1 Inventory

Consonants: *t, *k, *p, *s, *m, *n, *l, *r, *d, *g, *b, *h, *w, *j, *kʷ, *gʷ. Vowels: *a *e *i *o *u. *h is a laryngeal; its only trace in the daughter stages is length on a preceding vowel (A1).

Onset weights (relative frequency used by the generator): t 10, k 9, p 7, s 8, m 7, n 8, l 6, r 2, d 6, g 5, b 4, h 5, w 4, j 3, kʷ 4, gʷ 2.

Medial codas: n, r, l, s, m, h; final codas: n, r, l, s, m, h, t, k. A medial nasal is homorganic with the following stop. No root repeats a consonant; *w, *j and the labiovelars do not precede rounded/front vowels of the same place.

### 2.2 Root shapes

| Shape | Weight | Share |
|---|---|---|
| CV | 5.6 | 6% |
| CVCV | 28.8 | 32% |
| VCV | 3.8 | 4% |
| CVC | 30.0 | 33% |
| CVCCV | 12 | 13% |
| CVCVC | 10.4 | 11% |

Function words (pronouns, demonstratives, copula) are drawn from CV/CVC only. Sound symbolism: concepts tagged *small* favour *i, *e; concepts tagged *big* favour *a, *o, *u.

### 2.3 Morphology

| Category | Suffix |
|---|---|
| NOM | ∅ |
| ACC | *-em |
| GEN | *-os |
| DAT | *-ei |
| LOC | *-i |
| ABL | *-et |
| INS | *-bi |
| PL | *-es |
| COLL | *-ra |
| verb 1SG | *-mi |
| verb 2SG | *-si |
| verb 3SG | *-ti |
| verb 1PL | *-mes |
| verb 2PL | *-te |
| verb 3PL | *-nti |
| past | *-ta- (before person) |
| AGT | *-ter |
| NMLZ | *-ni |
| ADJ | *-ka |
| DIM | *-li |
| COLL | *-ra |

At a vowel + vowel morpheme boundary the stem vowel elides. Compounds are modifier–head.

### 2.4 Lexical density by semantic field

| Field | Roots |
|---|---|
| verb | 34 |
| crops | 24 |
| nature | 22 |
| quality | 22 |
| body | 20 |
| people | 12 |
| society | 10 |
| herding | 9 |
| water | 8 |
| number | 6 |
| time | 6 |
| deixis | 5 |
| pronoun | 4 |

## 3. Sound changes

Rules apply in the order listed. Examples are the first words in the concept list that each rule changes.

### 3.1 Proto-Basin → Old Basin

| # | Process | Rule | Motivation | Examples |
|---|---|---|---|---|
| A1 | Compensatory lengthening | `Vh → Vː / _C, _#` | Loss of a coda laryngeal leaves its timing slot to the vowel (cf. PIE *h₂ → Greek/Latin long vowels). | 'tooth' geh → geː; 'guest' todoh → todoː |
| A2 | Laryngeal loss | `h → ∅` | Remaining /h/ (initial, intervocalic) is lost; glottal fricatives are the least stable consonants cross-linguistically. | 'one' himo → imo; 'four' hasot → asot |
| A3 | Hiatus resolution | `V₁V₁ → Vː; aI → eː; aU → oː; i,u → j,w / _V` | Vowels brought together by A2 contract or glide; standard coalescence pattern (cf. Sanskrit sandhi). | 'heart' sae → seː; 'flour' tae → teː |
| A4 | Labiovelar split | `kʷ,gʷ → k,g / _o,u; → p,b elsewhere` | Rounding is absorbed by a following rounded vowel, otherwise reinterpreted as labial place (cf. P-Celtic, Greek). | '2pl' kʷi → pi; 'tongue' kʷer → per |
| A5 | Velar palatalization | `k,g → tʃ,dʒ / _[front V], _j` | Coarticulation with front vowels (cf. Latin → Italian, Old English cirice → church). | '1pl' ke → tʃe; 'tooth' geː → dʒeː |
| A6 | Intervocalic voicing | `p,t,k,s,tʃ → b,d,g,z,dʒ / V_V` | First step of lenition between vowels (cf. Latin → Western Romance). | 'two' nuko → nugo; 'four' asot → azot |
| A7 | Final nasal neutralization | `m → n / _#` | Place contrast in nasals neutralizes word-finally (cf. Ancient Greek). | 'know' wem → wen; 'lie' im → in |

### 3.2 Old Basin → Middle Basin

| # | Process | Rule | Motivation | Examples |
|---|---|---|---|---|
| B1 | i-umlaut | `[back V] → [front V] / _C₀{i, iː, j}` | Anticipatory fronting of the stressed vowel before a high front vowel in the next syllable (cf. Germanic: *mūsiz → mice). | 'sun' tami → temi; 'spring' labi → lebi |
| B2 | Spirantization | `b,d,g → v,ð,ɣ / V_V` | Second lenition step: voiced stops become fricatives between vowels (cf. Spanish, Celtic). | 'two' nugo → nuɣo; 'head' kodo → koðo |
| B3 | Velar gliding | `ɣ → j / [front V]_; ɣ → w elsewhere` | Weak velar fricative vocalizes toward the preceding vowel (cf. Old English dæg → day). | 'two' nuɣo → nuwo; 'cloud' nuɣa → nuwa |
| B4 | Final nasal loss | `n,m → ∅ / unstressed V_#` | Unstressed final nasals weaken and drop (cf. Latin -um → Romance -o). | 'hair' tuvun → tuvu; 'seed' lejan → leja |
| B5 | Unstressed vowel reduction | `V̆ → ə, Vː → V̆ / unstressed σ` | Fixed initial stress starves later syllables (cf. Old → Middle English). | 'one' imo → imə; 'two' nuwo → nuwə |
| B6 | Medial syncope | `ə → ∅ / VC_CV (one per word)` | Schwa in an internal open syllable deletes (cf. Latin calidum → caldo). | 'granary' beðəvə → beðvə; 'farmer' eðəðər → eððər |
| B7 | Apocope | `ə → ∅ / VC_# (polysyllables)` | Final schwa after a single consonant is lost (cf. Middle English name /naːmə/ → /naːm/). | 'one' imə → im; 'two' nuwə → nuw |
| B8 | Cluster repair | `CC → C (geminates); CCC → CC; nasal place and obstruent voicing assimilation` | New clusters created by B6/B7 are simplified to fit Middle Basin phonotactics. | 'farmer' eððər → eðər; 'horsy' semjə → senjə |

### 3.3 Middle Basin → Modern Standard

| # | Process | Rule | Motivation | Examples |
|---|---|---|---|---|
| C1 | Final devoicing | `[+voice obstruent] → [−voice] / _#` | Exposed by apocope; extremely common (German, Dutch, Russian, Turkish). | 'head' koð → koθ; 'skin' dʒev → dʒef |
| C2 | Long-vowel chain shift | `iː→ei, uː→ou, yː→øy; eː→iː, oː→uː, øː→yː; aː→ɔː` | High long vowels diphthongize, mid vowels rise into the vacated slots, aː rounds (drag chain; cf. the English Great Vowel Shift). | 'tooth' dʒeː → dʒiː; 'heart' seː → siː |
| C3 | Deaffrication | `dʒ → ʒ` | Affricate loses its stop phase (cf. Old French /dʒ/ → French /ʒ/). | 'tooth' dʒiː → ʒiː; 'skin' dʒef → ʒef |
| C4 | Labiodentalization | `w → v / #_, V_` | Labial glide becomes labiodental fricative (cf. Latin /w/ → /v/, German). | 'two' nuw → nuv; 'hand' wil → vil |

### 3.4 Middle Basin → Modern Rim dialect (Rim skips B7)

| # | Process | Rule | Motivation | Examples |
|---|---|---|---|---|
| R1 | Fricative stopping | `ð → d` | Dental fricative merges with /d/; Highland speakers, the Rim's main contact group, lack dental fricatives. | 'head' koðə → kodə; 'belly' tuðər → tudər |
| R2 | Final schwa lowering | `ə → a / _# (polysyllables)` | Final schwa, kept because the Rim skipped apocope, is lowered (cf. Bavarian Sunna for German Sonne). | 'one' imə → ima; 'two' nuwə → nuwa |

### 3.5 Worked derivations

**'grain, cereal'**: *beti → bedi (A6) → beði (B2) → beðə (B5) → beð (B7) → beθ (C1) = **beth**

**'granary'**: *betibin → bedibin (A6) → beðivin (B2) → beðivi (B4) → beðəvə (B5) → beðvə (B6) = **bedhvë**

**'the Basin language (endonym)'**: *doskʷibeni → dospibeni (A4) → døspibeni (B1) → døspiveni (B2) → døspəvənə (B5) → døspəvnə (B6) = **döspëvnë**

**'bread'**: *wahku → waːku (A1) → waːgu (A6) → waːɣu (B2) → waːwu (B3) → waːwə (B5) → waːw (B7) → wɔːw (C2) → vɔːv (C4) = **våv**

**'sleep'**: *buki → butʃi (A5) → budʒi (A6) → bydʒi (B1) → bydʒə (B5) → bydʒ (B7) → bytʃ (C1) = **büch**


## 4. Modern Standard phonology

### 4.1 Consonants

IPA with romanization in ‹›. † = occurs only in loanwords (marginal phoneme).

|  | Labial | Labiodental | Dental | Alveolar | Postalveolar | Palatal | Velar |
|---|---|---|---|---|---|---|---|
| Stop | p ‹p› b ‹b› |  |  | t ‹t› d ‹d› |  |  | k ‹k› g ‹g› |
| Affricate |  |  |  | ts† ‹ts› | tʃ ‹ch› |  |  |
| Fricative |  | f ‹f› v ‹v› | θ ‹th› ð ‹dh› | s ‹s› z ‹z› | ʃ† ‹sh› ʒ ‹zh› |  | x† ‹kh› |
| Nasal | m ‹m› |  |  | n ‹n› |  |  | ŋ ‹ng› |
| Lateral |  |  |  | l ‹l› |  |  |  |
| Rhotic |  |  |  | r ‹r› |  |  |  |
| Approximant | w ‹w› |  |  |  |  | j ‹y› |  |

### 4.2 Vowels

| Vowel | Romanized | Tokens in lexicon |
|---|---|---|
| i | i | 50 |
| y | ü | 8 |
| e | e | 54 |
| ø | ö | 2 |
| ə | ë | 66 |
| a | a | 67 |
| o | o | 39 |
| u | u | 35 |
| iː | ii | 4 |
| ɔː | å | 6 |
| ei | ei | 1 |
| ou | ou | 6 |

Short *ë* /ə/ occurs only in unstressed syllables. Long /aː/ was lost in the Standard (C2: aː → ɔː *å*); it survives in the Rim dialect and in learned words is replaced by short *a*.

### 4.3 Word shapes

| Shape | Count |
|---|---|
| CVC | 113 |
| CVCCV | 36 |
| CV | 32 |
| CVCVC | 17 |
| VC | 12 |
| CVCV | 7 |
| CVCCVC | 6 |
| VCCVC | 3 |
| CVCCVCCV | 3 |
| VCVC | 2 |

### 4.4 Productive alternations

- **Final devoicing** (C1): voiced obstruents alternate with voiceless ones at the word edge: 'grain' **beth**, GEN **bedhës**.
- **Umlaut** (B1): a back stem vowel fronts in forms that once had *-i: LOC, INS, and the 1SG/2SG/3SG/3PL verb forms ('give' 1PL **domës** vs 3SG **döth**).
- **Velar palatalization** (A5): stem-final velars alternate with palato-alveolars before old front-vowel suffixes ('eye' **dik**, GEN **diyës**, old PL **dizhës**).
- **Nasal assimilation** (B8) across clitic boundaries: 'house' **bin** + =pë → **bimpë**.

## 5. Nouns

### 5.1 Case erosion (computed over all inherited nouns)

Each Proto-Basin case form of every inherited noun (111 nouns) was run through the sound changes. The table gives the share of nouns in which two paradigm cells became identical. A merger affecting ≥ 30% of nouns is treated as functionally ambiguous and triggers a repair.

| Cells | Merged (Standard) | Merged (Rim) | Consequence |
|---|---|---|---|
| GEN = PL | 73% | 73% | inherited plural abandoned; collective *-ra becomes the plural |
| NOM = ACC | 62% | 40% | accusative lost; objects unmarked, SOV order fixed |
| NOM = LOC | 38% | 32% | locative replaced by postposition 'in' (< 'belly') |
| ACC = LOC | 35% | 35% | (follows from the two above) |
| DAT = LOC | 7% | 7% | tolerated |
| NOM = DAT | 4% | 4% | tolerated |

### 5.2 Modern paradigms

Old LOC forms survive only as fossilized adverbs; the old plural is replaced by the collective.

| Noun | NOM | GEN | DAT | ABL | INS | PL (< COLL) | old LOC (fossil) |
|---|---|---|---|---|---|---|---|
| 'eye' | dik | diyës | dizhe | dizhët | digbë | dikrë | dich |
| 'heart' | sii | suus | sii | siit | siif | siir | sii |
| 'foot' | tezël | tezlës | tezle | tezlët | tezëlbë | tezëlrë | tezlë |
| 'knee' | sarchë | sarkës | sarche | sarchët | sarchëf | sarchër | serchë |
| 'millet' | uth | udhës | udhe | udhët | udhvë | udhrë | üth |

Productive endings for nouns that entered after the Old period (loans, slang compounds): GEN -ës, DAT -e, ABL -ët, PL -rë.

### 5.3 Definiteness

The distal demonstrative 'that' (**pas** in Middle Basin) reduced to an enclitic =pë, attached to the last word of the noun phrase. The full form **pas** remains the 3rd-person pronoun. Indefinite nouns are bare.

### 5.4 Postpositions

| Postposition | Meaning | Source (Middle Basin) | Path |
|---|---|---|---|
| **tu** | 'in, inside'; also progressive | 'belly' /tuðər/ | body part → container → progressive 'in the V-ing' (cf. Dutch aan het) |
| **koth** | 'on, atop' | 'head' /koð/ | body part → spatial (head > top) |
| **mel** | 'behind, after' | 'back' /melkə/ | body part → spatial → temporal (back > behind > after) |
| **os** | 'before, in front of' | 'face' /os/ | body part → spatial (face > front) |
| **te** | 'under, below' | 'foot' /tezəl/ | body part → spatial (foot > under) |
| **sel** | 'beside' | 'flank' /sel/ | body part → spatial (flank > side) |
| **vil** | 'with' (instrument, companion) | 'hand' /wil/ | body part → instrument |
| **yol** | 'to, at' (recipient, goal) | 'mouth' /jol/ | body part → goal (cf. Mixtec) |
| **lef** | 'from' (source) | 'spring' /lev/ | water source → source of motion |

'On' **koth** comes from the inherited word for 'head', which as a noun was displaced by herders' slang 'gourd' **dalgë** and survives lexically only as 'summit' **koth**.

### 5.5 Numeral classifiers

A numeral cannot modify a noun directly; a classifier intervenes. The system was spread by market traders counting goods by measure units.

| Classifier | Used for | Source |
|---|---|---|
| **sun** | livestock | 'horn' **sun** |
| **lou** | long objects, tools, roads, rivers | 'sheaf' **lou** |
| **tüy** | round or bulky objects, fruit, pots | 'basket' **tüy** |
| **nou** | households | 'hearth' **nou** |
| **ne** | default: everything else | 'clod' **ne** |

## 6. Pronouns

| Person | Independent | Possessive |
|---|---|---|
| 1SG | **tor** | **torës** |
| 2SG | **gu** | **gos** |
| 3SG/3PL | **pas** | **pazës** |
| 1PL | **che** | **chës** (re-formed) |
| 2PL | **pi** | **pës** (re-formed) |

The inherited 1PL and 2PL possessives both became **kos** (A4 turned *kʷ into *k before *o). Speakers rebuilt both from the independent pronoun + the productive genitive ending.


## 7. Verbs

### 7.1 Person endings and their erosion

| Cells | Merged (Standard) | Merged (Rim) |
|---|---|---|
| PST.3SG = PST.2PL | 100% | 100% |
| PRS.3SG = PRS.2PL | 88% | 88% |
| PRS.3SG = PRS.3PL | 36% | 36% |
| PRS.2PL = PRS.3PL | 30% | 30% |
| PRS.3PL = PST.3PL | 12% | 12% |

3SG and 2PL fell together in 88% of verbs (present) and 100% (past): *-ti and *-te both reduced to -ë, -dhë or -th depending on the stem. Consequence: subject pronouns are obligatory in all persons; a finite verb without an overt subject is read as 3rd person.

### 7.2 Sample paradigms

**'know'** (*wem)

|  | 1SG | 2SG | 3SG | 1PL | 2PL | 3PL |
|---|---|---|---|---|---|---|
| Present | vemë | vensë | ventë | vemës | ventë | ventë |
| Past | ventëm | ventës | ventëth | ventëmës | ventëth | ventëntë |

Verbal noun: **venë**

**'sleep'** (*buki)

|  | 1SG | 2SG | 3SG | 1PL | 2PL | 3PL |
|---|---|---|---|---|---|---|
| Present | büzhmë | büzhzë | büzhdhë | büzhmës | büzhdhë | büzhëntë |
| Past | büzhdhëm | büzhdhës | büzhdhëth | büzhdhëmës | büzhdhëth | büzhdhëntë |

Verbal noun: **büzhnë**

**'stand'** (*datah)

|  | 1SG | 2SG | 3SG | 1PL | 2PL | 3PL |
|---|---|---|---|---|---|---|
| Present | dadham | dadhas | dadhath | dadhamës | dadhath | dadhantë |
| Past | dadhadhmë | dadhadhzë | dadhadhë | dadhadhmës | dadhadhë | dadhadhëntë |

Verbal noun: **dadhan**

### 7.3 Analytic tense, aspect, negation

| Category | Marker | Position | Source | Path |
|---|---|---|---|---|
| Future | **kë** | proclitic on the present | 'go' /koð/ | motion-to-future: 'go to V' (cf. English gonna, French aller) |
| Progressive | **tu** | enclitic on the verbal noun + copula | 'belly' /tuðər/ | body part → container → progressive 'in the V-ing' (cf. Dutch aan het) |
| Negation | **ley** | after the verb | 'seed' /lej/ | emphatic minimizer 'not a seed' (cf. French pas 'step'); Jespersen cycle |
| Polar question | **në** | clause-final | 'what' /na/ | interrogative pronoun → clause-final particle |

**Negation cycle.** Old Basin: *tol* + verb. Middle Basin: farmers' emphatic *tə* + verb + *lej* 'not a seed'. The preverbal particle, reduced to a schwa syllable, dropped; Modern Standard: verb + **ley**. The full noun 'seed' is still **ley**; the negator kept only its first syllable.

## 8. Numerals

| Value | Modern | Proto-Basin | Note |
|---|---|---|---|
| one | **im** | *himo |  |
| two | **nuv** | *nuko |  |
| three | **tel** | *tel |  |
| four | **azët** | *hasot |  |
| five | **lu** | *lu |  |
| six | **lwim** | *luhimo | opaque *five + n |
| seven | **lumwë** | *lunuko | opaque *five + n |
| eight | **ludhël** | *lutel | opaque *five + n |
| nine | **lwazët** | *luhasot | opaque *five + n |
| ten | **lun** | *luno |  |
| twenty | **nuvlën** | *nukoluno | *two + ten |
| hundred | **ovlën** | *hobuluno | *big + ten |

Market traders counted 'hand' for five; the usage scored 0.109 (threshold 0.15) and stayed a market-register word: **vil**. Numerals have very high replacement resistance.

## 9. Spatial reference

Because the mountain ring is visible from every point of the plain and every river flows from rim to centre, speakers use a basin-relative absolute frame instead of left/right for anything larger than the body. 'Rimward' is also 'upstream'; 'hubward' is also 'downstream'.

| Term | Meaning | Formation |
|---|---|---|
| **salko** | toward the mountains (outward, upstream) | 'mountain' **sal** + -ko (< 'road') |
| **nothko** | toward the central marsh (inward, downstream) | 'marsh' **noth** + -ko (< 'road') |
| **tengko** | clockwise around the basin | 'sun' **tem** + -ko (< 'road') |
| **veko** | counter-clockwise around the basin | 'night' **ve** + -ko (< 'road') |

## 10. Syntax

- Clause: Subject – Object – (Adverbial) – Verb – NEG – Q.
- Noun phrase: Possessor – Numeral – Classifier – Adjective – Noun – PL –=DEF – Postposition.
- Subjects are always overt (see §7.1). Objects are unmarked; definiteness is marked by =DEF.
- Polar questions add the clause-final particle; content questions put the question word in situ.
- Progressive: verbal noun =PROG + copula agreeing with the subject.

## 11. Lexical history and society

### 11.1 Slang consolidation

Each candidate innovation is scored:

```
social      = 0.55 × reach + 0.45 × prestige
stability'  = stability − 0.25 (if the old word is homophonous with another word in Middle Basin)
                        − 0.15 (if the old word eroded to ≤ 2 segments)
score       = social × expressiveness × (1 − stability') × era + noise(±0.03, seeded)
era         = 1.25 for Old-period slang (more generations to spread), 1.0 for Middle
Standard adopts if score ≥ 0.15; the Rim adopts if score ≥ 0.22
```

Stability values are hand-set, ordered after published lexical replacement-rate rankings (Pagel, Atkinson & Meade 2007): pronouns and low numerals change slowest; evaluatives, intensifiers, expressive body-part words ('head') and taboo targets ('die', 'kill') fastest. Homophony as a driver of replacement follows Gilliéron's gallus/cattus case in Gascon.

| Target | Source | Mechanism | Group | Era | Expr. | Stability | Pressure | Score | Standard | Rim | Form |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 'very' | 'flood' | metaphor | boatmen | middle | 0.95 | 0.15 | — | 0.423 | yes | yes | **pas** |
| 'bad' | 'stony' | metaphor | farmers | old | 0.85 | 0.35 | — | 0.364 | yes | yes | **adhwë** |
| 'head' | 'gourd' | metaphor | herders | old | 0.85 | 0.55 → 0.30 | homophone of 'go' | 0.303 | yes | yes | **dalgë** |
| 'wealth' | 'grain' | metonymy | market | old | 0.6 | 0.45 | — | 0.300 | yes | yes | **beth** |
| 'guard' | 'dog' | metaphor | market | middle | 0.8 | 0.5 | — | 0.260 | yes | yes | **zherbë** |
| 'good' | 'fat' | metaphor | youth | middle | 0.9 | 0.4 | — | 0.255 | yes | yes | **ka** |
| 'child' | 'sprout' | metaphor | farmers | old | 0.7 | 0.45 | — | 0.251 | yes | yes | **nor** |
| 'die' | 'fallow' | euphemism | farmers | old | 0.8 | 0.5 | — | 0.234 | yes | yes | **gal** |
| 'friend' | 'yoke' + 'person' | compound | herders | old | 0.7 | 0.35 | — | 0.226 | yes | yes | **silmë** |
| 'quick' | 'horsy' | metaphor | youth | middle | 0.7 | 0.45 → 0.30 | eroded | 0.208 | yes | no | **senyë** |
| 'stranger' | 'stone' + 'mouth' | compound | youth | middle | 0.8 | 0.4 | — | 0.200 | yes | no | **adhyol** |
| 'small' | 'millet' | metaphor | market | old | 0.6 | 0.7 | — | 0.156 | yes | no | **uth** |
| 'say' | 'thresh' | metaphor | market | middle | 0.65 | 0.7 | — | 0.136 | no | no | **pit** |
| 'kill' | 'reap' | metaphor | guards | middle | 0.75 | 0.45 | — | 0.135 | no | no | **tav** |
| 'eat' | 'graze' | metaphor | herders | middle | 0.7 | 0.6 | — | 0.123 | no | no | **bii** |
| 'five' | 'hand' | metonymy | market | old | 0.5 | 0.9 → 0.75 | eroded | 0.109 | no | no | **vil** |
| 'house' | 'hearth' | metonymy | farmers | old | 0.4 | 0.65 | — | 0.109 | no | no | **nou** |
| 'go' | 'drift' | metaphor | boatmen | middle | 0.5 | 0.75 | — | 0.092 | no | no | **mavëk** |
| 'know' | 'grasp' | metaphor | market | middle | 0.6 | 0.8 | — | 0.061 | no | no | **mon** |
| 'year' | 'harvest' | metonymy | farmers | old | 0.5 | 0.8 | — | 0.050 | no | no | **tavnë** |

**Fate of displaced words.**

| Concept | Inherited word | Fate | Social motivation of the replacement |
|---|---|---|---|
| 'head' | **koth** | narrowed to 'summit, top of a mountain' | Drovers' joke: a skull is a dried gourd (cf. Latin testa 'pot' → French tête). |
| 'bad' | **kof** | obsolete (fixed phrases only) | Stony rim soil is the worst land a lineage can be given. |
| 'wealth' | **mun** | narrowed to 'inherited wealth in cattle (legal term)' | Grain was the market unit of account. |
| 'child' | **zhir** | narrowed to 'heir, legal offspring' | Children are a household's new growth. |
| 'die' | **chit** | narrowed to 'perish (of animals)' | Death taboo: 'he lies fallow' = he rests and will return in the cycle. |
| 'friend' | **nul** | obsolete (fixed phrases only) | 'Yoke-mate': two oxen that pull together. |
| 'small' | **neschë** | narrowed to 'young (of animals)' | Millet is the smallest grain sold. |
| 'good' | **gon** | narrowed to 'lawful, proper' | In a surplus economy fatness signals prosperity. |
| 'very' | **yartë** | obsolete (fixed phrases only) | 'Flooding' = in great quantity; boatmen's intensifier. |
| 'stranger' | **mul** | narrowed to 'foreign guest under hospitality law' | 'Stone-mouth': pejorative for rim and Highland people. |
| 'guard' | **vet** | narrowed to 'pass-warden (official title)' | Traders' insult for toll-collecting pass-guards. |
| 'quick' | **nei** | obsolete (fixed phrases only) | Horse-like = fast. |

### 11.2 Homophony created by sound change

| Middle Basin form | Words | Outcome |
|---|---|---|
| /pas/ | 'that', 'flood' | tolerated (different word classes) |
| /nuw/ | 'two', 'cloud' | tolerated (different word classes) |
| /tel/ | 'three', 'root' | tolerated (different word classes) |
| /koð/ | 'head', 'go' | resolved by replacement |
| /tʃir/ | 'moon', 'meat' | tolerated; same word class, disambiguated by context |
| /in/ | 'egg', 'lie', 'warm' | tolerated (different word classes) |
| /pan/ | 'full', 'green' | tolerated; same word class, disambiguated by context |

### 11.3 Highland loanwords

The Highland language (Basin name *Këkiv*) has ejectives, uvulars and initial clusters. Loans were nativized by the phonology of the period of borrowing, so two layers are distinguishable:

- **Early** (into Old Basin): ejectives → plain, uvulars → velar, *ts, ʃ* → *s*, clusters broken by a copy vowel. They then underwent all Middle and Modern changes, but they arrived after intervocalic voicing (A6) and palatalization (A5), so they keep intervocalic voiceless stops and *k* before front vowels — a diagnostic of borrowing.
- **Late** (into Middle Basin): ejectives → plain, *q* → *k*, but *χ* → /x/ ‹kh›, and *ts*, *ʃ* kept: the loans introduced three new marginal phonemes. Clusters broken by schwa.

| Meaning | Layer | Highland | Old Basin | Middle Basin | Modern |
|---|---|---|---|---|---|
| copper | early | /raʃam/ | /rasam/ | /ras/ | **ras** |
| salt | early | /nuriχ/ | /nurik/ | /nyrək/ | **nürëk** |
| mountain pass | early | /tsʼoqutʼ/ | /sokut/ | /sokət/ | **sokët** |
| eagle | early | /ʃilis/ | /silis/ | /siləs/ | **silës** |
| wool | early | /tʼiʃ/ | /tis/ | /tis/ | **tis** |
| cliff | early | /rpu/ | /rupu/ | /rup/ | **rup** |
| iron | late | /napaχ/ | — | /napax/ | **napakh** |
| knife | late | /lij/ | — | /lij/ | **liy** |
| felt | late | /kipr/ | — | /kiprə/ | **kiprë** |
| goat | late | /χrek/ | — | /xərek/ | **khërek** |
| cheese | late | /nkʼus/ | — | /nəkus/ | **nëkus** |
| glacier | late | /trun/ | — | /tərun/ | **tërun** |
| toll, pass tax | late | /qʼatsuk/ | — | /katsuk/ | **katsuk** |
| bridle | late | /tiʃm/ | — | /tiʃmə/ | **tishmë** |

### 11.4 Learned doublets

Granary scribes kept records in Old Basin spelling. From the Modern period they re-borrowed written words with a reading pronunciation (long vowels read short, unstressed vowels read full, no lenition). Each learned word coexists with its inherited descendant, which keeps the everyday sense.

| Source | Inherited | Learned | Learned meaning |
|---|---|---|---|
| 'count' | **bey** | **beyu** | number, arithmetic (learned) |
| 'law' | **köspë** | **kospi** | statute (learned) |
| 'heart' | **sii** | **se** | essence, core (learned) |
| 'speech' | **pivnë** | **pibeni** | grammar, formal language (learned) |
| 'granary' | **bedhvë** | **bedibin** | treasury (learned) |
| 'harvest' | **tavnë** | **tavani** | fiscal year, levy period (learned) |
| 'elder' | **gan** | **ganu** | council member (learned) |

No doublet arose for 'measure', 'oath': the inherited form was already identical to the reading pronunciation.


### 11.5 Opaque vs transparent compounds

Proto-Basin compounds went through every sound change and are no longer analysable; Modern compounds are transparent.

| Meaning | Parts | Modern | Status |
|---|---|---|---|
| granary | *betibin | **bedhvë** | opaque |
| boatman | *barulama | **barlëm** | opaque |
| harvest | *tawani | **tavnë** | opaque |
| lineage, extended household | *nuhra | **nour** | opaque |
| hundred | *hobuluno | **ovlën** | opaque |
| fertile black soil | tar + tuzël | **tartuzël** | transparent |
| poor rim land | ath + lan | **athlan** | transparent |
| fresh flood deposit | kandë + bün | **kandëbün** | transparent |
| snowmelt | souf + zhith | **soufzhith** | transparent |
| trade route | beth + ko | **bethko** | transparent |
| cold downslope wind | sal + paf | **salpaf** | transparent |
| first-sheaf festival | kandë + lou | **kandëlou** | transparent |
| irrigation official | zhith + zherbë | **zhithzherbë** | transparent |

## 12. Dialects: Standard and Rim

The Standard is the speech of the river towns and the granary court. The Rim dialect is spoken in the foothill villages nearest the passes: smaller, denser networks and more Highland contact. Differences, all computed:

- **No apocope (B7)**: final schwa kept, so more endings survive; it is then lowered to -a (R2).
- **No long-vowel shift (C2)**: /aː eː iː oː uː/ kept.
- **No w → v, no dʒ → ʒ.**
- **ð → d** (R1), matching the Highland lack of dental fricatives.
- **Fewer lexical innovations**: adoption threshold 0.22 vs 0.15.

| Concept | Standard | Rim | Note |
|---|---|---|---|
| 'water' | **zhith** | **jida** |  |
| 'tooth' | **zhii** | **jē** |  |
| 'bread' | **våv** | **wāwa** |  |
| 'star' | **yå** | **yā** |  |
| 'father' | **bith** | **bida** |  |
| 'field' | **lan** | **lana** |  |
| 'spring' | **lef** | **leva** |  |
| 'grain' | **beth** | **beda** |  |
| 'sun' | **tem** | **tema** |  |
| 'hearth' | **nou** | **nuu** |  |
| 'village' | **sei** | **sii** |  |
| 'thaw' | **souf** | **suuva** |  |
| 'eat' | **pirzhë** | **pirja** |  |
| 'small' | **uth** | **nescha** | Rim keeps the inherited word |
| 'stranger' | **adhyol** | **mula** | Rim keeps the inherited word |
| 'quick' | **senyë** | **nii** | Rim keeps the inherited word |
| 'rimward' | **salko** | **salëko** |  |

Because the Rim kept the final vowel, NOM and ACC merged in 40% of nouns there vs 62% in the Standard; Rim speakers still mark many objects.

## 13. Texts

Interlinear glosses follow the Leipzig conventions: `-` suffix, `=` clitic, `.` fused categories.

**1.** *teyëltërëpë duntërpë salko teyëltëntë*

```
teyëltërë=pë   duntër=pë  salko    teyëltëntë
herder.PL=DEF  herd=DEF   rimward  drive.PST.3PL
```
'The herders drove the herd rimward.'

**2.** *tor våvpë këpirzhëm ley*

```
tor  våv=pë     kë=pirzhëm       ley
1SG  bread=DEF  FUT=eat.PRS.1SG  NEG
```
'I will not eat the bread.'

**3.** *yospë döth salpë riktë*

```
yos=pë     döth          sal=pë        riktë
river=DEF  give.PRS.3SG  mountain=DEF  hold.PRS.3SG
```
'The river gives, the mountain keeps. (proverb)'

**4.** *gos bedhvë pan nüth në*

```
gos      bedhvë   pan   nüth        në
2SG.GEN  granary  full  be.PRS.3SG  Q
```
'Is your granary full? (everyday greeting)'

**5.** *pas pan nüth*

```
pas   pan   nüth
very  full  be.PRS.3SG
```
'Very full! (standard reply)'

**6.** *tel sun duntë bimpë sel dadhantë*

```
tel    sun      duntë   bim=pë     sel     dadhantë
three  CL.HORN  cattle  house=DEF  beside  stand.PRS.3PL
```
'Three cows stand beside the house.'

**7.** *barlëmërpë nothko mavëknëtu nüntë*

```
barlëmër=pë     nothko   mavëknë=tu       nüntë
boatman.PL=DEF  hubward  drift.NMLZ=PROG  be.PRS.3PL
```
'The boatmen are drifting hubward.'

**8.** *adhyolpë sokëtpë lef nürëk meyëntëth*

```
adhyol=pë     sokët=pë  lef   nürëk  meyëntëth
stranger=DEF  pass=DEF  from  salt   carry.PST.3SG
```
'The stranger carried salt from the pass.'

## 14. Reproducing and varying

```
python3 generate.py            # rewrites output/
```

- Change `SEED` in `basin/data.py` to generate a different proto-language; all history re-runs on the new roots.
- Change `SETTING` (temperature, altitudes) to shift derived parameters.
- Change `GROUPS` or `CONSOLIDATION` to change which slang becomes standard.
- Reorder or edit rules in `basin/changes.py` to change the sound history.


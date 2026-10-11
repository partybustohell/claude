"""Hand-specified inputs: setting, concept list, social model, contact data.

Everything here is a *parameter*. Forms are never written by hand; they are
generated from these inputs by the procedures in proto.py / history.py.
"""

SEED = "ringed-basin/v1"

# ------------------------------------------------------------------ setting
SETTING = {
    "basin_floor_altitude_m": 350,
    "rim_altitude_m": 2900,
    "pass_altitude_m": 1900,
    "mean_annual_temp_c": 15,
    "annual_rain_mm": 650,
    "water_source": "snowmelt rivers draining from the rim to a central marsh",
    "economy": "irrigated cereals, cattle, river transport, market towns",
    "population_estimate": 400_000,
    "contact": "Highland pastoralists who control the passes",
}

# ------------------------------------------------------------------ concepts
# (key, gloss, field, stability, tags)
# stability: 0-1 resistance to lexical replacement. Ordering follows
# published rate-of-replacement rankings (pronouns, low numerals, 'water',
# 'eye' slowest; evaluative adjectives, intensifiers, 'head', 'child',
# taboo/euphemism targets fastest).
# tags: gram = short function word; small / big = sound-symbolic vowel bias
ROOTS = [
    # pronouns, deixis, function words
    ("1sg", "I, me", "pronoun", .97, "gram"),
    ("2sg", "you (singular)", "pronoun", .96, "gram"),
    ("1pl", "we, us", "pronoun", .95, "gram"),
    ("2pl", "you (plural)", "pronoun", .93, "gram"),
    ("this", "this", "deixis", .93, "gram small"),
    ("that", "that; he, she, it", "deixis", .92, "gram big"),
    ("who", "who", "deixis", .92, "gram"),
    ("what", "what", "deixis", .92, "gram"),
    ("neg", "not", "deixis", .90, "gram"),
    ("be", "to be", "verb", .92, "gram"),
    # numerals
    ("one", "one", "number", .96, ""),
    ("two", "two", "number", .97, ""),
    ("three", "three", "number", .97, ""),
    ("four", "four", "number", .93, ""),
    ("five", "five", "number", .90, ""),
    ("ten", "ten", "number", .90, ""),
    # body
    ("head", "head", "body", .55, "big"),
    ("eye", "eye", "body", .92, ""),
    ("ear", "ear", "body", .85, ""),
    ("nose", "nose", "body", .78, ""),
    ("mouth", "mouth", "body", .60, ""),
    ("tooth", "tooth", "body", .85, "small"),
    ("tongue", "tongue", "body", .85, ""),
    ("hand", "hand", "body", .85, ""),
    ("foot", "foot", "body", .80, ""),
    ("knee", "knee", "body", .75, ""),
    ("belly", "belly", "body", .55, "big"),
    ("back", "back (of the body)", "body", .70, ""),
    ("heart", "heart", "body", .80, ""),
    ("blood", "blood", "body", .85, ""),
    ("bone", "bone", "body", .85, ""),
    ("skin", "skin, hide", "body", .70, ""),
    ("hair", "hair", "body", .70, ""),
    ("face", "face", "body", .60, ""),
    ("flank", "flank, side", "body", .60, ""),
    ("horn", "horn", "body", .70, ""),
    # people
    ("person", "person", "people", .80, ""),
    ("man", "man", "people", .70, ""),
    ("woman", "woman", "people", .70, ""),
    ("child", "child", "people", .45, "small"),
    ("mother", "mother", "people", .90, ""),
    ("father", "father", "people", .85, ""),
    ("elder", "elder", "people", .60, ""),
    ("chief", "chief", "people", .50, ""),
    ("guest", "guest", "people", .60, ""),
    ("friend", "friend", "people", .35, ""),
    ("stranger", "stranger, outsider", "people", .40, ""),
    ("guard", "guard, watchman", "people", .50, ""),
    # landscape and water
    ("sun", "sun", "nature", .90, ""),
    ("moon", "moon", "nature", .90, ""),
    ("star", "star", "nature", .90, "small"),
    ("water", "water", "nature", .95, ""),
    ("rain", "rain", "nature", .85, ""),
    ("river", "river", "water", .80, "big"),
    ("spring", "spring, water source", "water", .70, ""),
    ("marsh", "marsh, central wetland", "water", .65, ""),
    ("flood", "flood, annual inundation", "water", .70, "big"),
    ("silt", "silt, flood mud", "water", .60, ""),
    ("reed", "reed", "water", .70, ""),
    ("boat", "boat", "water", .70, ""),
    ("stone", "stone", "nature", .85, ""),
    ("sand", "sand", "nature", .70, ""),
    ("earth", "earth, soil", "nature", .80, ""),
    ("clay", "clay", "nature", .70, ""),
    ("cloud", "cloud", "nature", .75, ""),
    ("smoke", "smoke", "nature", .75, ""),
    ("fire", "fire", "nature", .90, ""),
    ("ash", "ash", "nature", .75, ""),
    ("wind", "wind", "nature", .80, ""),
    ("snow", "snow", "nature", .80, ""),
    ("night", "night", "time", .90, ""),
    ("day", "day", "time", .85, ""),
    ("year", "year", "time", .80, ""),
    ("dawn", "dawn", "time", .80, ""),
    ("dusk", "dusk", "time", .70, ""),
    ("thaw", "thaw season (early spring)", "time", .70, ""),
    ("mountain", "mountain", "nature", .80, "big"),
    ("bowl", "bowl; basin", "nature", .70, "big"),
    # agriculture
    ("grain", "grain, cereal", "crops", .70, "small"),
    ("wheat", "wheat", "crops", .70, ""),
    ("barley", "barley", "crops", .70, ""),
    ("millet", "millet", "crops", .70, "small"),
    ("seed", "seed", "crops", .75, "small"),
    ("sprout", "sprout, shoot", "crops", .65, "small"),
    ("root", "root", "crops", .80, ""),
    ("leaf", "leaf", "crops", .80, ""),
    ("tree", "tree", "crops", .85, ""),
    ("grass", "grass", "crops", .80, ""),
    ("field", "field", "crops", .75, ""),
    ("furrow", "furrow", "crops", .70, ""),
    ("plow", "plow", "crops", .70, ""),
    ("sheaf", "sheaf", "crops", .70, ""),
    ("basket", "basket", "crops", .70, ""),
    ("pot", "pot, storage jar", "crops", .70, ""),
    ("gourd", "gourd", "crops", .70, "big"),
    ("bread", "bread", "crops", .70, ""),
    ("flour", "flour", "crops", .70, ""),
    ("clod", "clod of earth", "crops", .60, ""),
    ("yoke", "yoke", "crops", .70, ""),
    ("wheel", "wheel", "crops", .75, ""),
    ("cart", "cart", "crops", .70, ""),
    ("fence", "fence, hedge", "crops", .70, ""),
    # animals
    ("cattle", "cow, cattle", "herding", .75, "big"),
    ("bull", "bull", "herding", .70, "big"),
    ("calf", "calf", "herding", .70, "small"),
    ("horse", "horse", "herding", .75, ""),
    ("sheep", "sheep", "herding", .75, ""),
    ("dog", "dog", "herding", .80, ""),
    ("bird", "bird", "nature", .80, "small"),
    ("fish", "fish", "water", .85, ""),
    ("snake", "snake", "nature", .80, ""),
    ("louse", "louse", "nature", .85, "small"),
    ("worm", "worm", "nature", .75, "small"),
    ("milk", "milk", "herding", .80, ""),
    ("butter", "butter", "herding", .70, ""),
    ("egg", "egg", "nature", .85, "small"),
    ("meat", "meat", "herding", .75, ""),
    # verbs
    ("eat", "eat", "verb", .60, ""),
    ("drink", "drink", "verb", .80, ""),
    ("sleep", "sleep", "verb", .75, ""),
    ("die", "die", "verb", .50, ""),
    ("kill", "kill", "verb", .45, ""),
    ("see", "see", "verb", .85, ""),
    ("hear", "hear", "verb", .85, ""),
    ("know", "know", "verb", .80, ""),
    ("say", "say", "verb", .70, ""),
    ("give", "give", "verb", .85, ""),
    ("go", "go", "verb", .75, ""),
    ("come", "come", "verb", .85, ""),
    ("sit", "sit", "verb", .80, ""),
    ("stand", "stand", "verb", .85, ""),
    ("lie", "lie down", "verb", .85, ""),
    ("hold", "hold, keep", "verb", .70, ""),
    ("take", "take", "verb", .70, ""),
    ("make", "make", "verb", .70, ""),
    ("carry", "carry", "verb", .75, ""),
    ("sow", "sow", "verb", .75, ""),
    ("reap", "reap", "verb", .70, ""),
    ("thresh", "thresh", "verb", .70, ""),
    ("graze", "graze", "verb", .70, ""),
    ("till", "till, plow", "verb", .70, ""),
    ("drive", "drive (cattle)", "verb", .65, ""),
    ("trade", "trade, barter", "verb", .55, ""),
    ("count", "count", "verb", .60, ""),
    ("measure", "measure", "verb", .65, ""),
    ("burn", "burn", "verb", .80, ""),
    ("flow", "flow", "verb", .75, ""),
    ("grasp", "grasp", "verb", .60, ""),
    ("drift", "drift (downstream)", "verb", .60, ""),
    ("fallow", "lie fallow (of a field)", "verb", .60, ""),
    # qualities
    ("big", "big", "quality", .70, "big"),
    ("small", "small", "quality", .70, "small"),
    ("long", "long", "quality", .80, ""),
    ("good", "good", "quality", .40, ""),
    ("bad", "bad", "quality", .35, ""),
    ("new", "new", "quality", .80, ""),
    ("old", "old", "quality", .70, ""),
    ("full", "full", "quality", .80, ""),
    ("dry", "dry", "quality", .80, ""),
    ("wet", "wet", "quality", .75, ""),
    ("warm", "warm", "quality", .75, ""),
    ("cold", "cold", "quality", .80, ""),
    ("red", "red", "quality", .85, ""),
    ("black", "black", "quality", .85, ""),
    ("white", "white", "quality", .85, ""),
    ("green", "green", "quality", .70, ""),
    ("yellow", "yellow", "quality", .75, ""),
    ("fat", "fat", "quality", .60, "big"),
    ("quick", "quick", "quality", .45, "small"),
    ("many", "many", "quality", .70, ""),
    ("all", "all", "quality", .85, ""),
    ("very", "very (intensifier)", "quality", .15, ""),
    # society
    ("house", "house", "society", .65, ""),
    ("hearth", "hearth", "society", .70, ""),
    ("village", "village", "society", .70, ""),
    ("market", "market", "society", .60, ""),
    ("wealth", "wealth", "society", .45, ""),
    ("gift", "gift", "society", .65, ""),
    ("feast", "feast", "society", .60, ""),
    ("law", "custom, law", "society", .60, ""),
    ("oath", "oath", "society", .60, ""),
    ("road", "road, way", "society", .75, ""),
]

# Proto-Basin derivatives (formed in the proto-language itself, so they
# undergo every sound change and usually become opaque).
# (key, gloss, parts) -- parts are concept keys or affix names
PROTO_AFFIXES = {
    "-AGT": "ter", "-NMLZ": "ni", "-ADJ": "ka", "-DIM": "li", "-COLL": "ra",
}
DERIVED = [
    ("granary", "granary", ["grain", "house"]),
    ("herder", "herder, drover", ["drive", "-AGT"]),
    ("farmer", "farmer", ["till", "-AGT"]),
    ("trader", "trader", ["trade", "-AGT"]),
    ("boatman", "boatman", ["boat", "person"]),
    ("harvest", "harvest", ["reap", "-NMLZ"]),
    ("speech", "speech, language", ["say", "-NMLZ"]),
    ("lineage", "lineage, extended household", ["hearth", "-COLL"]),
    ("herd", "herd", ["cattle", "-COLL"]),
    ("lamb", "lamb", ["sheep", "-DIM"]),
    ("stony", "stony, barren", ["stone", "-ADJ"]),
    ("horsy", "horse-like", ["horse", "-ADJ"]),
    ("six", "six", ["five", "one"]),
    ("seven", "seven", ["five", "two"]),
    ("eight", "eight", ["five", "three"]),
    ("nine", "nine", ["five", "four"]),
    ("twenty", "twenty", ["two", "ten"]),
    ("hundred", "hundred", ["big", "ten"]),
    ("ethnonym", "the Basin people (endonym)", ["bowl", "person", "-COLL"]),
    ("glossonym", "the Basin language (endonym)", ["bowl", "say", "-NMLZ"]),
]

# ------------------------------------------------------------------ society
# Social groups as innovation sources. reach = how far the group's speech
# travels through the network (loose, wide networks spread change faster);
# prestige = how much other speakers want to sound like them.
GROUPS = {
    "boatmen": {"reach": .75, "prestige": .25,
                "desc": "river transport crews; link every riverside settlement"},
    "market":  {"reach": .85, "prestige": .50,
                "desc": "market-town traders; daily contact with all other groups"},
    "farmers": {"reach": .60, "prestige": .35,
                "desc": "majority population; dense village networks"},
    "herders": {"reach": .55, "prestige": .30,
                "desc": "cattle drovers moving between pastures and markets"},
    "youth":   {"reach": .65, "prestige": .15,
                "desc": "age-grade slang; spreads by generational turnover"},
    "guards":  {"reach": .35, "prestige": .45,
                "desc": "pass-wardens and armed retainers of the granary lords"},
    "scribes": {"reach": .30, "prestige": .90,
                "desc": "granary record-keepers; source of learned vocabulary"},
}

# Weights and thresholds for slang consolidation.
CONSOLIDATION = {
    "w_reach": .55,
    "w_prestige": .45,
    "era_multiplier": {"old": 1.25, "middle": 1.0},  # more generations to spread
    "homophony_penalty": .25,   # inherited word clashes with another word
    "erosion_penalty": .15,     # inherited word eroded to <= 2 segments
    "noise": .03,               # seeded jitter, +/-
    "threshold_standard": .15,
    "threshold_rim": .22,       # periphery adopts fewer central innovations
}

# Slang candidates.
# (target, source parts, mechanism, group, era, expressiveness, fate of the
#  displaced word as (new_key, new_gloss) or None for obsolescence, rationale)
SLANG = [
    ("head", ["gourd"], "metaphor", "herders", "old", .85,
     ("summit", "summit, top of a mountain"),
     "Drovers' joke: a skull is a dried gourd (cf. Latin testa 'pot' → French tête)."),
    ("bad", ["stony"], "metaphor", "farmers", "old", .85, None,
     "Stony rim soil is the worst land a lineage can be given."),
    ("wealth", ["grain"], "metonymy", "market", "old", .60,
     ("stockwealth", "inherited wealth in cattle (legal term)"),
     "Grain was the market unit of account."),
    ("child", ["sprout"], "metaphor", "farmers", "old", .70,
     ("heir", "heir, legal offspring"),
     "Children are a household's new growth."),
    ("die", ["fallow"], "euphemism", "farmers", "old", .80,
     ("perish", "perish (of animals)"),
     "Death taboo: 'he lies fallow' = he rests and will return in the cycle."),
    ("house", ["hearth"], "metonymy", "farmers", "old", .40,
     ("building", "building, structure"),
     "Part-for-whole: the household is counted by hearths for granary levies."),
    ("friend", ["yoke", "person"], "compound", "herders", "old", .70, None,
     "'Yoke-mate': two oxen that pull together."),
    ("five", ["hand"], "metonymy", "market", "old", .50, None,
     "Finger counting at grain stalls."),
    ("year", ["harvest"], "metonymy", "farmers", "old", .50,
     ("era", "age, era"),
     "Years are counted in harvests."),
    ("small", ["millet"], "metaphor", "market", "old", .60,
     ("young", "young (of animals)"),
     "Millet is the smallest grain sold."),
    ("eat", ["graze"], "metaphor", "herders", "middle", .70,
     ("dine", "dine, feast (formal)"),
     "People 'graze' like cattle; mock-rustic, later neutral."),
    ("good", ["fat"], "metaphor", "youth", "middle", .90,
     ("lawful", "lawful, proper"),
     "In a surplus economy fatness signals prosperity."),
    ("very", ["flood"], "metaphor", "boatmen", "middle", .95, None,
     "'Flooding' = in great quantity; boatmen's intensifier."),
    ("kill", ["reap"], "metaphor", "guards", "middle", .75,
     ("slaughter", "slaughter (livestock)"),
     "Retainers' euphemism-dysphemism: cutting men down like grain."),
    ("go", ["drift"], "metaphor", "boatmen", "middle", .50, None,
     "Boatmen 'drift' everywhere."),
    ("stranger", ["stone", "mouth"], "compound", "youth", "middle", .80,
     ("guestfriend", "foreign guest under hospitality law"),
     "'Stone-mouth': pejorative for rim and Highland people."),
    ("know", ["grasp"], "metaphor", "market", "middle", .60, None,
     "'Grasp' a price = understand it."),
    ("guard", ["dog"], "metaphor", "market", "middle", .80,
     ("warden", "pass-warden (official title)"),
     "Traders' insult for toll-collecting pass-guards."),
    ("quick", ["horsy"], "metaphor", "youth", "middle", .70, None,
     "Horse-like = fast."),
    ("say", ["thresh"], "metaphor", "market", "middle", .65,
     ("declare", "declare, proclaim"),
     "Market chatter as 'threshing': beating out words."),
]

# ------------------------------------------------------------------ contact
HIGHLAND_ALTITUDE_M = 2400
# Loanwords from the Highland language. early = enters Old Basin (before
# stage B); late = enters Middle Basin (before stage C).
LOANS = [
    ("copper", "copper", "early"),
    ("salt", "salt", "early"),
    ("pass", "mountain pass", "early"),
    ("eagle", "eagle", "early"),
    ("wool", "wool", "early"),
    ("cliff", "cliff", "early"),
    ("iron", "iron", "late"),
    ("knife", "knife", "late"),
    ("felt", "felt", "late"),
    ("goat", "goat", "late"),
    ("cheese", "cheese", "late"),
    ("glacier", "glacier", "late"),
    ("toll", "toll, pass tax", "late"),
    ("bridle", "bridle", "late"),
]

# Learned (scribal) re-borrowings from written Old Basin.
# (concept, gloss of the learned doublet)
LEARNED = [
    ("count", "number, arithmetic (learned)"),
    ("measure", "standard, rule (learned)"),
    ("law", "statute (learned)"),
    ("oath", "treaty (learned)"),
    ("heart", "essence, core (learned)"),
    ("speech", "grammar, formal language (learned)"),
    ("granary", "treasury (learned)"),
    ("harvest", "fiscal year, levy period (learned)"),
    ("elder", "council member (learned)"),
]

# ------------------------------------------------------------------ grammar
# Grammaticalization sources (all from Middle Basin forms of the inherited
# word, even where the lexical word itself was later replaced by slang).
# (function, label, source concept, erosion level, rationale)
GRAMMATICALIZATION = [
    ("FUT", "future proclitic", "go", 2, "motion-to-future: 'go to V' (cf. English gonna, French aller)"),
    ("NEG", "postverbal negator", "seed", 1, "emphatic minimizer 'not a seed' (cf. French pas 'step'); Jespersen cycle"),
    ("DEF", "definite enclitic", "that", 2, "distal demonstrative → article (cf. Latin ille → le)"),
    ("PROG", "progressive / 'in'", "belly", 1, "body part → container → progressive 'in the V-ing' (cf. Dutch aan het)"),
    ("ON", "'on, atop'", "head", 1, "body part → spatial (head > top)"),
    ("BEHIND", "'behind, after'", "back", 1, "body part → spatial → temporal (back > behind > after)"),
    ("BEFORE", "'before, in front of'", "face", 1, "body part → spatial (face > front)"),
    ("UNDER", "'under, below'", "foot", 1, "body part → spatial (foot > under)"),
    ("BESIDE", "'beside'", "flank", 1, "body part → spatial (flank > side)"),
    ("WITH", "'with' (instrument, companion)", "hand", 1, "body part → instrument"),
    ("TO", "'to, at' (recipient, goal)", "mouth", 1, "body part → goal (cf. Mixtec)"),
    ("FROM", "'from' (source)", "spring", 1, "water source → source of motion"),
    ("WARD", "directional suffix '-ward'", "road", 1, "'road of X' → toward X"),
    ("Q", "polar question particle", "what", 2, "interrogative pronoun → clause-final particle"),
]

# Directionals: noun + WARD. The basin's absolute frame of reference.
DIRECTIONALS = [
    ("rimward", "toward the mountains (outward, upstream)", "mountain"),
    ("hubward", "toward the central marsh (inward, downstream)", "marsh"),
    ("sunwise", "clockwise around the basin", "sun"),
    ("nightwise", "counter-clockwise around the basin", "night"),
]

# Numeral classifiers (from market measure-counting).
# (label, use, source concept)
CLASSIFIERS = [
    ("CL.HORN", "livestock", "horn"),
    ("CL.SHEAF", "long objects, tools, roads, rivers", "sheaf"),
    ("CL.BASKET", "round or bulky objects, fruit, pots", "basket"),
    ("CL.HEARTH", "households", "hearth"),
    ("CL.CLOD", "default: everything else", "clod"),
]
# Which nouns take which classifier (anything unlisted takes CL.CLOD).
CLASSIFIER_MEMBERS = {
    "CL.HORN": ["cattle", "bull", "calf", "horse", "sheep", "lamb", "goat", "dog"],
    "CL.SHEAF": ["plow", "road", "river", "reed", "knife", "tree", "snake", "worm",
                 "furrow", "boat", "cart", "fence", "sheaf", "horn", "bone", "grainroad"],
    "CL.BASKET": ["pot", "basket", "gourd", "egg", "bread", "stone", "head", "wheel",
                  "cheese", "fish", "bird", "eagle"],
    "CL.HEARTH": ["house", "hearth", "lineage", "village", "granary"],
}

# Transparent compounds coined in the Modern period.
MODERN_COMPOUNDS = [
    ("blackearth", "fertile black soil", ["black", "earth"]),
    ("stonefield", "poor rim land", ["stone", "field"]),
    ("newsilt", "fresh flood deposit", ["new", "silt"]),
    ("meltwater", "snowmelt", ["thaw", "water"]),
    ("grainroad", "trade route", ["grain", "road"]),
    ("rimwind", "cold downslope wind", ["mountain", "wind"]),
    ("firstsheaf", "first-sheaf festival", ["new", "sheaf"]),
    ("waterwarden", "irrigation official", ["water", "guard"]),
]

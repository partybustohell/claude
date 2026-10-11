/* Döspëvnë translator. Rule-based; every output form comes from the
 * generated data bundle (D). English → Döspëvnë parses simple clauses;
 * Döspëvnë → English analyses each word and builds a rough reading. */
function createTranslator(D) {
  "use strict";

  // ---------------------------------------------------------------- English tables
  const IRREG_PAST = { ate: "eat", drank: "drink", slept: "sleep", saw: "see", heard: "hear",
    knew: "know", said: "say", gave: "give", went: "go", came: "come", sat: "sit", stood: "stand",
    lay: "lie", held: "hold", kept: "keep", took: "take", made: "make", drove: "drive",
    burnt: "burn", grasped: "grasp", sowed: "sow", understood: "understand", told: "tell" };
  const IRREG_PP = { eaten: "eat", drunk: "drink", seen: "see", known: "know", given: "give",
    gone: "go", taken: "take", driven: "drive", sown: "sow", lain: "lie", come: "come" };
  const PAST_OF = {}; for (const [p, b] of Object.entries(IRREG_PAST)) if (!PAST_OF[b]) PAST_OF[b] = p;
  PAST_OF.lie = "lay";
  const IRREG_PL = { men: "man", women: "woman", children: "child", feet: "foot", teeth: "tooth",
    lice: "louse", people: "person", cattle: "cow", cows: "cow", sheep: "sheep", fish: "fish",
    oxen: "cow", geese: "bird", mice: "louse" };
  const PL_OF = { man: "men", woman: "women", child: "children", foot: "feet", tooth: "teeth",
    louse: "lice", person: "people", sheep: "sheep", fish: "fish", "cow": "cows" };
  const SYN = { large: "big", great: "big", little: "small", tiny: "small", fast: "quick",
    rapid: "quick", rock: "stone", soil: "earth", dirt: "earth", ground: "earth", way: "road",
    path: "road", keep: "hold", home: "house", kid: "child", lake: "marsh", swamp: "marsh",
    stream: "river", food: "bread", talk: "say", speak: "say", tell: "say", walk: "go",
    travel: "go", understand: "know", ox: "cow", rich: "fat", money: "wealth", watch: "see",
    look: "see", lord: "chief", king: "chief", wife: "woman", husband: "man", boy: "child",
    girl: "child", baby: "child", dad: "father", mom: "mother", mum: "mother",
    hot: "warm", cool: "cold", sea: "marsh", peak: "summit", pass: "mountain pass",
    basin: "bowl", language: "speech", cereal: "grain", corn: "grain", herdsman: "herder",
    drover: "herder", merchant: "trader", sailor: "boatman", ferryman: "boatman",
    storehouse: "granary", hill: "mountain", wood: "tree", forest: "tree" };
  const DIR_WORDS = { rimward: "rimward", upstream: "rimward", uphill: "rimward", outward: "rimward",
    hubward: "hubward", downstream: "hubward", downhill: "hubward", inward: "hubward",
    sunwise: "sunwise", clockwise: "sunwise", nightwise: "nightwise",
    counterclockwise: "nightwise", anticlockwise: "nightwise", "counter-clockwise": "nightwise" };
  const DIR_PHRASES = { "toward the mountains": "rimward", "towards the mountains": "rimward",
    "toward the rim": "rimward", "towards the rim": "rimward", "toward the marsh": "hubward",
    "towards the marsh": "hubward", "toward the center": "hubward", "towards the center": "hubward",
    "toward the centre": "hubward", "towards the centre": "hubward" };
  const PREPS = { in: "PROG", inside: "PROG", into: "PROG", within: "PROG", on: "ON", onto: "ON",
    upon: "ON", atop: "ON", behind: "BEHIND", after: "BEHIND", before: "BEFORE",
    under: "UNDER", below: "UNDER", beneath: "UNDER", beside: "BESIDE", by: "BESIDE",
    with: "WITH", to: "TO", at: "TO", toward: "TO", towards: "TO", for: "TO", from: "FROM" };
  const PREP_PHRASES = { "in front of": "BEFORE", "next to": "BESIDE", "out of": "FROM",
    "on top of": "ON", "away from": "FROM" };
  const SUBJ = { i: "1SG", you: "2SG", he: "3", she: "3", it: "3", we: "1PL", they: "3PL" };
  const OBJ = { me: "1SG", you: "2SG", him: "3", her: "3", it: "3", us: "1PL", them: "3PL" };
  const POSS = { my: "1SG", your: "2SG", his: "3", her: "3", its: "3", our: "1PL", their: "3" };
  const MODALS = new Set(["can", "could", "should", "would", "must", "may", "might", "shall"]);
  const NUM_WORDS = { one: "one", two: "two", three: "three", four: "four", five: "five", six: "six",
    seven: "seven", eight: "eight", nine: "nine", ten: "ten", twenty: "twenty", hundred: "hundred",
    "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven",
    "8": "eight", "9": "nine", "10": "ten", "20": "twenty", "100": "hundred" };
  const UNSUPPORTED = { where: "'where' has no Döspëvnë word in the lexicon",
    when: "'when' has no Döspëvnë word in the lexicon", why: "'why' has no Döspëvnë word in the lexicon",
    how: "'how' has no Döspëvnë word in the lexicon", or: "'or' has no Döspëvnë equivalent; dropped",
    if: "conditional clauses are not described in the grammar; clause juxtaposed" };

  // ---------------------------------------------------------------- lexicon indexes
  const NOUN = {}, VERB = {}, ADJ = {}, PHRASE = {};
  function addPhrase(hw, val) { if (hw.includes(" ") && !PHRASE[hw]) PHRASE[hw] = val; }
  function rank(e) { return e.status === "current" ? 0 : 1; }
  const byRank = (obj) => Object.entries(obj).sort((a, b) => rank(a[1]) - rank(b[1]));
  for (const [k, e] of byRank(D.nouns)) for (const hw of e.hw) {
    if (!NOUN[hw]) NOUN[hw] = k; addPhrase(hw, { t: "noun", k });
  }
  for (const [k, e] of byRank(D.verbs)) for (const hw of e.hw) {
    if (!VERB[hw]) VERB[hw] = k;
    if (hw.includes(" ")) { addPhrase(hw, { t: "verb", k }); const f = hw.split(" ")[0]; if (!VERB[f]) VERB[f] = k; }
  }
  for (const [k, e] of byRank(D.adjs)) for (const hw of e.hw) { if (!ADJ[hw]) ADJ[hw] = k; addPhrase(hw, { t: "adj", k }); }
  for (const [w, k] of Object.entries(SYN)) {
    if (D.nouns[NOUN[k]] && !NOUN[w]) NOUN[w] = NOUN[k];
    if (VERB[k] && !VERB[w]) VERB[w] = VERB[k];
    if (ADJ[k] && !ADJ[w]) ADJ[w] = ADJ[k];
  }
  NOUN.cattle = NOUN.cow;
  const ADJ_SPECIAL = new Set(["very"]);

  function nounOf(w) {
    if (NOUN[w]) return { k: NOUN[w], pl: w === "cattle" };
    if (IRREG_PL[w] && NOUN[IRREG_PL[w]]) return { k: NOUN[IRREG_PL[w]], pl: true };
    if (w.endsWith("men") && NOUN[w.slice(0, -3) + "man"]) return { k: NOUN[w.slice(0, -3) + "man"], pl: true };
    if (w.endsWith("ies") && NOUN[w.slice(0, -3) + "y"]) return { k: NOUN[w.slice(0, -3) + "y"], pl: true };
    if (w.endsWith("es") && NOUN[w.slice(0, -2)]) return { k: NOUN[w.slice(0, -2)], pl: true };
    if (w.endsWith("s") && NOUN[w.slice(0, -1)]) return { k: NOUN[w.slice(0, -1)], pl: true };
    return null;
  }
  function verbOf(w) {
    const c = [];
    const push = (lemma, form) => { const k = VERB[lemma]; if (k) c.push({ k, form, lemma }); };
    push(w, "base");
    if (IRREG_PAST[w]) push(IRREG_PAST[w], "past");
    if (IRREG_PP[w]) push(IRREG_PP[w], "pp");
    if (w.endsWith("ies")) push(w.slice(0, -3) + "y", "3s");
    else if (w.endsWith("es")) { push(w.slice(0, -2), "3s"); push(w.slice(0, -1), "3s"); }
    else if (w.endsWith("s")) push(w.slice(0, -1), "3s");
    if (w.endsWith("ied")) push(w.slice(0, -3) + "y", "past");
    else if (w.endsWith("ed")) {
      const s = w.slice(0, -2);
      push(s, "past"); push(w.slice(0, -1), "past");
      if (s.length > 2 && s[s.length - 1] === s[s.length - 2]) push(s.slice(0, -1), "past");
    }
    if (w === "lying") push("lie", "ing");
    if (w === "dying") push("die", "ing");
    if (w.endsWith("ing")) {
      const s = w.slice(0, -3);
      push(s, "ing"); push(s + "e", "ing");
      if (s.length > 2 && s[s.length - 1] === s[s.length - 2]) push(s.slice(0, -1), "ing");
    }
    return c[0] || null;
  }
  function adjOf(w) { return ADJ[w] && !ADJ_SPECIAL.has(w) ? ADJ[w] : null; }

  // ---------------------------------------------------------------- tokenizing
  function normalize(s) {
    s = " " + s.toLowerCase().replace(/[’‘`]/g, "'") + " ";
    const rep = [[/\bwon't\b/g, "will not"], [/\bcan't\b/g, "can not"], [/\bcannot\b/g, "can not"],
      [/n't\b/g, " not"], [/'m\b/g, " am"], [/'re\b/g, " are"], [/'ll\b/g, " will"],
      [/'ve\b/g, " have"], [/'d\b/g, " would"],
      [/\b(he|she|it|that|what|who|there|here)'s\b/g, "$1 is"], [/\by'all\b/g, "you all"],
      [/s'(\s)/g, "s 's$1"], [/'s\b/g, " 's"]];
    for (const [a, b] of rep) s = s.replace(a, b);
    return s.trim();
  }
  function sentences(text) {
    const out = [];
    const re = /[^.?!]+[.?!]*/g; let m;
    while ((m = re.exec(text))) { const t = m[0].trim(); if (t) out.push(t); }
    return out;
  }
  function tokens(s) {
    return (normalize(s).match(/'s|[a-zäöüëåāēō-]+|\d+|[,;:]/g) || []);
  }

  // ---------------------------------------------------------------- English → Döspëvnë
  const W = (f, g) => ({ f, g });
  const formOf = (pair) => W(pair[0], pair[1]);

  function isDet(t) { return ["the", "a", "an", "some", "any", "this", "that", "these", "those"].includes(t); }
  function startsNP(t, nxt) {
    return isDet(t) || POSS[t] !== undefined || NUM_WORDS[t] || SUBJ[t] || OBJ[t] ||
      nounOf(t) || adjOf(t) || t === "very" || t === "who" || t === "what" || t === "all" || t === "many";
  }

  function matchPhrase(toks, i, table) {
    for (let n = 4; n >= 2; n--) {
      const p = toks.slice(i, i + n).join(" ");
      if (table[p] !== undefined) return { val: table[p], n };
    }
    return null;
  }

  function parseNP(toks, i, notes) {
    const np = { adjs: [], pl: false, def: false };
    let start = i;
    for (;;) {
      const t = toks[i];
      if (t === undefined) break;
      if (t === "the") { np.def = true; i++; continue; }
      if (["a", "an", "some", "any"].includes(t)) { i++; continue; }
      if (t === "this" || t === "these") { np.dem = "this"; if (t === "these") np.pl = true; i++; continue; }
      if ((t === "that" || t === "those") && (nounOf(toks[i + 1] || "") || adjOf(toks[i + 1] || "") || NUM_WORDS[toks[i + 1]])) {
        np.dem = "that"; if (t === "those") np.pl = true; i++; continue;
      }
      if (POSS[t] && !(t === "her" && !(nounOf(toks[i + 1] || "") || adjOf(toks[i + 1] || "") || NUM_WORDS[toks[i + 1]] || toks[i + 1] === "very"))) {
        np.poss = { pron: POSS[t] }; i++; continue;
      }
      if (NUM_WORDS[t] && !(t === "one" && np.num)) { np.num = NUM_WORDS[t]; if (np.num !== "one") np.pl = true; i++; continue; }
      if (t === "very" && adjOf(toks[i + 1] || "")) { np.adjs.push({ k: adjOf(toks[i + 1]), very: true }); i += 2; continue; }
      if ((t === "all" || t === "many") && (nounOf(toks[i + 1] || "") || adjOf(toks[i + 1] || ""))) { np.adjs.push({ k: ADJ[t] }); i++; continue; }
      const ph = matchPhrase(toks, i, PHRASE);
      if (ph && ph.val.t === "noun") { np.head = { k: ph.val.k }; i += ph.n; break; }
      const a = adjOf(t), n = nounOf(t);
      if (a && (nounOf(toks[i + 1] || "") || adjOf(toks[i + 1] || "") || matchPhrase(toks, i + 1, PHRASE))) { np.adjs.push({ k: a }); i++; continue; }
      if (n) { np.head = { k: n.k }; if (n.pl) np.pl = true; i++; break; }
      if (i === start && (SUBJ[t] || OBJ[t])) {
        if (t === "you" && toks[i + 1] === "all") { np.pron = "2PL"; i += 2; }
        else { np.pron = SUBJ[t] || OBJ[t]; i++; }
        break;
      }
      if (i === start && (t === "who" || t === "what")) { np.wh = t; i++; break; }
      break;
    }
    if (!np.head && !np.pron && !np.wh) {
      if (np.def || np.dem || np.poss || np.num) {
        // determiner followed by an unknown word: treat it as an unknown noun
        const t = toks[i];
        if (t && !PREPS[t] && !["and", "but", ","].includes(t)) { np.head = { unknown: t }; notes.add(`'${t}' is not in the lexicon`); i++; }
        else return null;
      } else return null;
    }
    // possessive 's
    if (toks[i] === "'s") {
      i++;
      const head = parseNP(toks, i, notes);
      if (head && head.np.head) { head.np.poss = { np }; return head; }
      return { np, next: i };
    }
    // X of Y
    if (np.head && toks[i] === "of" && !np.num) {
      const p = parseNP(toks, i + 1, notes);
      if (p) { np.poss = { np: p.np }; i = p.next; }
    }
    // coordination: X and Y (not when 'and' starts a new clause)
    if (toks[i] === "and" && toks[i + 1] && startsNP(toks[i + 1])) {
      const after = parseNP(toks, i + 1, notes);
      if (after) { np.coord = after.np; i = after.next; }
    }
    return { np, next: i };
  }

  function nounWords(np, kind) {
    const out = [];
    if (np.poss) {
      if (np.poss.pron) out.push(W(D.pron[np.poss.pron === "3PL" ? "3" : np.poss.pron].gen, (np.poss.pron === "3PL" ? "3" : np.poss.pron) + ".GEN"));
      else out.push(...nounWords(np.poss.np, "gen"));
    }
    if (np.dem === "this") out.push(W(D.gram.this.f, "this"));
    if (np.dem === "that") out.push(W(D.pron["3"].f, "that"));
    const n = np.head && np.head.k ? D.nouns[np.head.k] : null;
    if (np.num) {
      out.push(W(D.nums[np.num].f, np.num));
      const cl = n ? n.cl : "CL.CLOD";
      out.push(W(D.cls[cl].f, cl));
    }
    for (const a of np.adjs) {
      if (a.very) out.push(W(D.adjs.very.f, "very"));
      out.push(W(D.adjs[a.k].f, D.adjs[a.k].hw[0].replace(/ /g, ".")));
    }
    if (np.pron) {
      const p = np.pron === "3PL" ? "3" : np.pron;
      const g = np.pron === "3PL" ? "3PL" : np.pron === "3" ? "3SG" : np.pron;
      out.push(kind === "gen" ? W(D.pron[p].gen, g + ".GEN") : W(D.pron[p].f, g));
    } else if (np.wh) {
      out.push(W(D.gram[np.wh].f, np.wh));
    } else if (n) {
      const usePl = np.pl && !np.num && !np.coord;
      const useDef = np.def && !np.poss && kind !== "gen";
      let key = kind === "gen" ? (usePl ? "plgen" : "gen") : usePl ? (useDef ? "pldef" : "pl") : (useDef ? "def" : "sg");
      out.push(formOf(n.forms[key]));
    } else if (np.head && np.head.unknown) {
      out.push(W("⟨" + np.head.unknown + "⟩", "?"));
    }
    if (np.coord) { out.push(...nounWords(np.coord, kind)); out.push(W(D.post.WITH.f, "WITH")); }
    return out;
  }

  function personOf(np) {
    if (!np) return "2SG";
    if (np.coord) {
      const ps = []; for (let x = np; x; x = x.coord) ps.push(x.pron || "3");
      if (ps.some((p) => p === "1SG" || p === "1PL")) return "1PL";
      if (ps.some((p) => p === "2SG" || p === "2PL")) return "2PL";
      return "3PL";
    }
    if (np.pron) return np.pron === "3" ? "3SG" : np.pron;
    return np.pl ? "3PL" : "3SG";
  }

  function parseClause(toks, inherited, notes) {
    const c = { objs: [], pps: [], pred: [], vg: { tense: "PRS" }, q: false };
    let i = 0;
    const isQ = toks.q;
    const AUXQ = ["is", "are", "am", "was", "were", "do", "does", "did", "will", "have", "has", "had"];
    if (toks[0] === "who" || toks[0] === "what") {
      const t1 = toks[1];
      if (AUXQ.includes(t1) && toks[2] && startsNP(toks[2]) && toks[2] !== "very") {
        c.whObj = toks[0]; i = 1; c.content = true;
      } else { c.content = true; }
    }
    if (isQ && AUXQ.includes(toks[i]) && !c.whSubj) {
      if (!c.content) c.q = true;
      c.leadAux = toks[i]; i++;
    }
    // subject
    if (toks[i] === "there" && ["is", "are", "was", "were"].includes(toks[i + 1])) { c.exist = true; i++; }
    if (!c.exist) {
      const s = parseNP(toks, i, notes);
      if (s && !(s.np.adjs.length && !s.np.head && !s.np.pron)) { c.subj = s.np; i = s.next; }
    }
    // verb group
    const vg = c.vg;
    const aux = (t) => {
      if (t === "will" || t === "shall") { vg.fut = true; return true; }
      if (t === "do" || t === "does") { vg.doAux = true; return true; }
      if (t === "did") { vg.tense = "PST"; vg.doAux = true; return true; }
      if (["am", "is", "are"].includes(t)) { vg.cop = true; return true; }
      if (["was", "were"].includes(t)) { vg.cop = true; vg.tense = "PST"; return true; }
      if (t === "be" || t === "been" || t === "being") { vg.cop = true; return true; }
      if (["have", "has", "had"].includes(t)) { vg.perfect = true; if (t === "had") vg.tense = "PST"; return true; }
      if (MODALS.has(t)) { notes.add(`modal '${t}' has no Döspëvnë equivalent; dropped`); return true; }
      if (t === "not" || t === "never") { vg.neg = true; if (t === "never") notes.add("'never' rendered as plain negation"); return true; }
      return false;
    };
    if (c.leadAux) aux(c.leadAux);
    if (c.exist) { aux(toks[i]); i++; }
    while (toks[i] !== undefined && aux(toks[i])) i++;
    // the subject may follow a lead auxiliary in questions: handled above (subject parsed after aux)
    const vphr = (() => {
      const t = toks[i];
      if (t === undefined) return null;
      const v = verbOf(t);
      if (!v) return null;
      // multiword verbs: lie fallow, lie down
      for (let n = 2; n >= 1; n--) {
        const p = [v.lemma, ...toks.slice(i + 1, i + 1 + n)].join(" ");
        if (PHRASE[p] && PHRASE[p].t === "verb") return { ...v, k: PHRASE[p].k, n: n + 1 };
      }
      return { ...v, n: 1 };
    })();
    if (vphr && !(vg.cop && (nounOf(toks[i]) || adjOf(toks[i])) && vphr.form !== "ing" && vphr.form !== "pp")) {
      c.verb = vphr; i += vphr.n;
      if (vphr.form === "ing") { if (vg.cop) { vg.prog = true; vg.cop = false; } else notes.add("gerund read as progressive"); vg.prog = true; }
      else if (vphr.form === "past" && !vg.doAux) vg.tense = "PST";
      else if (vphr.form === "pp") {
        if (vg.perfect) { vg.tense = "PST"; notes.add("perfect (have + participle) rendered as past"); }
        else if (vg.cop) { vg.cop = false; vg.tense = "PST"; notes.add("passive voice is not described in the grammar; rendered as active past"); }
        else vg.tense = "PST";
      }
      if (vphr.form === "past" && vg.perfect) notes.add("perfect rendered as past");
    } else if (!vg.cop && toks[i] !== undefined && !startsNP(toks[i]) && !PREPS[toks[i]] && !DIR_WORDS[toks[i]] && /^[a-z]+$/.test(toks[i])) {
      c.unknownVerb = toks[i]; notes.add(`'${toks[i]}' is not in the lexicon`); i++;
    }
    if (!c.subj && !c.exist && (c.verb || c.unknownVerb) && !c.content && i > 0 && !c.leadAux && !inherited) {
      c.imperative = true; notes.add("imperatives are not described in the grammar; rendered as 2SG present without a pronoun");
    }
    if (!c.subj && inherited && !c.exist) c.subj = inherited;
    // in questions with a leading aux, the subject comes after the aux
    if (!c.subj && c.leadAux) {
      const s = parseNP(toks, i, notes);
      if (s) { c.subj = s.np; i = s.next; while (toks[i] !== undefined && aux(toks[i])) i++; }
      const v = toks[i] !== undefined ? verbOf(toks[i]) : null;
      if (v && !(vg.cop && (nounOf(toks[i]) || adjOf(toks[i])) && v.form !== "ing")) {
        c.verb = { ...v, n: 1 }; i++;
        if (v.form === "ing") { vg.prog = true; vg.cop = false; }
      }
    }
    // complements
    while (i < toks.length) {
      const t = toks[i];
      if ([",", ";", ":", "and", "but"].includes(t)) { i++; continue; }
      const dp = matchPhrase(toks, i, DIR_PHRASES);
      if (dp) { c.pps.push({ dir: dp.val }); i += dp.n; continue; }
      if (DIR_WORDS[t]) { c.pps.push({ dir: DIR_WORDS[t] }); i++; continue; }
      const pp = matchPhrase(toks, i, PREP_PHRASES);
      if (pp || PREPS[t]) {
        const post = pp ? pp.val : PREPS[t];
        const r = parseNP(toks, i + (pp ? pp.n : 1), notes);
        if (r) { c.pps.push({ post, np: r.np }); i = r.next; continue; }
        i += pp ? pp.n : 1; continue;
      }
      if (vg.cop && (t === "very" || adjOf(t)) && !(nounOf(toks[i + 1] || "") && adjOf(t))) {
        if (t === "very" && adjOf(toks[i + 1] || "")) { c.pred.push(W(D.adjs.very.f, "very")); i++; continue; }
        const a = D.adjs[adjOf(t)]; c.pred.push(W(a.f, a.hw[0].replace(/ /g, "."))); i++; continue;
      }
      if (!c.verb && !c.subj && (t === "very" || adjOf(t)) && !nounOf(toks[i + 1] || "")) {
        if (t === "very") { c.pred.push(W(D.adjs.very.f, "very")); i++; continue; }
        const a = D.adjs[adjOf(t)]; c.pred.push(W(a.f, a.hw[0].replace(/ /g, "."))); c.fragment = true; i++; continue;
      }
      if (UNSUPPORTED[t]) { notes.add(UNSUPPORTED[t]); i++; continue; }
      const r = parseNP(toks, i, notes);
      if (r) {
        if (vg.cop && !c.verb) c.predNP = r.np; else c.objs.push(r.np);
        i = r.next; continue;
      }
      if (t === "'s") { i++; continue; }
      notes.add(`'${t}' is not in the lexicon`);
      c.pps.push({ unknown: t }); i++;
    }
    if (c.exist && c.predNP) { c.subj = c.predNP; c.predNP = null; }
    if (c.fragment && !c.subj && !c.verb) { c.vg.cop = true; c.impliedSubj = true; c.imperative = false;
      notes.add("verbless reply: 3SG copula supplied, subject left implicit"); }
    if (c.whObj && !c.verb && vg.cop) { c.predNP = { wh: c.whObj, adjs: [] }; }
    else if (c.whObj) c.objs.unshift({ wh: c.whObj, adjs: [] });
    return c;
  }

  function verbWords(c) {
    const vg = c.vg, out = [];
    const person = c.imperative ? "2SG" : c.impliedSubj ? "3SG" : personOf(c.subj);
    const t = vg.fut ? "FUT" : vg.tense;
    const be = D.verbs.be.forms;
    if (vg.prog && c.verb) {
      out.push(formOf(D.verbs[c.verb.k].forms.PROG));
      out.push(formOf(be[`${t}.${person}`]));
    } else if (c.verb) {
      out.push(formOf(D.verbs[c.verb.k].forms[`${t}.${person}`]));
    } else if (c.unknownVerb) {
      out.push(W("⟨" + c.unknownVerb + "⟩", "?"));
    } else {
      out.push(formOf(be[`${t}.${person}`]));
    }
    if (vg.neg) out.push(W(D.gram.NEG.f, "NEG"));
    return out;
  }

  function renderClause(c) {
    const words = [];
    if (c.subj && !c.imperative) words.push(...nounWords(c.subj, "nom"));
    const give = c.verb && D.verbs[c.verb.k].hw[0] === "give" && c.objs.length === 2;
    c.objs.forEach((o, n) => {
      words.push(...nounWords(o, "nom"));
      if (give && n === 0) words.push(W(D.post.TO.f, "TO"));
    });
    for (const p of c.pps) {
      if (p.dir) { const d = D.dirs[p.dir]; words.push(W(d.f, p.dir)); }
      else if (p.unknown) words.push(W("⟨" + p.unknown + "⟩", "?"));
      else { words.push(...nounWords(p.np, "nom")); const pp = D.post[p.post]; words.push(W(pp.f, pp.label)); }
    }
    if (c.predNP) words.push(...nounWords(c.predNP, "nom"));
    words.push(...c.pred);
    words.push(...verbWords(c));
    if (c.q) words.push(W(D.gram.Q.f, "Q"));
    return words;
  }

  function splitClauses(toks) {
    const parts = []; let cur = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], n = toks[i + 1] || "";
      const verbish = verbOf(n) && !nounOf(n) && !adjOf(n) && !isDet(n);
      const leftHasVerb = cur.some((x) => verbOf(x) || ["is", "are", "am", "was", "were", "will"].includes(x));
      if (t === ";" || (t === "," && cur.length && toks.slice(i + 1).some((x) => verbOf(x))) ||
          ((t === "and" || t === "but") && leftHasVerb && (SUBJ[n] || verbish))) {
        if (t === "but") parts.notes = (parts.notes || []).concat(["'but' has no Döspëvnë equivalent; clauses juxtaposed"]);
        if (cur.length) parts.push(cur); cur = []; continue;
      }
      cur.push(t);
    }
    if (cur.length) parts.push(cur);
    return parts;
  }

  function en2do(text) {
    const result = [];
    for (const s of sentences(text)) {
      const notes = new Set();
      const q = /\?\s*$/.test(s);
      const toks = tokens(s);
      if (!toks.length) continue;
      const clauses = splitClauses(toks);
      (clauses.notes || []).forEach((n) => notes.add(n));
      const words = []; let prevSubj = null;
      for (const ct of clauses) {
        ct.q = q;
        const c = parseClause(ct, prevSubj, notes);
        if (c.subj) prevSubj = c.subj;
        if (c.subj && c.subj.pron === "2SG" && !notes.has("you2")) notes.add("'you' read as singular; write 'you all' for plural");
        words.push(...renderClause(c));
      }
      result.push({ source: s, words, notes: [...notes].filter((n) => n !== "you2") });
    }
    return result;
  }

  // ---------------------------------------------------------------- Döspëvnë → English
  const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/å/g, "a");
  const IDX = {}, FIDX = {};
  function idx(form, a) {
    const s = form.replace(/[=\-]/g, "");
    (IDX[s] = IDX[s] || []).push(a);
    const f = fold(s); (FIDX[f] = FIDX[f] || []).push(a);
  }
  for (const [k, n] of Object.entries(D.nouns)) for (const [kind, p] of Object.entries(n.forms))
    idx(p[0], { pos: "noun", k, en: n.hw[0], kind, gloss: p[1], seg: p[0] });
  for (const [k, v] of Object.entries(D.verbs)) for (const [cell, p] of Object.entries(v.forms))
    idx(p[0], { pos: cell === "NMLZ" ? "vnoun" : cell === "PROG" ? "prog" : "verb", k, en: v.hw[0], cell, gloss: p[1], seg: p[0] });
  for (const [k, a] of Object.entries(D.adjs)) idx(a.f, { pos: k === "very" ? "very" : "adj", k, en: a.hw[0], gloss: a.hw[0].replace(/ /g, "."), seg: a.f });
  for (const [k, a] of Object.entries(D.nums)) idx(a.f, { pos: "num", k, en: k, gloss: k, seg: a.f });
  for (const [k, a] of Object.entries(D.dirs)) idx(a.f, { pos: "dir", k, en: k, gloss: k, seg: a.f });
  for (const [p, a] of Object.entries(D.pron)) {
    idx(a.f, { pos: "pron", k: p, en: p, gloss: p === "3" ? "3SG" : p, seg: a.f });
    idx(a.gen, { pos: "poss", k: p, en: p, gloss: (p === "3" ? "3" : p) + ".GEN", seg: a.gen });
  }
  for (const [k, a] of Object.entries(D.post)) idx(a.f, { pos: "post", k, en: k, gloss: a.label, seg: a.f });
  for (const [k, a] of Object.entries(D.cls)) idx(a.f, { pos: "cl", k, en: k, gloss: k, seg: a.f });
  idx(D.gram.NEG.f, { pos: "neg", gloss: "NEG", seg: D.gram.NEG.f });
  idx(D.gram.Q.f, { pos: "q", gloss: "Q", seg: D.gram.Q.f });
  idx(D.gram.this.f, { pos: "dem", k: "this", en: "this", gloss: "this", seg: D.gram.this.f });
  idx(D.pron["3"].f, { pos: "dem", k: "that", en: "that", gloss: "that", seg: D.pron["3"].f });
  for (const w of ["who", "what"]) idx(D.gram[w].f, { pos: "wh", k: w, en: w, gloss: w, seg: D.gram[w].f });

  const PREP_EN = { PROG: "in", ON: "on", BEHIND: "behind", BEFORE: "in front of", UNDER: "under",
    BESIDE: "beside", WITH: "with", TO: "to", FROM: "from" };
  const DIR_EN = { rimward: "rimward", hubward: "hubward", sunwise: "sunwise", nightwise: "nightwise" };
  const SUBJ_EN = { "1SG": "I", "2SG": "you", "3": "he/she/it", "1PL": "we", "2PL": "you all", "3SG": "he/she/it", "3PL": "they" };
  const OBJ_EN = { "1SG": "me", "2SG": "you", "3": "him/her/it", "1PL": "us", "2PL": "you all" };
  const POSS_EN = { "1SG": "my", "2SG": "your", "3": "his/her/its", "1PL": "our", "2PL": "your" };

  function pluralEn(w) {
    if (PL_OF[w]) return PL_OF[w];
    if (/man$/.test(w)) return w.slice(0, -3) + "men";
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ies";
    if (/(s|sh|ch|x|z)$/.test(w)) return w + "es";
    return w + "s";
  }
  function pastEn(w) {
    if (PAST_OF[w]) return PAST_OF[w];
    if (/e$/.test(w)) return w + "d";
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ied";
    return w + "ed";
  }
  function ingEn(w) {
    if (w === "lie") return "lying";
    if (w === "die") return "dying";
    if (/[^e]e$/.test(w)) return w.slice(0, -1) + "ing";
    return w + "ing";
  }
  function s3En(w) {
    if (w === "be") return "is";
    if (/(s|sh|ch|x|z|o)$/.test(w)) return w + "es";
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ies";
    return w + "s";
  }
  const beEn = (tense, person) => tense === "FUT" ? "will be" :
    tense === "PST" ? (["1SG", "3SG"].includes(person) ? "was" : "were") :
    person === "1SG" ? "am" : person === "3SG" ? "is" : "are";

  function analyses(tok) {
    const t = tok.toLowerCase();
    return IDX[t] || FIDX[fold(t)] || [];
  }

  function choose(cands, ctx) {
    if (!cands.length) return null;
    const pref = (order) => { for (const p of order) { const c = cands.find((x) => x.pos === p); if (c) return c; } return cands[0]; };
    if (ctx.nextCl && cands.some((x) => x.pos === "num")) return pref(["num"]);
    if (ctx.last && ctx.afterVerb) return pref(["neg", "q", "verb", "post"]);
    if (ctx.last) return pref(["q", "verb", "neg", "prog", "noun", "adj"]);
    if (ctx.nextIsQ || ctx.nextIsNeg) return pref(["verb", "prog", "noun"]);
    if (ctx.first) return pref(["pron", "noun", "poss", "dem", "num", "adj", "very", "verb"]);
    if (ctx.prevNum) return pref(["cl", "noun"]);
    if (ctx.prevNounLike) return pref(["post", "dir", "noun", "adj", "very", "num", "verb", "prog", "pron"]);
    if (ctx.nextAdj) return pref(["very", "dem", "poss", "num", "adj", "noun"]);
    return pref(["noun", "num", "poss", "adj", "dir", "pron", "dem", "verb", "prog", "post"]);
  }

  function do2en(text) {
    const result = [];
    for (const s of sentences(text)) {
      const toks = s.replace(/[.?!,;:]/g, " ").split(/\s+/).filter(Boolean);
      const notes = new Set();
      const all = toks.map((t) => analyses(t));
      const picked = [];
      for (let i = 0; i < toks.length; i++) {
        const nextA = all[i + 1] || [];
        const prev = picked[i - 1];
        const ctx = {
          first: i === 0, last: i === toks.length - 1,
          afterVerb: !!prev && (prev.pos === "verb" || prev.pos === "prog"),
          nextIsQ: nextA.some((a) => a.pos === "q") && i + 1 === toks.length - 1,
          nextIsNeg: nextA.some((a) => a.pos === "neg") && (i + 1 === toks.length - 1 || (all[i + 2] || []).some((a) => a.pos === "q")),
          prevNum: !!prev && prev.pos === "num",
          prevNounLike: !!prev && ["noun", "pron", "vnoun", "prog"].includes(prev.pos),
          nextAdj: nextA.some((a) => a.pos === "adj"),
          nextCl: nextA.some((a) => a.pos === "cl"),
        };
        let a = choose(all[i], ctx);
        if (a && a.pos === "neg" && !(prev && (prev.pos === "verb" || prev.pos === "prog"))) {
          a = all[i].find((x) => x.pos === "noun") || a;
        }
        if (!a) notes.add(`'${toks[i]}' is not a known Döspëvnë form`);
        picked.push(a || { pos: "unknown", gloss: "?", seg: toks[i], raw: toks[i] });
        if (all[i].length > 1) {
          const alts = [...new Set(all[i].map((x) => x.gloss))];
          if (alts.length > 1) notes.add(`'${toks[i]}' is ambiguous: ${alts.join(", ")}`);
        }
      }
      result.push({ source: s, words: picked.map((p) => ({ f: p.seg, g: p.gloss })), reading: reading(picked), notes: [...notes] });
    }
    return result;
  }

  function npEn(p, role) {
    if (p.pos === "pron") return role === "subj" ? SUBJ_EN[p.k] : OBJ_EN[p.k];
    if (p.pos === "wh") return p.en;
    if (p.pos === "noun") {
      const pl = p.kind.startsWith("pl"), def = p.kind.includes("def");
      let w = pl ? pluralEn(p.en) : p.en;
      if (p.kind.endsWith("gen")) return (def ? "the " : "") + w + (pl ? "'" : "'s");
      return (def ? "the " : "") + w;
    }
    if (p.pos === "vnoun") return ingEn(p.en);
    return p.en || p.raw || "?";
  }

  function reading(ws) {
    // split into clauses: each ends at a finite verb (plus NEG / Q)
    const clauses = []; let cur = [];
    ws.forEach((w, n) => {
      cur.push(w);
      const nx = ws[n + 1];
      if ((w.pos === "verb" || w.pos === "neg" || w.pos === "q") && !(nx && (nx.pos === "neg" || nx.pos === "q"))) {
        clauses.push(cur); cur = [];
      }
    });
    if (cur.length) clauses.push(cur);
    const out = clauses.map(clauseReading).filter(Boolean);
    if (!out.length) return "";
    const lower = (c) => /^I\b/.test(c) ? c : c.charAt(0).toLowerCase() + c.slice(1);
    return out.map((c, n) => (n ? lower(c) : c)).map((c, n) => n < out.length - 1 ? c.replace(/[.?]$/, "") : c).join(", ");
  }

  function clauseReading(ws) {
    const chunks = []; let cur = [];
    const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
    let verb = null, neg = false, q = false, prog = null;
    for (const w of ws) {
      if (w.pos === "verb") { flush(); verb = w; continue; }
      if (w.pos === "prog") { flush(); prog = w; continue; }
      if (w.pos === "neg") { neg = true; continue; }
      if (w.pos === "q") { q = true; continue; }
      if (w.pos === "post") { flush(); if (chunks.length) chunks[chunks.length - 1].push(w); else chunks.push([w]); continue; }
      if (w.pos === "dir") { flush(); chunks.push([w]); continue; }
      if (["noun", "pron", "wh", "vnoun", "unknown"].includes(w.pos)) { cur.push(w); flush(); continue; }
      cur.push(w);
    }
    flush();
    const phrase = (ch, role) => {
      const parts = []; let post = null, very = false, num = null;
      for (const w of ch) {
        if (w.pos === "post") post = PREP_EN[w.k];
        else if (w.pos === "dir") parts.push(DIR_EN[w.k]);
        else if (w.pos === "very") very = true;
        else if (w.pos === "adj") { parts.push((very ? "very " : "") + w.en); very = false; }
        else if (w.pos === "num") { parts.push(w.en); num = w.en; }
        else if (w.pos === "cl") continue;
        else if (w.pos === "dem") parts.push(w.en);
        else if (w.pos === "poss") parts.push(POSS_EN[w.k]);
        else if (w.pos === "noun" && num && num !== "one" && w.kind === "sg") parts.push(pluralEn(w.en));
        else if (w.pos === "noun" && num && w.kind === "def") parts.splice(0, 0, "the"), parts.push(num !== "one" ? pluralEn(w.en) : w.en);
        else parts.push(npEn(w, role));
      }
      if (very) parts.push("very");
      const s = parts.join(" ");
      return post ? `${post} ${s}`.trim() : s;
    };
    let subj = null, subjChunk = null; const rest = [], preds = [], pps = [];
    chunks.forEach((ch, n) => {
      const isPP = ch.some((w) => w.pos === "post" || w.pos === "dir");
      const headless = ch.every((w) => ["adj", "very", "num", "cl", "dem", "poss"].includes(w.pos));
      if (!subj && n === 0 && !isPP && !headless) { subj = phrase(ch, "subj"); subjChunk = ch; }
      else if (headless) preds.push(phrase(ch, "obj"));
      else if (isPP) pps.push(phrase(ch, "obj"));
      else rest.push(phrase(ch, "obj"));
    });
    rest.push(...pps);
    const v = verb;
    let tense = "PRS", person = "3SG";
    if (v) { const m = v.cell.split("."); tense = m[0]; person = m[1]; }
    if (subjChunk) {
      const h = subjChunk[subjChunk.length - 1];
      if (h.pos === "pron") person = h.k === "3" ? person : h.k;
    }
    if (!subj && v) subj = SUBJ_EN[person] || "he/she/it";
    if (!subj && !v && !prog) return cap(`${[...preds, ...rest].join(" ")}`) + ".";
    if (subj === "he/she/it" && person === "3PL") subj = "they";
    const isBe = v && v.en === "be";
    if (prog) {
      const be = beEn(tense, person);
      if (q) return cap(`${be} ${subj || ""} ${neg ? "not " : ""}${ingEn(prog.en)} ${rest.join(" ")} ${preds.join(" ")}`) + "?";
      return cap(`${subj || ""} ${be}${neg ? " not" : ""} ${ingEn(prog.en)} ${[...rest, ...preds].join(" ")}`) + ".";
    }
    if (isBe || !v) {
      const be = beEn(tense, person);
      if (q) return cap(`${be}${neg ? "n't" : ""} ${subj || ""} ${[...rest, ...preds].join(" ")}`) + "?";
      return cap(`${subj || ""} ${v ? be + (neg ? " not" : "") : ""} ${[...preds, ...rest].join(" ")}`) + ".";
    }
    const base = v.en;
    if (q) {
      const aux = tense === "FUT" ? "will" : tense === "PST" ? "did" : person === "3SG" ? "does" : "do";
      return cap(`${aux}${neg ? "n't" : ""} ${subj || ""} ${base} ${[...rest, ...preds].join(" ")}`) + "?";
    }
    let vp;
    if (tense === "FUT") vp = "will " + (neg ? "not " : "") + base;
    else if (neg) vp = (tense === "PST" ? "did" : person === "3SG" ? "does" : "do") + " not " + base;
    else vp = tense === "PST" ? pastEn(base) : person === "3SG" ? s3En(base) : base;
    return cap(`${subj || ""} ${vp} ${[...rest, ...preds].join(" ")}`) + ".";
  }
  const cap = (s) => { s = s.replace(/\s+/g, " ").trim().replace(/\s+([?.])$/, "$1"); return s.charAt(0).toUpperCase() + s.slice(1); };

  return { en2do, do2en };
}
if (typeof module !== "undefined") module.exports = createTranslator;

#!/usr/bin/env node
/**
 * Design-system audit.
 *
 * A system that is only written down drifts. These are the rules that can
 * be checked mechanically, so review time can go on the ones that cannot.
 *
 *   node tools/audit.mjs          # or: npm run audit
 *   node tools/audit.mjs --quiet  # errors only
 *
 * Exits non-zero on any error. Notes are informational and never fail.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const TOKENS_CSS = path.join(SRC, 'styles/tokens.css');
const TOKENS_TS = path.join(SRC, 'system/tokens.ts');

const QUIET = process.argv.includes('--quiet');

const errors = [];
const notes = [];
const fail = (rule, where, msg) => errors.push({ rule, where, msg });
const note = (rule, where, msg) => notes.push({ rule, where, msg });

/* ---------------------------------------------------------------- */
/* Files                                                             */
/* ---------------------------------------------------------------- */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(p)) out.push(p);
  }
  return out;
}

const FILES = walk(SRC);
const rel = (p) => path.relative(ROOT, p);
const read = (p) => readFileSync(p, 'utf8');

/**
 * The device shell is hardware, not print: its bezel, camera and screws are
 * genuinely neutral, and forcing them into the four inks would make the
 * phone look painted. It is the one file outside the token layer allowed
 * literal colour.
 */
const HARDWARE = 'src/components/PhoneFrame.css';

/** Illustrations are the art layer — SVG fills cannot resolve var(). */
const isArt = (p) => rel(p).startsWith('src/illustrations/');

/** The reference site quotes token values verbatim; that is its job. */
const isDocs = (p) => rel(p).startsWith('src/system/');

/* ---------------------------------------------------------------- */
/* Colour maths (mirrors src/system/tokens.ts)                        */
/* ---------------------------------------------------------------- */

function parseHex(s) {
  const m = /^#([0-9a-f]{3,8})$/i.exec(s.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (h.length < 6) return null;
  const n = parseInt(h.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function chroma({ r, g, b }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/* ---------------------------------------------------------------- */
/* 1 — Token parity                                                   */
/* ---------------------------------------------------------------- */

const tokensCss = read(TOKENS_CSS);
const declaredInRoot = new Set();
{
  const root = /:root\s*\{([\s\S]*?)\n\}/.exec(tokensCss);
  if (!root) fail('parity', rel(TOKENS_CSS), 'no :root block found');
  /* Several tokens share a line, so this cannot be anchored — but a
     var() reference inside a value must not be read as a declaration. */
  else for (const m of root[1].matchAll(/(?<!var\(\s*)(--[a-z0-9-]+)\s*:/g)) declaredInRoot.add(m[1]);
}

const tokensTs = read(TOKENS_TS);
const documented = new Set(
  [...tokensTs.matchAll(/name:\s*'(--[a-z0-9-]+)'/g)].map((m) => m[1]),
);

for (const name of declaredInRoot) {
  if (!documented.has(name)) {
    fail('parity', rel(TOKENS_CSS), `${name} is declared but not documented in system/tokens.ts`);
  }
}
for (const name of documented) {
  if (!declaredInRoot.has(name)) {
    fail('parity', rel(TOKENS_TS), `${name} is documented but not declared in styles/tokens.css`);
  }
}

/* ---------------------------------------------------------------- */
/* 2 — No neutral in the palette                                      */
/* ---------------------------------------------------------------- */

const NEUTRAL_AT = 0.045;
for (const m of tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{3,8})\s*;/gim)) {
  const [, name, hex] = m;
  const rgb = parseHex(hex);
  if (!rgb) continue;
  const c = chroma(rgb);
  if (c < NEUTRAL_AT) {
    fail('no-grey', rel(TOKENS_CSS),
      `${name} (${hex}) measures neutral — chroma ${c.toFixed(3)}. There is no grey in this palette.`);
  }
}

/* ---------------------------------------------------------------- */
/* 3 — Every var() reference resolves                                 */
/* ---------------------------------------------------------------- */

const declaredAnywhere = new Set(declaredInRoot);
for (const file of FILES) {
  const src = read(file);
  if (file.endsWith('.css')) {
    for (const m of src.matchAll(/(?<!var\(\s*)(--[a-z0-9-]+)\s*:/g)) declaredAnywhere.add(m[1]);
  } else {
    /* A screen may set a custom property from a style object:
       style={{ ['--av-ink' as string]: INK_VAR[ink] }} */
    for (const m of src.matchAll(/\[\s*'(--[a-z0-9-]+)'[^\]]*\]\s*:/g)) declaredAnywhere.add(m[1]);
  }
}

for (const file of FILES) {
  const src = read(file);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)\s*[,)]/g)) {
    if (!declaredAnywhere.has(m[1])) {
      fail('unknown-token', rel(file), `var(${m[1]}) names a custom property nothing declares`);
    }
  }
}

/* ---------------------------------------------------------------- */
/* 4 — No raw colour outside the token layer                          */
/* ---------------------------------------------------------------- */

/**
 * #000, #fff and a zero-alpha rgba are mask operands and gradient
 * terminals — an absence of colour rather than a choice of one.
 */
const MASK_OPERAND = /^(#(0{3,4}|0{6}|0{8}|f{3,4}|f{6}|f{8})|rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\))$/i;

const COLOUR_IN_CSS = /#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)/gi;
const COLOUR_IN_TS = /'#[0-9a-f]{3,8}'|"#[0-9a-f]{3,8}"|'rgba?\([^)]*\)'|"rgba?\([^)]*\)"/gi;

function triple(raw) {
  const hex = parseHex(raw);
  if (hex) return `${hex.r},${hex.g},${hex.b}`;
  const fn = /^rgba?\(([^)]+)\)$/i.exec(raw);
  if (!fn) return null;
  const p = fn[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null;
  return `${p[0]},${p[1]},${p[2]}`;
}

/**
 * The palette is closed, not the syntax.
 *
 * Every colour that appears anywhere in tokens.css — including the browns
 * buried inside the elevation shadows — is a known pigment. Repeating one
 * with a different alpha is drift worth counting; introducing a hue that
 * is in no token at all is a new ink entering the system without a
 * decision, and that fails.
 */
const PALETTE = new Set();
for (const m of tokensCss.matchAll(COLOUR_IN_CSS)) {
  const t = triple(m[0]);
  if (t) PALETTE.add(t);
}

const drift = new Map();

for (const file of FILES) {
  const r = rel(file);
  if (file === TOKENS_CSS || r === HARDWARE || isArt(file) || isDocs(file)) continue;

  read(file).split('\n').forEach((line, i) => {
    if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;   // comments describe, they do not render
    /* CSS: any hex or rgb(). TSX: only a quoted colour, so prose like
       'Invoice #114' is never mistaken for a pigment. */
    for (const m of line.matchAll(file.endsWith('.css') ? COLOUR_IN_CSS : COLOUR_IN_TS)) {
      const raw = m[0].replace(/['"]/g, '');
      if (MASK_OPERAND.test(raw)) continue;
      const t = triple(raw);
      if (t && PALETTE.has(t)) {
        drift.set(r, (drift.get(r) ?? 0) + 1);
      } else {
        fail('new-pigment', `${r}:${i + 1}`,
          `${raw} is in no token. Four inks go to press — derive it in styles/tokens.css or use an existing one.`);
      }
    }
  });
}

for (const [file, n] of [...drift].sort((a, b) => b[1] - a[1])) {
  note('literal-repeat', file, `${n} palette colour${n === 1 ? '' : 's'} written literally instead of through a token`);
}

/* Art and hardware are allowed literals, but they should still be counted —
   a drawing that has grown fifty colours has stopped being a riso print. */
for (const file of FILES) {
  if (!isArt(file) && rel(file) !== HARDWARE) continue;
  const hits = [...read(file).matchAll(/#[0-9a-f]{3,8}\b/gi)]
    .map((m) => m[0]).filter((h) => !MASK_OPERAND.test(h));
  if (hits.length) {
    note('art-layer', rel(file), `${hits.length} literal colours (${new Set(hits).size} distinct)`);
  }
}

/* ---------------------------------------------------------------- */
/* 5 — No hand-rolled springs                                         */
/* ---------------------------------------------------------------- */

const MOTION = 'src/lib/motion.ts';
for (const file of FILES) {
  const r = rel(file);
  if (r === MOTION || isDocs(file) || !/\.tsx?$/.test(file)) continue;
  read(file).split('\n').forEach((line, i) => {
    if (/\bstiffness\s*:/.test(line)) {
      fail('hand-rolled-spring', `${r}:${i + 1}`,
        'spring constants belong in lib/motion.ts — import a preset instead');
    }
  });
}

/* ---------------------------------------------------------------- */
/* 6 — No hand-formatted money in screens                             */
/* ---------------------------------------------------------------- */

/* A bare ₹ is fine — it is a symbol, and screens legitimately label one.
   A ₹ welded to a number or an interpolation is a second implementation
   of formatting, and that is what drifts. */
const HAND_BUILT = /₹\s*(?:\d|\$\{|'\s*\+|"\s*\+)/;

for (const file of FILES) {
  const r = rel(file);
  if (!r.startsWith('src/screens/') || !/\.tsx?$/.test(file)) continue;
  read(file).split('\n').forEach((line, i) => {
    if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
    if (HAND_BUILT.test(line)) {
      fail('hand-formatted-money', `${r}:${i + 1}`,
        'render currency through lib/format.ts (inr, signedINR, compactINR) or <Amount>');
    }
  });
}

/* ---------------------------------------------------------------- */
/* Report                                                             */
/* ---------------------------------------------------------------- */

const CHECKS = [
  ['parity', 'tokens.css ↔ system/tokens.ts'],
  ['no-grey', 'no neutral in the palette'],
  ['unknown-token', 'every var() resolves'],
  ['new-pigment', 'no colour outside the palette'],
  ['hand-rolled-spring', 'springs come from lib/motion.ts'],
  ['hand-formatted-money', 'currency comes from lib/format.ts'],
];

const byRule = (list, rule) => list.filter((e) => e.rule === rule);

if (!QUIET) {
  console.log(`\n  Oikonos — design system audit`);
  console.log(`  ${declaredInRoot.size} tokens · ${FILES.length} files\n`);

  for (const [rule, label] of CHECKS) {
    const bad = byRule(errors, rule);
    const mark = bad.length ? '✗' : '✓';
    console.log(`  ${mark} ${label}${bad.length ? `  (${bad.length})` : ''}`);
  }
  console.log('');
}

for (const [rule] of CHECKS) {
  for (const e of byRule(errors, rule)) {
    console.error(`  ✗ ${rule}  ${e.where}\n      ${e.msg}`);
  }
}

if (!QUIET && notes.length) {
  const VERBOSE = process.argv.includes('--verbose');
  const shown = VERBOSE ? notes : notes.slice(0, 6);
  console.log('  Notes — nothing here fails, but each one is a token waiting to be used');
  for (const n of shown) console.log(`    · ${n.where} — ${n.msg}`);
  if (!VERBOSE && notes.length > shown.length) {
    console.log(`    · …and ${notes.length - shown.length} more files (--verbose for all)`);
  }
  console.log('');
}

if (errors.length) {
  console.error(`\n  ${errors.length} problem${errors.length === 1 ? '' : 's'}.\n`);
  process.exit(1);
}

if (!QUIET) console.log('  Clean.\n');

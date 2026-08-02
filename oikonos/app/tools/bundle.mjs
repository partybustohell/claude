#!/usr/bin/env node
/**
 * Fold the built app into ONE self-contained HTML fragment.
 *
 * An Artifact page runs under a strict CSP that blocks every external
 * host, so nothing may be fetched at runtime: the fonts, the riso
 * textures, the stylesheet and the bundle all have to travel inside the
 * document. This inlines all four, then writes the fragment the Artifact
 * tool expects — page content only, no <html>/<head>/<body> wrapper.
 *
 *   node tools/bundle.mjs   ->  dist/artifact.html
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ASSETS = path.join(DIST, 'assets');

const files = readdirSync(ASSETS);
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));
if (!cssFile || !jsFile) throw new Error('run `npx vite build` first');

let css = readFileSync(path.join(ASSETS, cssFile), 'utf8');
const js = readFileSync(path.join(ASSETS, jsFile), 'utf8');

/* ---- inline every asset the stylesheet reaches for ---- */

/** Fonts are subset to the app's own glyph set; prefer those when present. */
function dataUri(publicPath) {
  const clean = publicPath.replace(/^\//, '');
  const subset = clean.replace('fonts/', 'fonts-sub/');
  const abs = existsSync(path.join(ROOT, 'public', subset))
    ? path.join(ROOT, 'public', subset)
    : path.join(ROOT, 'public', clean);
  const bytes = readFileSync(abs);
  const mime = publicPath.endsWith('.woff2') ? 'font/woff2' : 'image/png';
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

const referenced = [...new Set(
  [...css.matchAll(/url\(([^)]*?\/(?:fonts|tex)\/[^)]+?)\)/g)]
    .map((m) => m[1].replace(/["']/g, '')),
)];

/* A texture is referenced from half a dozen rules, and pasting the same
   base64 blob into each one tripled the stylesheet — so each texture
   becomes a custom property declared once.
   Fonts must NOT get this treatment: custom properties are not permitted
   in an @font-face src descriptor, and substituting one there silently
   kills the face and drops the page to a system fallback. They are
   referenced once each anyway, so there is nothing to gain. */
let inlined = 0;
const vars = [];
for (const ref of referenced) {
  const uri = dataUri(ref);
  const isFont = ref.includes('/fonts/');
  const replacement = isFont
    ? `url(${uri})`
    : `var(--asset-${ref.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')})`;
  if (!isFont) {
    vars.push(`${replacement.slice(4, -1)}:url(${uri})`);
  }
  for (const form of [`url(${ref})`, `url("${ref}")`, `url('${ref}')`]) {
    css = css.split(form).join(replacement);
  }
  inlined++;
}
css = `:root{${vars.join(';')}}\n${css}`;

const leftover = css.match(/url\((?!data:)[^)]*\)/g);
if (leftover) throw new Error(`un-inlined asset(s): ${[...new Set(leftover)].join(', ')}`);

/* ---- the host page around the device ----------------------------
   Oikonos itself commits to one visual world — ink printed on cream
   paper — so the app is deliberately single-theme. Only the stage the
   phone stands on answers the viewer's theme, so the artifact never
   looks broken in dark mode without repainting the product.        */

const host = `
<title>Oikonos — Money, made clear.</title>
<style>
:root {
  --stage-1: #fbf6ea;
  --stage-2: #efe4cd;
  --stage-ink: #6b5b3e;
}
@media (prefers-color-scheme: dark) {
  :root { --stage-1: #241f18; --stage-2: #15120e; --stage-ink: #b9a880; }
}
:root[data-theme="dark"] { --stage-1: #241f18; --stage-2: #15120e; --stage-ink: #b9a880; }
:root[data-theme="light"] { --stage-1: #fbf6ea; --stage-2: #efe4cd; --stage-ink: #6b5b3e; }

html, body { margin: 0; height: 100%; }
body {
  background: radial-gradient(120% 90% at 50% 0%, var(--stage-1) 0%, var(--stage-2) 100%);
}
/* the app paints its own stage; let the host ground show through */
.stage { background: transparent !important; }

#oik-hint {
  position: fixed;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  font: 500 11px/1 ui-sans-serif, system-ui, sans-serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--stage-ink);
  opacity: 0.62;
  pointer-events: none;
  z-index: 5;
}
@media (max-height: 900px) { #oik-hint { display: none; } }
</style>
<style>${css}</style>
<div id="root"></div>
<p id="oik-hint">Tap Get Started · every screen is live</p>
<script type="module">${js}</script>
`.trim();

writeFileSync(path.join(DIST, 'artifact.html'), host);

const kb = (n) => `${Math.round(n / 1024)} kB`;
process.stdout.write(
  `artifact.html  ${kb(Buffer.byteLength(host))}  ` +
  `(css ${kb(css.length)}, js ${kb(js.length)}, ${inlined} assets inlined)\n`,
);

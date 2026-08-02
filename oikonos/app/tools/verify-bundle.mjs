#!/usr/bin/env node
/**
 * Prove the single-file bundle actually stands alone.
 *
 * `bundle.mjs` exists because an Artifact page runs under a strict CSP
 * that blocks every external host — so a bundle that still reaches for
 * one font does not degrade, it fails, and it fails only once it is
 * published. Nothing was checking that. This does.
 *
 * It loads dist/artifact.html the way the host does — wrapped in a
 * doctype/head/body skeleton, since the bundler emits page content
 * only — and then drives it:
 *
 *   · every CSS url() must be a data: URI — a STATIC check, and not
 *     redundant with the runtime one below: a stylesheet can carry an
 *     external font that is never applied, so the browser never fetches
 *     it, so the request log stays clean while the bundle is still
 *     broken for anyone whose text happens to hit that face
 *   · every request that is not file:/data:/blob: is a failure
 *   · any console error or unhandled rejection is a failure
 *   · the app has to mount, load its fonts and render the wordmark
 *   · Welcome → Home → Goals has to work
 *   · a tab to the RIGHT has to arrive from the right (x > 0), because
 *     a build can carry stale motion code and still look fine at rest
 *
 *   node tools/verify-bundle.mjs        # after `npx vite build && node tools/bundle.mjs`
 *
 * Exits non-zero on any failure, so it can gate a publish.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BUNDLE = path.join(ROOT, 'dist/artifact.html');
const PROBE = path.join(ROOT, 'dist/_probe.html');
const SHOT = path.join(ROOT, 'dist/_bundle-check.png');

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push({ name, ok });
  process.stdout.write(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}\n`);
};

async function main() {
  if (!existsSync(BUNDLE)) {
    console.error('dist/artifact.html missing — run `npx vite build && node tools/bundle.mjs`');
    process.exit(1);
  }

  const frag = readFileSync(BUNDLE, 'utf8');

  /* ---- static audit: nothing in the CSS may point off-document ----
     Scoped to <style> blocks on purpose. Run over the whole document it
     also rakes the minified JS, where a template literal containing the
     characters "url(" is not a stylesheet reference and reports as a
     bare backtick — a false positive that makes the check useless. */
  const styles = [...frag.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1]).join('\n');
  const urls = [...styles.matchAll(/url\(\s*["']?([^"')]+)/g)].map((m) => m[1]);
  const offDoc = urls.filter((u) => !u.startsWith('data:') && !u.startsWith('#'));
  check('no stylesheet url() leaves the document', offDoc.length === 0,
    `${urls.length} refs audited${offDoc.length ? ': ' + offDoc.slice(0, 3).join(' ') : ''}`);
  check('no unresolved public paths', !frag.includes('/tex/') && !frag.includes('/fonts/'));

  /* ---- load it the way the Artifact host does ---- */
  writeFileSync(PROBE,
    `<!doctype html><html><head><meta charset="utf-8"></head><body>${frag}</body></html>`);

  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });

  const external = [];
  const errors = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!/^(file|data|blob):/.test(u)) external.push(u);
  });
  page.on('requestfailed', (r) => external.push(`FAILED ${r.url()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

  await page.goto(`file://${PROBE}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);

  check('zero external requests', external.length === 0,
    external.slice(0, 3).join(' '));
  check('zero runtime errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  const mounted = await page.locator('.device__screen').count();
  check('app mounts', mounted > 0);

  const faces = await page.evaluate(async () => {
    await document.fonts.ready;
    let n = 0;
    document.fonts.forEach((f) => { if (f.status === 'loaded') n++; });
    return n;
  });
  check('fonts load from the document', faces > 0, `${faces} face(s)`);

  const text = async () =>
    (await page.locator('.device__screen').innerText()).replace(/\s+/g, '');
  check('welcome renders the wordmark', (await text()).includes('OIKONOS'));

  /* ---- drive it ---- */
  await page.getByRole('button', { name: /get started/i }).click();
  await page.waitForTimeout(1500);
  check('get started lands on home', (await text()).includes('Arjun'));

  await page.getByRole('button', { name: /^goals$/i }).click();
  let peak = 0;
  for (let i = 0; i < 40; i++) {
    const x = await page.evaluate(() => {
      const el = document.querySelector('.app-page[data-route="goals"]');
      return el ? new DOMMatrixReadOnly(getComputedStyle(el).transform).m41 : null;
    });
    if (x !== null && Math.abs(x) > Math.abs(peak)) peak = x;
  }
  check('a tab to the right arrives from the right', peak > 0,
    `x peaked at ${peak.toFixed(1)}px`);

  await page.waitForTimeout(900);
  check('goals renders', (await text()).includes('Savingtoward'));

  await page.screenshot({ path: SHOT });
  await browser.close();

  const failed = checks.filter((c) => !c.ok);
  process.stdout.write(`\n${checks.length - failed.length}/${checks.length} checks passed\n`);
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });

#!/usr/bin/env node
/**
 * Screenshot the design-system reference.
 *
 * The site claims every specimen is live and every value is read from the
 * running stylesheet. That claim is only worth anything if somebody looks
 * at the page, so this renders it full-height and reports any console
 * error the browser raised on the way.
 *
 *   node tools/shoot-system.mjs               # whole page + each chapter
 *   node tools/shoot-system.mjs colour motion # named chapters only
 *
 * Output: shots/system/<chapter>.png
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import net from 'node:net';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.SHOOT_PORT ?? 5181);
const BASE = `http://127.0.0.1:${PORT}/system.html`;
const OUT = path.join(ROOT, 'shots', 'system');

const CHAPTERS = [
  'principles', 'colour', 'type', 'layout', 'motion',
  'icons', 'components', 'charts', 'patterns', 'content', 'a11y', 'working',
];

const listening = (port) => new Promise((resolve) => {
  const s = net.connect(port, '127.0.0.1');
  s.on('connect', () => { s.destroy(); resolve(true); });
  s.on('error', () => resolve(false));
});

async function serve() {
  if (await listening(PORT)) return null;
  const proc = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT, stdio: 'ignore', detached: false,
  });
  for (let i = 0; i < 80; i++) {
    await delay(250);
    if (await listening(PORT)) return proc;
  }
  throw new Error('vite did not start');
}

const wanted = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = wanted.length ? wanted : CHAPTERS;

const server = await serve();
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 1000 },
  deviceScaleFactor: 2,
});

const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
page.on('pageerror', (e) => problems.push(String(e)));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await delay(1200);   // entrance springs and count-ups settle

/* A full-page shot is opt-in: the Patterns chapter runs eight live copies
   of the app in iframes, and capturing the whole column at 2× DPR is slow
   enough to hit the default timeout. Chapter shots are the useful artefact. */
if (process.argv.includes('--full')) {
  await page.screenshot({ path: path.join(OUT, 'full.png'), fullPage: true, timeout: 180_000 });
  process.stdout.write('  ✓ full.png\n');
}

/**
 * Walk a chapter past the viewport before capturing it.
 *
 * Meters, count-ups, sparklines and lazy iframes all start on first view.
 * A full-height element screenshot never scrolls the lower half into the
 * viewport, so without this pass everything below the fold is captured in
 * its zero state — an empty chart that is not actually broken.
 */
async function prime(id) {
  const box = await page.evaluate((sel) => {
    const el = document.getElementById(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height, vh: window.innerHeight };
  }, id);
  if (!box) return false;

  for (let y = box.top; y < box.top + box.height; y += box.vh * 0.7) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await delay(450);
  }
  await page.evaluate((to) => window.scrollTo(0, to), box.top);
  /* The longest thing still running: the 1.5s count-up in Amount. */
  await delay(2200);
  return true;
}

for (const id of targets) {
  if (!(await prime(id))) { problems.push(`missing chapter #${id}`); continue; }
  const el = await page.$(`#${id}`);
  await el.screenshot({ path: path.join(OUT, `${id}.png`), timeout: 90_000 });
  process.stdout.write(`  ✓ ${id}.png\n`);
}

await browser.close();
if (server) server.kill();

if (problems.length) {
  console.error('\n  Console errors:');
  for (const p of [...new Set(problems)]) console.error(`    ${p}`);
  process.exit(1);
}
process.stdout.write('\n  No console errors.\n');

#!/usr/bin/env node
/**
 * Plate proofing harness.
 *
 * Pulls a press proof of each illustration alone on its stock and lays
 * them up as a contact sheet, which is the only way to see that eleven
 * plates share one hand. Screens hide the drawing behind their own
 * furniture; this does not.
 *
 *   node tools/proof.mjs                  # every plate, contact sheet
 *   node tools/proof.mjs harbour          # one plate, full size
 *   node tools/proof.mjs --ink harbour    # proof it on the cobalt stock
 *
 * Output: proofs/<name>.png and proofs/_sheet-<n>.png
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import net from 'node:net';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.SHOOT_PORT ?? 5179);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(ROOT, 'proofs');

/** name -> the stock it prints on. Keep in step with Proof.tsx. */
export const PLATES = {
  cliff: 'ink',
  horizon: 'paper',
  cafe: 'olive',
  acropolis: 'paper',
  harbour: 'paper',
  amphorae: 'paper',
  ascent: 'paper',
  windmill: 'paper',
  mosaic: 'paper',
  lighthouse: 'paper',
  shopfront: 'paper',
  colophon: 'paper',
  santorini: 'paper',
  olivegrove: 'paper',
};

function portOpen(port) {
  return new Promise((res) => {
    const s = net.connect({ port, host: '127.0.0.1' }, () => { s.end(); res(true); });
    s.on('error', () => res(false));
    s.setTimeout(400, () => { s.destroy(); res(false); });
  });
}

async function ensureServer() {
  if (await portOpen(PORT)) return null;
  const p = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT, stdio: 'ignore', detached: false,
  });
  for (let i = 0; i < 120; i++) {
    await delay(250);
    if (await portOpen(PORT)) return p;
  }
  p.kill();
  throw new Error('vite failed to start');
}

async function main() {
  const argv = process.argv.slice(2);
  const groundOverride = argv.includes('--ink') ? 'ink'
    : argv.includes('--olive') ? 'olive'
    : argv.includes('--paper') ? 'paper' : null;
  const names = argv.filter((a) => !a.startsWith('--'));
  const targets = names.length ? names : Object.keys(PLATES);

  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const server = await ensureServer();
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || undefined,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none',
           '--disable-lcd-text', '--hide-scrollbars'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();

  const failures = [];
  page.on('pageerror', (e) => failures.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') failures.push(m.text()); });

  for (const name of targets) {
    const ground = groundOverride ?? PLATES[name] ?? 'paper';
    await page.goto(`${BASE}/?plate=${name}&ground=${ground}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    const missing = await page.locator('.proof__missing').count();
    if (missing) {
      failures.push(`${name}: not registered in Proof.tsx`);
      process.stdout.write(`✗ ${name} — not registered\n`);
      continue;
    }
    const el = await page.$('.device__screen');
    await el.screenshot({ path: path.join(OUT, `${name}.png`), scale: 'device' });
    process.stdout.write(`✓ ${name} (${ground})\n`);
  }

  /* ---- contact sheet: the only view that proves one hand ---- */
  const shots = readdirSync(OUT).filter((f) => f.endsWith('.png') && !f.startsWith('_'));
  const per = 6;
  const sheetPage = await ctx.newPage();
  for (let i = 0; i * per < shots.length; i++) {
    const batch = shots.slice(i * per, i * per + per);
    writeFileSync(path.join(OUT, '_sheet.html'), `<body style="margin:0;background:#2a2622;
      display:flex;gap:10px;padding:10px;font:11px/1.6 sans-serif">
      ${batch.map((f) => `<figure style="margin:0;color:#e8e0d2;text-align:center">
        <img src="${f}" style="width:230px;display:block;border:1px solid #4a443c">
        <figcaption>${f.replace('.png', '')}</figcaption></figure>`).join('')}
      </body>`);
    await sheetPage.setViewportSize({ width: per * 244 + 20, height: 560 });
    await sheetPage.goto(`file://${path.join(OUT, '_sheet.html')}`);
    await sheetPage.waitForTimeout(350);
    await sheetPage.screenshot({ path: path.join(OUT, `_sheet-${i}.png`), fullPage: true });
    process.stdout.write(`  sheet ${i}: ${batch.map((b) => b.replace('.png', '')).join(' ')}\n`);
  }

  await browser.close();
  if (server) server.kill();

  if (failures.length) {
    process.stdout.write(`\n⚠ ${failures.length} error(s):\n`);
    for (const f of [...new Set(failures)].slice(0, 12)) process.stdout.write(`  ${f}\n`);
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

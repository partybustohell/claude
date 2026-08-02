#!/usr/bin/env node
/**
 * Screenshot harness.
 *
 * Boots the Vite dev server (or reuses one already listening), renders
 * each requested screen inside the device frame at 3× DPR, waits for
 * fonts + textures + entrance springs to settle, and writes a PNG.
 *
 *   node tools/shoot.mjs                     # every screen
 *   node tools/shoot.mjs home goal:g1        # a subset
 *   node tools/shoot.mjs --bare home         # crop to the screen, no device
 *
 * Output: shots/<name>.png (device) and shots/bare/<name>.png (screen only)
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import net from 'node:net';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.SHOOT_PORT ?? 5179);
const BASE = `http://127.0.0.1:${PORT}`;

/** name -> query string */
export const SCREENS = {
  welcome:  'screen=welcome',
  home:     'screen=home',
  activity: 'screen=activity',
  budgets:  'screen=budgets',
  goals:    'screen=goals',
  accounts: 'screen=accounts',
  insights: 'screen=insights',
  txn:      'screen=txn&id=t001',
  goal:     'screen=goal&id=g1',
  'goal-emergency': 'screen=goal&id=g2',
  'sheet-add':      'screen=home&sheet=add',
  'sheet-contribute': 'screen=goal&id=g1&sheet=contribute',
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
  const bare = argv.includes('--bare');
  const names = argv.filter((a) => !a.startsWith('--'));
  const targets = names.length ? names : Object.keys(SCREENS);

  const outDir = path.join(ROOT, bare ? 'shots/bare' : 'shots');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const server = await ensureServer();
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || undefined,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none',
           '--disable-lcd-text', '--hide-scrollbars'],
  });
  const ctx = await browser.newContext({
    viewport: bare ? { width: 390, height: 844 } : { width: 560, height: 1000 },
    deviceScaleFactor: 3,
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();

  const failures = [];
  page.on('pageerror', (e) => failures.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') failures.push(m.text());
  });

  for (const name of targets) {
    const q = SCREENS[name] ?? `screen=${name}`;
    await page.goto(`${BASE}/?${q}${bare ? '&bare=1' : ''}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // let entrance springs settle and count-up odometers finish
    await page.waitForTimeout(2600);

    if (bare) {
      await page.addStyleTag({ content: `
        .stage { padding: 0 !important; background: none !important; min-height: 0 !important; }
        .stage__vignette { display: none !important; }
        .device { border-radius: 0 !important; padding: 0 !important; box-shadow: none !important; }
        .device__rail, .device__sheen, .device__glass, .device__btn { display: none !important; }
        .device__screen { border-radius: 0 !important; }
        /* the comp has no dynamic island — drop it so blind duels stay blind */
        .island { display: none !important; }
      `});
      await page.waitForTimeout(180);
    }

    const el = await page.$(bare ? '.device__screen' : '.device');
    await el.screenshot({ path: path.join(outDir, `${name}.png`), scale: 'device' });
    process.stdout.write(`✓ ${name}\n`);
  }

  await browser.close();
  if (server) server.kill();

  if (failures.length) {
    process.stdout.write(`\n⚠ ${failures.length} runtime error(s):\n`);
    for (const f of [...new Set(failures)].slice(0, 12)) process.stdout.write(`  ${f}\n`);
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

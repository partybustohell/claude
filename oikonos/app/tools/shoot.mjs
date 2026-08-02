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
 *   node tools/shoot.mjs --bare --foot       # scrolled to the end, where
 *                                            # the foot plates live
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
  /* One goal per cover — the four scenes are the four covers a goal can
     be given, and each has to be looked at. */
  'goal-santorini': 'screen=goal&id=g3',
  'goal-grove':     'screen=goal&id=g4',
  'sheet-add':      'screen=home&sheet=add',
  'sheet-contribute': 'screen=goal&id=g1&sheet=contribute',

  /* full app */
  merchant:      'screen=merchant&id=good-earth',
  search:        'screen=search',
  recurring:     'screen=recurring',
  transfer:      'screen=transfer',
  payee:         'screen=payee&id=p1',
  bills:         'screen=bills',
  bill:          'screen=bill&id=bl4',
  scan:          'screen=scan',
  account:       'screen=account&id=hdfc',
  addAccount:    'screen=addAccount',
  categories:    'screen=categories',
  category:      'screen=category&id=food',
  budget:        'screen=budget&id=b1',
  newBudget:     'screen=newBudget',
  newGoal:       'screen=newGoal',
  goalHistory:   'screen=goalHistory&id=g1',
  report:        'screen=report',
  networth:      'screen=networth',
  cashflow:      'screen=cashflow',
  subscriptions: 'screen=subscriptions',
  profile:       'screen=profile',
  notifications: 'screen=notifications',
  settings:      'screen=settings',
  appearance:    'screen=appearance',
  notifySettings:'screen=notifySettings',
  security:      'screen=security',
  currency:      'screen=currency',
  connected:     'screen=connected',
  help:          'screen=help',
  about:         'screen=about',
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
  const foot = argv.includes('--foot');
  const names = argv.filter((a) => !a.startsWith('--'));
  const targets = names.length ? names : Object.keys(SCREENS);

  const outDir = path.join(ROOT, foot ? 'shots/foot' : bare ? 'shots/bare' : 'shots');
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

    /* Most plates sit at the END of a scroll, where they cannot fight a
       line of type — which also means the default capture never sees
       them. --foot runs the pane to the bottom first. Judging a foot
       plate from a top-of-screen shot is judging it from its absence. */
    if (foot) {
      await page.evaluate(() => {
        const pane = document.querySelector('.scroll-y, .pane');
        if (pane) pane.scrollTop = pane.scrollHeight;
      });
      await page.waitForTimeout(900);
    }

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

    /* Vite renders its build error into a shadow-DOM overlay ON TOP of the
       app, and the app's own DOM survives underneath — so the element query
       still succeeds and the shot silently captures a stack trace. Check for
       the overlay explicitly rather than trusting the element. */
    const overlay = await page.locator('vite-error-overlay').count();
    if (overlay > 0) {
      const msg = await page.locator('vite-error-overlay')
        .evaluate((el) => el.shadowRoot?.querySelector('.message')?.textContent ?? 'build error')
        .catch(() => 'build error');
      failures.push(`${name}: ${String(msg).trim().slice(0, 200)}`);
      process.stdout.write(`✗ ${name} — build error\n`);
      continue;
    }

    const el = await page.$(bare ? '.device__screen' : '.device');
    if (!el) {
      failures.push(`${name}: screen did not mount`);
      process.stdout.write(`✗ ${name} — did not mount\n`);
      continue;
    }
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

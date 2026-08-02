import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = '/tmp/claude-0/-home-user-claude/8d085ab9-cb44-54c1-aff5-e4213726b378/scratchpad/bgshots';
const PORT = Number(process.env.SHOOT_PORT ?? 5179);
const BASE = `http://127.0.0.1:${PORT}`;

const TARGETS = {
  budget: 'screen=budget&id=b1',
  newBudget: 'screen=newBudget',
  newGoal: 'screen=newGoal',
  goalHistory: 'screen=goalHistory&id=g1',
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--hide-scrollbars'],
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('ERR', String(e)));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TARGETS);

for (const name of names) {
  await page.goto(`${BASE}/?${TARGETS[name]}&bare=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2400);
  await page.addStyleTag({ content: `
    .stage { padding: 0 !important; background: none !important; min-height: 0 !important; }
    .stage__vignette { display: none !important; }
    .device { border-radius: 0 !important; padding: 0 !important; box-shadow: none !important; }
    .device__rail, .device__sheen, .device__glass, .device__btn { display: none !important; }
    .device__screen { border-radius: 0 !important; }
    .island { display: none !important; }
  `});
  const info = await page.evaluate(() => {
    const p = document.querySelector('.pane');
    return p ? { sh: p.scrollHeight, ch: p.clientHeight } : null;
  });
  if (!info) { console.log(name, 'no pane'); continue; }
  const step = info.ch - 70;
  const steps = Math.max(1, Math.ceil((info.sh - info.ch) / step) + 1);
  console.log(name, JSON.stringify(info), 'frames', steps);
  for (let i = 0; i < steps; i++) {
    const top = Math.min(i * step, info.sh - info.ch);
    await page.evaluate((t) => { document.querySelector('.pane').scrollTop = t; }, top);
    await page.waitForTimeout(1000);
    const el = await page.$('.device__screen');
    await el.screenshot({ path: path.join(OUT, `${name}-${i}.png`), scale: 'device' });
  }
}
await browser.close();

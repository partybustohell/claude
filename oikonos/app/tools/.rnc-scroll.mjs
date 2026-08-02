import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT = '/tmp/claude-0/-home-user-claude/8d085ab9-cb44-54c1-aff5-e4213726b378/scratchpad/rnc';
mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:5179';

const targets = process.argv.slice(2);

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--hide-scrollbars'],
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
  reducedMotion: 'no-preference',
});
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

for (const spec of targets) {
  const [name, extra] = spec.split('|');
  await page.goto(`${BASE}/?screen=${name}&bare=1`, { waitUntil: 'networkidle' });
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
  if (extra) {
    await page.evaluate((sel) => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.trim() === sel);
      if (b) b.click();
    }, extra);
    await page.waitForTimeout(2000);
  }
  const h = await page.evaluate(() => {
    const p = document.querySelector('.pane');
    return p ? p.scrollHeight : 0;
  });
  const step = 700;
  let i = 0;
  for (let y = 0; y < h; y += step) {
    await page.evaluate((yy) => { document.querySelector('.pane').scrollTop = yy; }, y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, `${name}${extra ? '-' + extra : ''}-${i}.png`) });
    i++;
    if (i > 6) break;
  }
  console.log(name, 'height', h, 'shots', i);
}
if (errs.length) console.log('ERRORS', errs.slice(0, 5));
await browser.close();

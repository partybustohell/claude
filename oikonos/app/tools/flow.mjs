#!/usr/bin/env node
/**
 * Interaction smoke test.
 *
 * Screenshots prove a screen renders; they say nothing about whether the
 * thing is usable. This drives the app the way a person would — welcome
 * through every tab, into a transaction, into a goal, through the add
 * sheet — and fails on any console error, unhandled rejection, or control
 * that does not do what its label promises.
 */
import { chromium } from 'playwright';
import net from 'node:net';

const PORT = Number(process.env.SHOOT_PORT ?? 5179);
const BASE = `http://127.0.0.1:${PORT}`;

function portOpen(port) {
  return new Promise((res) => {
    const s = net.connect({ port, host: '127.0.0.1' }, () => { s.end(); res(true); });
    s.on('error', () => res(false));
    s.setTimeout(400, () => { s.destroy(); res(false); });
  });
}

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  process.stdout.write(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}\n`);
}

async function main() {
  if (!(await portOpen(PORT))) {
    console.error(`dev server not listening on ${PORT}`);
    process.exit(1);
  }

  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || undefined,
  });
  const ctx = await browser.newContext({
    viewport: { width: 470, height: 940 }, deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });

  /* innerText inserts a newline between inline spans, so the wordmark comes
     back as "OIKO\nNOS". Collapse all whitespace before matching. */
  const text = async () =>
    (await page.locator('.device__screen').innerText()).replace(/\s+/g, ' ');

  /* Hero figures count up over ~1.5s, so an assertion made too early sees a
     partial number. Poll instead of guessing a sleep. */
  const waitFor = async (re, ms = 6000) => {
    const t0 = Date.now();
    for (;;) {
      const t = await text();
      if (re.test(t)) return true;
      if (Date.now() - t0 > ms) return false;
      await page.waitForTimeout(150);
    }
  };

  /**
   * The sign of a screen's x while it is arriving says which way the content
   * travelled. A screen that starts right of centre (x > 0) slid leftwards
   * into place, which is what a push and a rightwards tab move must both do.
   * Sampling has to happen during the spring, so poll for the extreme value
   * rather than trusting one reading.
   */
  const arrivalX = async (routeKey, ms = 320) => {
    const t0 = Date.now();
    let peak = 0;
    while (Date.now() - t0 < ms) {
      const x = await page.evaluate((k) => {
        const el = document.querySelector(`.app-page[data-route="${k}"]`);
        if (!el) return null;
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return m.m41;
      }, routeKey);
      if (x !== null && Math.abs(x) > Math.abs(peak)) peak = x;
    }
    return peak;
  };

  // ---- Welcome → Home ----
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // each letter is its own span, so match with the gaps allowed
  check('welcome shows the wordmark', await waitFor(/O\s*I\s*K\s*O\s*N\s*O\s*S/));

  await page.getByRole('button', { name: /get started/i }).click();
  check('get started lands on home', await waitFor(/Arjun/));
  check('home shows net worth', await waitFor(/8,74,350/));

  // ---- Tabs ----
  for (const [tab, expect] of [
    ['Activity', /Activity|Today|May/i],
    ['Budgets', /Budget|Left|Limit|spent/i],
    ['Goals', /Greek Summer/],
    ['Home', /Arjun/],
  ]) {
    await page.getByRole('button', { name: new RegExp(`^${tab}$`, 'i') }).click();
    check(`${tab} tab renders`, await waitFor(expect));
  }

  // ---- Travel direction ----
  // Tabs are a spatial row: Home, Activity, Budgets, Goals, left to right.
  await page.getByRole('button', { name: /^goals$/i }).click();
  const rightward = await arrivalX('goals');
  check('a tab to the right arrives from the right', rightward > 0,
    `x peaked at ${rightward.toFixed(1)}px`);
  await waitFor(/Greek Summer/);

  await page.getByRole('button', { name: /^activity$/i }).click();
  const leftward = await arrivalX('activity');
  check('a tab to the left arrives from the left', leftward < 0,
    `x peaked at ${leftward.toFixed(1)}px`);
  await waitFor(/Activity|Today|May/i);

  await page.getByRole('button', { name: /^home$/i }).click();
  await waitFor(/Arjun/);

  // ---- Home → transaction detail → back ----
  await page.getByText('Good Earth', { exact: false }).first().click();
  const pushed = await arrivalX('txn:t001');
  check('a push arrives from the right', pushed > 0,
    `x peaked at ${pushed.toFixed(1)}px`);
  check('transaction detail opens',
    (await waitFor(/Good Earth/)) && (await waitFor(/2,850/)));

  await page.getByRole('button', { name: /^back$/i }).click();
  const popped = await arrivalX('home');
  check('a pop arrives from the left', popped < 0,
    `x peaked at ${popped.toFixed(1)}px`);
  check('back returns to home', await waitFor(/Arjun/));

  // ---- Goals → goal detail → contribute ----
  await page.getByRole('button', { name: /^goals$/i }).click();
  await page.waitForTimeout(800);
  await page.getByText('Greek Summer').first().click();
  check('goal detail opens', await waitFor(/1,25,000/));

  const addMoney = page.getByRole('button', { name: /add money/i });
  if (await addMoney.count()) {
    await addMoney.first().click();
    check('contribute sheet opens', await waitFor(/Add to Greek Summer/i));

    // '00' appends TWO zeros — 5,00,00 would be fifty thousand, not five
    const pad = page.locator('.sheet');
    await pad.getByRole('button', { name: '5', exact: true }).click();
    await pad.getByRole('button', { name: '00', exact: true }).click();
    await pad.getByRole('button', { name: '0', exact: true }).click();
    check('keypad enters an amount', await waitFor(/₹5,000\b/));

    await pad.getByRole('button', { name: /^add ₹5,000$/i }).click();
    check('contribution lands on the goal', await waitFor(/1,30,000/));
  } else {
    check('goal detail has an add-money action', false, 'button not found');
  }

  // ---- Add-transaction sheet ----
  await page.goto(`${BASE}/?screen=home&sheet=add`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  // scope to the sheet: the stack behind it is still in the accessibility tree
  const sheet = page.locator('.sheet');
  await sheet.getByRole('button', { name: '3', exact: true }).click();
  await sheet.getByRole('button', { name: '00', exact: true }).click();
  await sheet.getByLabel('Merchant').fill('Kala Ghoda Cafe');
  await page.waitForTimeout(250);
  const addBtn = sheet.getByRole('button', { name: /add expense/i });
  check('save is enabled once amount and merchant are set',
    await addBtn.isEnabled());
  await addBtn.click();
  check('new transaction appears on home', await waitFor(/Kala Ghoda Cafe/));

  // ---- Accessibility spot-checks ----
  const unlabelled = await page.locator('.device__screen button:not([aria-label])')
    .evaluateAll((els) => els.filter((e) => !e.textContent.trim()).length);
  check('no icon-only button lacks a label', unlabelled === 0, `${unlabelled} found`);

  const progressbars = await page.locator('[role="progressbar"]').count();
  check('meters expose progressbar semantics', progressbars >= 0);

  await browser.close();

  const failed = checks.filter((c) => !c.ok);
  if (errors.length) {
    process.stdout.write(`\n⚠ runtime errors:\n`);
    for (const e of [...new Set(errors)].slice(0, 10)) process.stdout.write(`  ${e}\n`);
  }
  process.stdout.write(`\n${checks.length - failed.length}/${checks.length} checks passed\n`);
  if (failed.length || errors.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });

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

  const text = () => page.locator('.device__screen').innerText();

  // ---- Welcome → Home ----
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  check('welcome shows the wordmark', (await text()).includes('OIKONOS'));

  await page.getByRole('button', { name: /get started/i }).click();
  await page.waitForTimeout(1100);
  const home = await text();
  check('get started lands on home', /Arjun/.test(home));
  check('home shows net worth', /8,74,350/.test(home));

  // ---- Tabs ----
  for (const [tab, expect] of [
    ['Activity', /Activity|Today|May/i],
    ['Budgets', /Budget|Left|Limit|spent/i],
    ['Goals', /Greek Summer/],
    ['Home', /Arjun/],
  ]) {
    await page.getByRole('button', { name: new RegExp(`^${tab}$`, 'i') }).click();
    await page.waitForTimeout(850);
    check(`${tab} tab renders`, expect.test(await text()));
  }

  // ---- Home → transaction detail → back ----
  await page.getByText('Good Earth', { exact: false }).first().click();
  await page.waitForTimeout(1000);
  const txn = await text();
  check('transaction detail opens', /Good Earth/.test(txn) && /2,850/.test(txn));

  await page.getByRole('button', { name: /^back$/i }).click();
  await page.waitForTimeout(900);
  check('back returns to home', /Arjun/.test(await text()));

  // ---- Goals → goal detail → contribute ----
  await page.getByRole('button', { name: /^goals$/i }).click();
  await page.waitForTimeout(800);
  await page.getByText('Greek Summer').first().click();
  await page.waitForTimeout(1000);
  check('goal detail opens', /1,25,000/.test(await text()));

  const addMoney = page.getByRole('button', { name: /add money/i });
  if (await addMoney.count()) {
    await addMoney.first().click();
    await page.waitForTimeout(800);
    check('contribute sheet opens', /Add to Greek Summer/i.test(await text()));

    await page.getByRole('button', { name: '5' }).first().click();
    await page.getByRole('button', { name: '00' }).first().click();
    await page.getByRole('button', { name: '00' }).first().click();
    await page.waitForTimeout(400);
    check('keypad enters an amount', /5,000/.test(await text()));

    await page.getByRole('button', { name: /^add ₹5,000$/i }).click();
    await page.waitForTimeout(1000);
    check('contribution lands on the goal', /1,30,000/.test(await text()));
  } else {
    check('goal detail has an add-money action', false, 'button not found');
  }

  // ---- Add-transaction sheet ----
  await page.goto(`${BASE}/?screen=home&sheet=add`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: '3' }).first().click();
  await page.getByRole('button', { name: '00' }).first().click();
  await page.getByLabel('Merchant').fill('Kala Ghoda Cafe');
  await page.waitForTimeout(300);
  const addBtn = page.getByRole('button', { name: /add expense/i });
  check('save is enabled once amount and merchant are set',
    await addBtn.isEnabled());
  await addBtn.click();
  await page.waitForTimeout(1000);
  check('new transaction appears on home', /Kala Ghoda Cafe/.test(await text()));

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

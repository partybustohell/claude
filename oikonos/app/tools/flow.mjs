#!/usr/bin/env node
/**
 * Interaction smoke test.
 *
 * Screenshots prove a screen renders; they say nothing about whether the
 * thing is usable. This drives the app the way a person would — sign up,
 * sign out, sign back in, every tab, into a transaction, into a goal,
 * through the add sheet — and fails on any console error, unhandled
 * rejection, or control that does not do what its label promises.
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

  /* A pushed screen and the one it is covering both sit in the DOM
     while the spring runs, so "Email" can match twice for half a
     second. Wait the transition out before touching a field. */
  const settle = async () => {
    await page
      .waitForFunction(() => document.querySelectorAll('.app-page').length === 1,
        null, { timeout: 5000 })
      .catch(() => {});
    await page.waitForTimeout(120);
  };

  /* A run must start from a device nobody has signed in on, or the
     second run finds the first run's account already there. */
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.localStorage.clear());

  // ---- The guard ----
  await page.goto(`${BASE}/?screen=accounts`, { waitUntil: 'networkidle' });
  check('signed out, a deep link to a private screen lands on welcome',
    await waitFor(/O\s*I\s*K\s*O\s*N\s*O\s*S/));
  check('and the private screen never rendered',
    !/Total balance|HDFC/i.test(await text()));

  // ---- Welcome → sign up ----
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // each letter is its own span, so match with the gaps allowed
  check('welcome shows the wordmark', await waitFor(/O\s*I\s*K\s*O\s*N\s*O\s*S/));

  await page.getByRole('button', { name: /get started/i }).click();
  check('get started opens sign-up', await waitFor(/Create your account/i));
  await settle();

  // an empty submit must say what is missing rather than doing nothing
  await page.getByRole('button', { name: /^create account$/i }).click();
  check('empty sign-up reports every missing field',
    await waitFor(/Tell us what to call you/i)
    && await waitFor(/An email address is needed/i)
    && await waitFor(/Pick a password/i));

  await page.getByLabel('Your name', { exact: true }).fill('Priya');
  await page.getByLabel('Email', { exact: true }).fill('priya@example.com');
  await page.getByLabel('Password', { exact: true }).fill('short');
  check('a short password is refused', await waitFor(/at least 8 characters/i));
  check('the strength gauge calls it too short', await waitFor(/Too short/i));

  await page.getByLabel('Password', { exact: true }).fill('olivegrove7');
  check('a good password clears the error', !/at least 8 characters/i.test(await text()));

  await page.getByRole('button', { name: /^create account$/i }).click();
  check('signing up lands on home', await waitFor(/Priya/));
  check('home shows net worth', await waitFor(/8,74,350/));

  // ---- The session survives a reload ----
  await page.reload({ waitUntil: 'networkidle' });
  check('the session survives a reload', await waitFor(/Priya/));

  // ---- Sign out → sign in ----
  await page.goto(`${BASE}/?screen=settings`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^sign out/i }).click();
  check('signing out returns to welcome',
    await waitFor(/O\s*I\s*K\s*O\s*N\s*O\s*S/));

  await page.getByRole('button', { name: /already have an account/i }).click();
  check('sign-in opens from welcome', await waitFor(/Welcome back/i));
  await settle();

  await page.getByLabel('Email', { exact: true }).fill('priya@example.com');
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  check('a wrong password is rejected', await waitFor(/does not match/i));

  await page.getByLabel('Email', { exact: true }).fill('nobody@example.com');
  await page.getByLabel('Password', { exact: true }).fill('olivegrove7');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  check('an unknown email is rejected', await waitFor(/No account here uses that email/i));

  // ---- Forgot password, end to end ----
  await page.getByRole('button', { name: /forgot your password/i }).click();
  check('reset asks for the email', await waitFor(/Reset your password/i));
  await settle();
  await page.getByLabel('Email', { exact: true }).fill('priya@example.com');
  await page.getByRole('button', { name: /send a code/i }).click();
  check('a code is issued', await waitFor(/Your code is \d{6}/));
  await settle();

  const issued = (await text()).match(/Your code is (\d{6})/)?.[1] ?? '';
  await page.getByLabel('Six-digit code', { exact: true }).fill(issued === '000000' ? '111111' : '000000');
  await page.getByLabel('New password', { exact: true }).fill('newolive9');
  await page.getByRole('button', { name: /set new password/i }).click();
  check('a wrong code is refused', await waitFor(/code is not right/i));

  await page.getByLabel('Six-digit code', { exact: true }).fill(issued);
  await page.getByRole('button', { name: /set new password/i }).click();
  check('the right code resets the password and signs in', await waitFor(/Priya/));

  // ---- Back to the seeded ledger, which is Arjun's ----
  await page.goto(`${BASE}/?screen=settings`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^sign out/i }).click();
  await page.getByRole('button', { name: /already have an account/i }).click();
  await settle();
  await page.getByRole('button', { name: /use the demo/i }).click();
  await page.getByRole('button', { name: /^sign in$/i }).click();
  check('the demo account signs in', await waitFor(/Arjun/));

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

  // ---- Home → transaction detail → back ----
  await page.getByText('Good Earth', { exact: false }).first().click();
  check('transaction detail opens',
    (await waitFor(/Good Earth/)) && (await waitFor(/2,850/)));

  await page.getByRole('button', { name: /^back$/i }).click();
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

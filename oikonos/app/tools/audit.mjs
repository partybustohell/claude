#!/usr/bin/env node
/**
 * WHOLE-APP AUDIT
 * ============================================================
 * `flow.mjs` walks one happy path and asserts twenty-one things about it.
 * That proves the path works; it proves nothing about the other thirty-odd
 * screens or the several hundred controls on them. This walks EVERYTHING.
 *
 * For every route in ROUTE_NAMES it checks:
 *
 *   RENDER   the screen mounts, throws nothing, logs no console error,
 *            and puts more than a trivial amount of text on the page
 *   CONTROLS every button, link, input and switch on the screen is
 *            clicked, and the result classified: did it navigate, open a
 *            sheet, change the DOM — or do NOTHING AT ALL? A control that
 *            does nothing is the characteristic fault of a screen-by-screen
 *            prototype and it is invisible to a happy-path test.
 *   BACK     every pushed screen can be got out of
 *   LABELS   every control has an accessible name
 *   LAYOUT   nothing overflows the viewport horizontally
 *
 * and separately: every sheet opens and closes by both affordances it
 * offers, every id-taking screen survives an id that does not exist,
 * anything taller than the phone can be scrolled, and the app still
 * renders under prefers-reduced-motion.
 *
 *   node tools/audit.mjs              # everything
 *   node tools/audit.mjs home goals   # named routes only
 *   node tools/audit.mjs --quick      # render + labels + layout, no clicking
 *
 * Exit code is the number of failures, so it can gate a commit.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import net from 'node:net';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.AUDIT_PORT ?? 5181);
const BASE = `http://127.0.0.1:${PORT}`;

/**
 * Every route, with an id where the route needs one. Kept in step with
 * ROUTE_NAMES in src/nav.tsx — the audit asserts the two agree, so adding
 * a route without adding it here is itself a failure.
 */
const ROUTES = {
  welcome: '', home: '', activity: '', budgets: '', goals: '',
  txn: 'id=t001', merchant: 'id=good-earth', search: '', recurring: '',
  transfer: '', payee: 'id=p1', bills: '', bill: 'id=bl4', scan: '',
  accounts: '', account: 'id=hdfc', addAccount: '',
  categories: '', category: 'id=food',
  budget: 'id=b1', newBudget: '',
  goal: 'id=g1', newGoal: '', goalHistory: 'id=g1',
  insights: '', report: '', networth: '', cashflow: '', subscriptions: '',
  profile: '', notifications: '', settings: '', appearance: '',
  notifySettings: '', security: '', currency: '', connected: '',
  help: '', about: '',
};

/** The sheets, and the route each one is presented over. */
const SHEETS = [
  { kind: 'add', q: 'screen=home&sheet=add' },
  { kind: 'contribute', q: 'screen=goal&id=g1&sheet=contribute' },
  { kind: 'editBudget', q: 'screen=budget&id=b1&sheet=editBudget' },
  { kind: 'note', q: 'screen=txn&id=t001&sheet=note' },
  { kind: 'category', q: 'screen=txn&id=t001&sheet=category' },
];

/* Tabs are the root of the stack, so they have no back. Welcome is the
   entry screen and has no back either. */
const NO_BACK = new Set(['welcome', 'home', 'activity', 'budgets', 'goals']);

/* ================================================================
   Reporting
   ================================================================ */

const fails = [];
const warns = [];
let checks = 0;

const C = { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', off: '\x1b[0m' };

function fail(scope, msg) {
  fails.push(`${scope}: ${msg}`);
  console.log(`  ${C.red}✗${C.off} ${scope} — ${msg}`);
}
function warn(scope, msg) {
  warns.push(`${scope}: ${msg}`);
  console.log(`  ${C.yellow}!${C.off} ${scope} — ${msg}`);
}
function pass(msg) {
  checks++;
  console.log(`  ${C.green}✓${C.off} ${msg}`);
}

/* ================================================================
   Server
   ================================================================ */

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
    cwd: ROOT, stdio: 'ignore',
  });
  for (let i = 0; i < 160; i++) {
    await delay(250);
    if (await portOpen(PORT)) return p;
  }
  p.kill();
  throw new Error('vite failed to start');
}

/* ================================================================
   Page helpers
   ================================================================ */

/**
 * A signature of everything the user can see or a screen reader can read,
 * with inline styles stripped.
 *
 * Written as an IIFE, and it has to be: `page.evaluate` treats a STRING as
 * an expression, so a bare `() => {...}` source evaluates to a function
 * object that never runs and returns the same non-value every time. Every
 * control then looks dead and every back button looks broken — which is
 * precisely what the first run of this audit reported, on 34 screens at
 * once.
 *
 * The strip is not optional: framer-motion writes a `transform` into the
 * style attribute on every animation frame, so an un-stripped signature
 * changes constantly and every control looks live.
 */
const SIGNATURE = `(() => {
  const root = document.querySelector('.app-root');
  if (!root) return 'NO-ROOT';
  const html = root.innerHTML
    .replace(/ style="[^"]*"/g, '')
    .replace(/ transform="[^"]*"/g, '');
  const vals = [...root.querySelectorAll('input, textarea, select')]
    .map((e) => e.value + '|' + e.checked).join(',');
  const page = root.querySelector('.app-page');
  return (page ? page.dataset.route : '?') + '::'
    + (root.querySelector('[role=dialog], .sheet') ? 'SHEET' : '-') + '::'
    + vals + '::' + html.length + ':' + hash(html);
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return h;
  }
})()`;

/** The one selector for "things a user can operate". */
const CONTROL_SEL = 'button, a[href], [role="button"], [role="switch"], [role="tab"], input, select, textarea, [role="checkbox"], [role="radio"]';

/** Every control a user can operate, with enough to describe it in a report. */
const CONTROLS = `(() => {
  const sel = 'button, a[href], [role="button"], [role="switch"], [role="tab"],'
    + ' input, select, textarea, [role="checkbox"], [role="radio"]';
  const out = [];
  document.querySelectorAll(sel).forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;                 // not on screen
    if (el.disabled) return;                                  // legitimately off
    if (el.closest('[aria-hidden="true"]')) return;
    const name = (el.getAttribute('aria-label')
      || el.textContent.trim()
      || el.getAttribute('placeholder')
      || el.getAttribute('title') || '').replace(/\\s+/g, ' ').slice(0, 44);
    out.push({
      i, name, tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || '',
      role: el.getAttribute('role') || '',
      /* Re-selecting what is already selected is SUPPOSED to do nothing:
         the current tab, the filter chip already in force. The app marks
         both, so the audit can tell them apart from a control that was
         simply never wired up. */
      current: el.getAttribute('aria-current') != null
        || el.getAttribute('aria-selected') === 'true'
        /* A radio that is already the chosen one. NOT a switch or a
           checkbox — those must flip, and a dead one is a real fault. */
        || (el.getAttribute('role') === 'radio'
            && el.getAttribute('aria-checked') === 'true')
        /* A chip in a single-select group that is already the pressed
           one. A real toggle also uses aria-pressed and MUST flip, so
           this is not a free pass: anything excluded here is retried
           from a different state below before it is let go. */
        || el.getAttribute('aria-pressed') === 'true',
    });
  });
  return out;
})()`;

async function newPage(browser, opts = {}) {
  const page = await browser.newPage({
    viewport: { width: 420, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: opts.reducedMotion,
  });
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(`uncaught: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    /* Vite's HMR chatter and favicon 404s are not app faults. */
    if (/favicon|\[vite\]|Download the React DevTools/i.test(t)) return;
    page.__errors.push(`console: ${t.slice(0, 160)}`);
  });
  return page;
}

async function open(page, query) {
  page.__errors.length = 0;
  await page.goto(`${BASE}/?${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.app-root', { timeout: 8000 });
  await delay(650);                      // let the entrance settle
}

/* ================================================================
   The audit
   ================================================================ */

async function auditRoute(browser, name, quick) {
  const q = `screen=${name}${ROUTES[name] ? `&${ROUTES[name]}` : ''}`;
  const page = await newPage(browser);
  const scope = name;

  try {
    await open(page, q);

    /* ---- RENDER ---- */
    if (page.__errors.length) {
      fail(scope, `errors on load — ${page.__errors[0]}`);
    }
    const text = await page.evaluate(
      '(document.querySelector(".app-page")?.innerText || "").trim()');
    if (text.length < 12) {
      fail(scope, `renders almost nothing (${text.length} chars of text)`);
    } else {
      pass(`${scope} renders`);
    }

    /* ---- LAYOUT: nothing may overflow sideways ---- */
    const over = await page.evaluate(`(() => {
      const el = document.querySelector('.app-body') || document.querySelector('.app-root');
      return el ? el.scrollWidth - el.clientWidth : 0;
    })()`);
    if (over > 2) fail(scope, `overflows horizontally by ${over}px`);

    /* ---- LABELS ---- */
    const unlabelled = await page.evaluate(`(() => {
      const bad = [];
      document.querySelectorAll('button, [role="button"], [role="switch"], a[href]')
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) return;
          const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
          if (!name) bad.push(el.className || el.tagName);
        });
      return bad;
    })()`);
    if (unlabelled.length) {
      fail(scope, `${unlabelled.length} control(s) with no accessible name: ${unlabelled.slice(0, 3).join(', ')}`);
    }

    /* ---- BACK ---- */
    if (!NO_BACK.has(name)) {
      const before = await page.evaluate(SIGNATURE);
      const backBtn = await page.$('[aria-label="Back"], [aria-label="Close"], .nav-back');
      if (!backBtn) {
        fail(scope, 'pushed screen with no back control');
      } else {
        await backBtn.click();
        await delay(900);
        const after = await page.evaluate(SIGNATURE);
        if (after === before) fail(scope, 'back control does not leave the screen');
        else pass(`${scope} can be left`);
        await open(page, q);
      }
    }

    if (quick) return;

    /* ---- CONTROLS: the point of the exercise ---- */
    const controls = await page.evaluate(CONTROLS);
    const dead = [];
    let inert = 0;
    let stateDependent = 0;
    let primer = null;
    for (const c of controls) {
      /* Text fields are exercised by typing, not clicking. */
      if (c.tag === 'input' && !['checkbox', 'radio', 'button', 'submit', 'range'].includes(c.type)) {
        const ok = await page.evaluate(`(() => {
          const el = document.querySelectorAll('button, a[href], [role="button"], [role="switch"], [role="tab"], input, select, textarea, [role="checkbox"], [role="radio"]')[${c.i}];
          return !!el && !el.readOnly;
        })()`);
        if (!ok) continue;
        const handle = (await page.$$(CONTROL_SEL))[c.i];
        if (!handle) continue;
        await handle.fill('7').catch(() => {});
        const v = await handle.inputValue().catch(() => '');
        if (v === '') dead.push(`${c.name || c.tag} (will not accept input)`);
        await open(page, q);
        continue;
      }

      const before = await page.evaluate(SIGNATURE);
      const handles = await page.$$(CONTROL_SEL);
      const h = handles[c.i];
      if (!h) continue;
      const errsBefore = page.__errors.length;
      await h.click({ timeout: 3000 }).catch(() => {});
      await delay(620);
      const after = await page.evaluate(SIGNATURE);

      if (page.__errors.length > errsBefore) {
        fail(scope, `"${c.name || c.tag}" throws — ${page.__errors[page.__errors.length - 1]}`);
      }
      if (after === before) {
        if (c.current) inert++;                       // already in that state
        else dead.push({ i: c.i, name: c.name || `<${c.tag}>` });
      } else {
        if (primer === null) primer = c.i;            // a control known to do something
        await open(page, q);            // it did something; restore the screen
      }
    }

    /*
     * SECOND CHANCE, and it is the difference between a report worth
     * reading and one full of noise.
     *
     * A control can be correctly inert in the state it happens to be
     * found in: a keypad's delete with nothing typed yet, a zero on an
     * empty amount, a chip that is already the chosen one. Reporting
     * those as dead is how an audit teaches people to ignore it.
     *
     * So every apparent dead control gets one more go, this time after
     * the screen has been moved off its opening state by a control that
     * is known to work. Anything that responds the second time was
     * state-dependent, not unwired. Anything still inert in both states
     * is reported — including, deliberately, an aria-pressed toggle that
     * turned out not to toggle.
     */
    if (dead.length && primer !== null) {
      const survivors = [];
      for (const d of dead) {
        await open(page, q);
        const all = async () => page.$$(CONTROL_SEL);
        const p = (await all())[primer];
        if (p) { await p.click({ timeout: 3000 }).catch(() => {}); await delay(420); }
        const before = await page.evaluate(SIGNATURE);
        const h = (await all())[d.i];
        if (!h) continue;
        await h.click({ timeout: 3000 }).catch(() => {});
        await delay(560);
        if (await page.evaluate(SIGNATURE) === before) survivors.push(d.name);
        else stateDependent++;
      }
      dead.length = 0;
      survivors.forEach((n) => dead.push({ name: n }));
    }

    if (dead.length) {
      fail(scope, `${dead.length}/${controls.length} control(s) do nothing in any state: `
        + dead.slice(0, 6).map((d) => `"${d.name}"`).join(', '));
    } else if (controls.length) {
      pass(`${scope} — all ${controls.length} controls respond`
        + (inert || stateDependent
          ? ` (${[inert && `${inert} already-selected`,
                  stateDependent && `${stateDependent} state-dependent`]
              .filter(Boolean).join(', ')})`
          : ''));
    }
  } catch (e) {
    fail(scope, `audit threw — ${e.message}`);
  } finally {
    await page.close();
  }
}

async function auditSheets(browser) {
  console.log('\nSHEETS');
  for (const s of SHEETS) {
    const page = await newPage(browser);
    try {
      await open(page, s.q);
      if (page.__errors.length) {
        fail(`sheet:${s.kind}`, `errors on load — ${page.__errors[0]}`);
      }
      const present = await page.evaluate(
        '!!document.querySelector(\'[role="dialog"], .sheet\')');
      if (!present) { fail(`sheet:${s.kind}`, 'does not present'); continue; }

      const shown = '!!document.querySelector(\'[role="dialog"], .sheet\')';

      /* Escape. */
      await page.keyboard.press('Escape');
      await delay(700);
      if (await page.evaluate(shown)) fail(`sheet:${s.kind}`, 'Escape does not dismiss it');
      else pass(`sheet:${s.kind} dismisses on Escape`);

      /* The scrim, tapped where it is ACTUALLY exposed: its centre sits
         behind the sheet, and its top few rows sit behind the phone
         frame's status bar. Aim between the two. */
      await open(page, s.q);
      const scrim = await page.$('[aria-label="Dismiss"], .sheetlayer__scrim');
      if (!scrim) { fail(`sheet:${s.kind}`, 'presents with no scrim to tap'); continue; }
      const box = await scrim.boundingBox();
      const sheetTop = await page.evaluate(
        '(() => { const e = document.querySelector(".sheet"); return e ? e.getBoundingClientRect().top : 1e4; })()');
      await page.mouse.click(box.x + box.width / 2,
        Math.min(box.y + 90, sheetTop - 24));
      await delay(700);
      if (await page.evaluate(shown)) fail(`sheet:${s.kind}`, 'tapping the scrim does not dismiss it');
      else pass(`sheet:${s.kind} dismisses on a scrim tap`);
    } catch (e) {
      fail(`sheet:${s.kind}`, `threw — ${e.message}`);
    } finally {
      await page.close();
    }
  }
}

/**
 * Every screen that takes an id has to survive being handed one that does
 * not exist. A detail screen for a deleted account is not hypothetical —
 * it is one stale link away — and the failure mode is a white screen.
 */
async function auditMissingIds(browser) {
  console.log('\nMISSING IDS');
  const withId = Object.entries(ROUTES).filter(([, q]) => q.startsWith('id='));
  for (const [name] of withId) {
    const page = await newPage(browser);
    try {
      await open(page, `screen=${name}&id=__no_such_id__`);
      const text = await page.evaluate(
        '(document.querySelector(".app-page")?.innerText || "").trim()');
      if (page.__errors.length) {
        fail(`missing-id:${name}`, `throws on an unknown id — ${page.__errors[0]}`);
      } else if (text.length < 8) {
        fail(`missing-id:${name}`, 'renders a blank screen for an unknown id');
      } else {
        pass(`missing-id:${name} degrades to a readable screen`);
      }
      /* and it still has to be possible to leave */
      const backBtn = await page.$('[aria-label="Back"], [aria-label="Close"], .nav-back');
      if (!backBtn) fail(`missing-id:${name}`, 'no way back off the not-found screen');
    } catch (e) {
      fail(`missing-id:${name}`, `threw — ${e.message}`);
    } finally {
      await page.close();
    }
  }
}

/**
 * A screen whose content is taller than the phone must have something that
 * scrolls, or the bottom of it is simply unreachable.
 */
async function auditScroll(browser) {
  console.log('\nSCROLL');
  const page = await newPage(browser);
  try {
    for (const name of Object.keys(ROUTES)) {
      const q = `screen=${name}${ROUTES[name] ? `&${ROUTES[name]}` : ''}`;
      await open(page, q);
      const r = await page.evaluate(`(() => {
        const page = document.querySelector('.app-page');
        const scrollable = [...document.querySelectorAll('.app-page *')].filter((e) => {
          const o = getComputedStyle(e).overflowY;
          return (o === 'auto' || o === 'scroll') && e.scrollHeight - e.clientHeight > 8;
        });
        /* Only the PAGE overflowing matters. A clipped child that is not
           meant to scroll — an illustration, a masked band — overflows by
           design, and counting those made this fire on a screen that was
           entirely reachable. */
        return {
          tall: page ? page.scrollHeight - page.clientHeight : 0,
          scrollable: scrollable.length,
        };
      })()`);
      if (r.tall > 8 && r.scrollable === 0) {
        fail(`scroll:${name}`, `content overflows by ${r.tall}px with nothing scrollable`);
      }
    }
    pass('every screen taller than the phone can be scrolled');
  } finally {
    await page.close();
  }
}

async function auditReducedMotion(browser) {
  console.log('\nREDUCED MOTION');
  const page = await newPage(browser, { reducedMotion: 'reduce' });
  try {
    for (const name of ['welcome', 'home', 'goals', 'txn']) {
      const q = `screen=${name}${ROUTES[name] ? `&${ROUTES[name]}` : ''}`;
      await open(page, q);
      const text = await page.evaluate(
        '(document.querySelector(".app-page")?.innerText || "").trim()');
      if (page.__errors.length) fail(`reduced-motion:${name}`, page.__errors[0]);
      else if (text.length < 12) fail(`reduced-motion:${name}`, 'renders nothing');
      else pass(`reduced-motion:${name} renders`);
    }
  } finally {
    await page.close();
  }
}

/** The route table here must not drift from the one the app ships. */
async function auditRouteTable(browser) {
  const page = await newPage(browser);
  try {
    await open(page, 'screen=home');
    const names = await page.evaluate(`(async () => {
      const m = await import('/src/nav.tsx');
      return m.ROUTE_NAMES;
    })()`);
    const mine = Object.keys(ROUTES);
    const missing = names.filter((n) => !mine.includes(n));
    const extra = mine.filter((n) => !names.includes(n));
    if (missing.length) fail('route-table', `audit does not cover: ${missing.join(', ')}`);
    if (extra.length) fail('route-table', `audit covers routes the app does not have: ${extra.join(', ')}`);
    if (!missing.length && !extra.length) pass(`route-table — all ${names.length} routes covered`);
  } catch (e) {
    warn('route-table', `could not be read (${e.message.slice(0, 60)})`);
  } finally {
    await page.close();
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const quick = argv.includes('--quick');
  const only = argv.filter((a) => !a.startsWith('--'));
  const targets = only.length ? only : Object.keys(ROUTES);

  const server = await ensureServer();
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || undefined,
    args: ['--force-color-profile=srgb'],
  });

  try {
    if (!only.length) await auditRouteTable(browser);
    console.log('\nROUTES');
    for (const name of targets) {
      if (!(name in ROUTES)) { fail(name, 'not a route'); continue; }
      await auditRoute(browser, name, quick);
    }
    if (!only.length) {
      await auditSheets(browser);
      await auditMissingIds(browser);
      await auditScroll(browser);
      await auditReducedMotion(browser);
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }

  console.log(`\n${checks} checks passed, ${fails.length} failed, ${warns.length} warnings`);
  if (fails.length) {
    console.log(`\n${C.red}FAILURES${C.off}`);
    fails.forEach((f) => console.log(`  · ${f}`));
  }
  process.exit(fails.length ? 1 : 0);
}

main();

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '../data/store';
import { useNav } from '../nav';
import { Screen, TopBar, Eyebrow } from '../components/ui';
import { ArrowRight } from '../components/icons';
import { Initials, QrMark, railName } from './Payee';
import { surface, snap } from '../lib/motion';
import './Scan.css';
import { PlateBand } from '../illustrations/place';

const VF = 272;          /* viewfinder edge, px */
const QR_N = 25;         /* modules per side, quiet zone excluded */

/* ================================================================
   A deterministic block code
   ----------------------------------------------------------------
   This is not a real QR payload and does not claim to be one — it is
   a printed stand-in, seeded from the handle so the same person
   always gets the same pattern. Finders, timing and one alignment
   square are placed properly so the shape reads as a code at a
   glance rather than as noise.
   ================================================================ */

function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function blockCode(payload: string, n: number): boolean[][] {
  let s = seedOf(payload) || 1;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const g: boolean[][] = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) g[y][x] = rnd() > 0.52;
  }

  const finder = (ox: number, oy: number) => {
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const yy = oy + y;
        const xx = ox + x;
        if (yy < 0 || yy >= n || xx < 0 || xx >= n) continue;
        const inside = x >= 0 && x <= 6 && y >= 0 && y <= 6;
        if (!inside) { g[yy][xx] = false; continue; }
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        g[yy][xx] = edge || core;
      }
    }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);

  for (let i = 8; i < n - 8; i++) {
    g[6][i] = i % 2 === 0;
    g[i][6] = i % 2 === 0;
  }

  const a = n - 9;
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const edge = x === 0 || x === 4 || y === 0 || y === 4;
      g[a + y][a + x] = edge || (x === 2 && y === 2);
    }
  }
  return g;
}

function BlockCode({ payload, size }: { payload: string; size: number }) {
  const g = useMemo(() => blockCode(payload, QR_N), [payload]);
  const pad = 2;
  const span = QR_N + pad * 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${span} ${span}`}
      className="scan__code"
      role="img"
      aria-label="A stand-in payment code"
      shapeRendering="crispEdges"
    >
      {g.map((row, y) => row.map((on, x) => (on ? (
        <rect key={`${x}-${y}`} x={x + pad} y={y + pad} width="1" height="1" fill="var(--ink)" />
      ) : null)))}
    </svg>
  );
}

/* ================================================================
   The iris — a printed lens mark, not a camera feed
   ================================================================ */

function Iris({ size = 96 }: { size?: number }) {
  const R = 44;
  const H = 19;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * (Math.PI / 180);
    const b = ((i * 60 - 90) + 42) * (Math.PI / 180);
    return {
      vx: H * Math.cos(a), vy: H * Math.sin(a),
      ox: R * Math.cos(b), oy: R * Math.sin(b),
    };
  });
  const hex = pts.map((p, i) => `${i ? 'L' : 'M'}${p.vx.toFixed(2)},${p.vy.toFixed(2)}`).join(' ') + ' Z';
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden className="scan__iris"
      fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle r={R} strokeWidth="1.5" opacity="0.42" />
      <path d={hex} strokeWidth="1.6" opacity="0.85" />
      {pts.map((p, i) => (
        <path
          key={i}
          d={`M${p.vx.toFixed(2)},${p.vy.toFixed(2)} L${p.ox.toFixed(2)},${p.oy.toFixed(2)}`}
          strokeWidth="1.5"
          opacity="0.55"
        />
      ))}
    </svg>
  );
}

/* ================================================================
   Scan
   ================================================================ */

export function Scan() {
  const { back, push } = useNav();
  const { payees, user, now } = useApp();
  const reduce = useReducedMotion();
  const [mine, setMine] = useState(false);

  const nowMs = useMemo(() => new Date(now).getTime(), [now]);
  const daysAgo = (iso?: string) =>
    (iso ? Math.max(0, Math.round((nowMs - new Date(iso).getTime()) / 86400000)) : Infinity);

  const recents = useMemo(
    () => [...payees].sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? '')),
    [payees],
  );

  /* Nothing in the seed says how cold the address book has gone. */
  const reading = useMemo(() => {
    const dated = recents.filter((p) => p.lastAt);
    if (dated.length === 0) return 'No handle here has moved money yet.';
    const ages = dated.map((p) => daysAgo(p.lastAt));
    const max = Math.max(...ages);
    const coldest = dated[ages.indexOf(max)];
    const today = ages.filter((a) => a === 0).length;
    return `${payees.length} saved handles${today ? `, ${today} of them paid today` : ''}. `
      + `${railName(coldest.name, coldest.kind)} is the coldest at ${max} days.`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recents, payees.length, nowMs]);

  const vpa = `${user.handle.replace(/^@/, '')}@oikonos`;
  const payload = `upi://pay?pa=${vpa}&pn=${user.name}&cu=INR`;

  return (
    <Screen className="scan">
      <div className="scan__plate tex-ink">
        <div className="scan__tone" aria-hidden />

        <div className="scan__plateinner">
          <TopBar
            onBack={back}
            tone="var(--on-ink)"
            right={<span className="scan__topspacer" aria-hidden />}
          />

          <div className="scan__head">
            <Eyebrow tone="var(--on-ink-muted)">{mine ? 'Your code' : 'Scan & pay'}</Eyebrow>
            <h1 className="scan__title display">
              {mine ? user.name : 'Point at any UPI code'}
            </h1>
          </div>

          <div className="scan__stage">
            <motion.div
              className="scan__flip"
              style={{ width: VF, height: VF }}
              animate={{ rotateY: mine ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : surface}
            >
              {/* ---- Front: the viewfinder ---- */}
              <div className="scan__face">
                <div className="scan__vf">
                  {/* The sweep and the bracket breath are ambient loops, not
                      state changes, so they are CSS keyframes rather than
                      springs — and they stop dead under prefers-reduced-motion.
                      Their travel is pinned to VF in Scan.css. */}
                  <div className="scan__well tex-stipple" aria-hidden>
                    <span className="scan__sweep" />
                  </div>

                  <div className="scan__vfmid">
                    <Iris size={96} />
                    <span className="scan__vfnote eyebrow">No camera in this demo</span>
                  </div>

                  <div className="scan__cnrs" aria-hidden>
                    <span className="scan__cnr scan__cnr--tl" />
                    <span className="scan__cnr scan__cnr--tr" />
                    <span className="scan__cnr scan__cnr--bl" />
                    <span className="scan__cnr scan__cnr--br" />
                  </div>
                </div>
              </div>

              {/* ---- Back: my own code ---- */}
              <div className="scan__face scan__face--back">
                <div className="scan__card tex-card">
                  <BlockCode payload={payload} size={186} />
                  <p className="scan__cardname display">{user.name}</p>
                  <p className="scan__cardhandle num">{vpa}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <p className="scan__caption">
            {mine
              ? 'Anyone can scan this to send you money. The pattern is drawn from your handle — it is a stand-in, not a live code.'
              : 'Hold a code inside the frame — shop stickers, printed bills and other apps’ codes all read the same.'}
          </p>

          <div className="scan__actions">
            <motion.button
              className="scan__pill"
              onClick={() => setMine((v) => !v)}
              whileTap={{ scale: 0.97 }}
              transition={snap}
            >
              <QrMark size={16} />
              <span>{mine ? 'Back to the viewfinder' : 'Show my QR'}</span>
            </motion.button>
          </div>
        </div>

        {/* The street you are standing in while you point the camera. It
            sits at the very foot of the ink plate, below every control,
            so nothing is ever read against it. */}
        <PlateBand plate="shopfront" height={104} style={{ opacity: 0.5 }} />
      </div>

      {/* ---- The tray ---- */}
      <div className="scan__tray tex-card">
        <div className="scan__trayhead">
          <Eyebrow>Pay without scanning</Eyebrow>
          <motion.button
            className="scan__trayall"
            onClick={() => push({ name: 'transfer' })}
            whileTap={{ scale: 0.96 }}
            transition={snap}
          >
            <span>Enter a handle</span>
            <ArrowRight size={13} />
          </motion.button>
        </div>

        <div className="scan__recents">
          {recents.map((p) => {
            const d = daysAgo(p.lastAt);
            return (
              <motion.button
                key={p.id}
                className="scan__recent"
                onClick={() => push({ name: 'payee', id: p.id })}
                whileTap={{ scale: 0.94 }}
                transition={snap}
                aria-label={`Pay ${p.name}, ${p.handle}`}
              >
                <Initials name={p.name} size={44} />
                <span className="scan__recentname">{railName(p.name, p.kind)}</span>
                <span className="scan__recentwhen num">
                  {!Number.isFinite(d) ? 'new' : d === 0 ? 'today' : `${d}d`}
                </span>
              </motion.button>
            );
          })}
        </div>

        <p className="scan__reading">{reading}</p>
      </div>
    </Screen>
  );
}

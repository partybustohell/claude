/**
 * Documentation primitives.
 *
 * The reference site is built out of the same system it documents — cream
 * ground, cobalt ink, warm elevation, Fraunces for headings. Anything it
 * needs that the app kit does not provide lives here, and nothing here
 * introduces a colour or a size outside the token layer.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  contrastOf, isNeutral, parseColor, resolveToken,
  type TokenGroup, type TokenSpec,
} from './tokens';

/* ================================================================
   Structure
   ================================================================ */

export function Chapter({
  id, title, lede, children,
}: { id: string; title: string; lede: ReactNode; children: ReactNode }) {
  return (
    <section className="ch" id={id}>
      <header className="ch__head">
        <h2 className="ch__title display">{title}</h2>
        <p className="ch__lede">{lede}</p>
      </header>
      {children}
    </section>
  );
}

export function Sub({
  title, children, note,
}: { title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <section className="sub">
      <h3 className="sub__title display">{title}</h3>
      {note && <p className="sub__note">{note}</p>}
      {children}
    </section>
  );
}

/** A framed live example. The frame is the documentation, not the app. */
export function Specimen({
  label, children, ground = 'paper', pad = 24, cols,
}: {
  label?: string;
  children: ReactNode;
  ground?: 'paper' | 'warm' | 'ink' | 'olive' | 'none';
  pad?: number;
  /** Lay the contents out as a row that wraps, with this minimum column. */
  cols?: number;
}) {
  const cls = ground === 'none' ? 'spec spec--bare' : `spec spec--${ground}`;
  const tex = ground === 'ink' || ground === 'olive' ? 'tex-ink'
    : ground === 'none' ? '' : 'tex-paper';
  return (
    <figure className="specwrap">
      <div
        className={`${cls} ${tex}`}
        style={{
          padding: pad,
          ...(cols
            ? {
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${cols}px, 1fr))`,
              gap: 'var(--s-4)',
              alignItems: 'center',
            }
            : {}),
        }}
      >
        {children}
      </div>
      {label && <figcaption className="specwrap__cap">{label}</figcaption>}
    </figure>
  );
}

/** A short prose aside — a rule, a reason, or a trap. */
export function Note({
  kind = 'rule', children,
}: { kind?: 'rule' | 'why' | 'trap'; children: ReactNode }) {
  const tag = kind === 'rule' ? 'Rule' : kind === 'why' ? 'Why' : 'Trap';
  return (
    <aside className={`note note--${kind}`}>
      <span className="note__tag eyebrow">{tag}</span>
      <div className="note__body">{children}</div>
    </aside>
  );
}

export function Do({ children }: { children: ReactNode }) {
  return <div className="dd dd--do"><span className="dd__tag eyebrow">Do</span><p>{children}</p></div>;
}

export function Dont({ children }: { children: ReactNode }) {
  return <div className="dd dd--dont"><span className="dd__tag eyebrow">Don’t</span><p>{children}</p></div>;
}

export function DoDont({ children }: { children: ReactNode }) {
  return <div className="ddgrid">{children}</div>;
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="code">{children}</code>;
}

export function Snippet({ children }: { children: string }) {
  return <pre className="snippet"><code>{children.trim()}</code></pre>;
}

/* ================================================================
   Prop tables
   ================================================================ */

export interface PropRow {
  name: string;
  type: string;
  def?: string;
  note: string;
}

export function PropTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="tablewrap">
      <table className="tbl">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Default</th><th>Notes</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td><code className="code">{r.name}</code></td>
              <td className="tbl__type">{r.type}</td>
              <td className="tbl__def">{r.def ?? '—'}</td>
              <td>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Token rendering
   ================================================================ */

/**
 * Live values, read once after mount.
 *
 * Reading the cascade rather than importing a mirror of it is the whole
 * anti-drift mechanism: there is exactly one place a value is written.
 */
export function useTokenValues(names: string[]): Record<string, string> {
  const key = names.join('|');
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const n of key.split('|')) next[n] = resolveToken(n);
    setVals(next);
  }, [key]);
  return vals;
}

function Sample({ kind, value }: { kind: TokenGroup['kind']; value: string }) {
  if (!value) return <span className="sample sample--empty" />;

  switch (kind) {
    case 'color': {
      const rgb = parseColor(value);
      const grey = rgb ? isNeutral(rgb) : false;
      return (
        <span
          className={`sample sample--color ${grey ? 'sample--grey' : ''}`}
          style={{ background: value }}
          title={grey ? 'Neutral — this is a bug' : value}
        />
      );
    }
    case 'shadow':
      return <span className="sample sample--shadow" style={{ boxShadow: value }} />;
    case 'duration':
      return <span className="sample sample--bar" style={{ width: `min(100%, ${parseFloat(value) / 6}px)` }} />;
    case 'easing':
      return <EaseCurve value={value} />;
    case 'font':
      return <span className="sample sample--font" style={{ fontFamily: value }}>Aa</span>;
    case 'length': {
      const px = parseFloat(value);
      if (Number.isNaN(px)) return <span className="sample sample--empty" />;
      return <span className="sample sample--bar" style={{ width: Math.min(px, 120) }} />;
    }
    case 'number': {
      const n = parseFloat(value);
      return (
        <span className="sample sample--dot">
          <span style={{ opacity: Number.isNaN(n) ? 1 : Math.min(1, n * 6) }} />
        </span>
      );
    }
    default:
      return <span className="sample sample--empty" />;
  }
}

/** Draws a cubic-bezier token as its own curve. */
function EaseCurve({ value }: { value: string }) {
  const nums = value.match(/-?[\d.]+/g)?.map(Number);
  if (!nums || nums.length < 4) return <span className="sample sample--empty" />;
  const [x1, y1, x2, y2] = nums;
  const S = 34;
  const px = (x: number) => x * S;
  const py = (y: number) => S - y * S;
  return (
    <svg className="sample sample--curve" width={S} height={S} viewBox={`0 0 ${S} ${S}`} fill="none" aria-hidden>
      <path d={`M0,${S} C${px(x1)},${py(y1)} ${px(x2)},${py(y2)} ${S},0`}
        stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * One token group as a table: live value, a rendering of that value, the
 * role it plays, and — for colour — its measured contrast on cream.
 */
export function TokenTable({ group }: { group: TokenGroup }) {
  /* --paper is read alongside the group's own tokens because every colour
     ratio in the table is measured against it, including for groups that
     do not contain it. */
  const names = useMemo(() => [...group.tokens.map((t) => t.name), '--paper'], [group]);
  const vals = useTokenValues(names);
  const paper = vals['--paper'] ?? '';
  const isColor = group.kind === 'color';

  return (
    <div className="tablewrap">
      <table className="tbl tbl--tokens">
        <thead>
          <tr>
            <th aria-label="Sample" />
            <th>Token</th>
            <th>Value</th>
            {isColor && <th title="WCAG contrast against --paper">On cream</th>}
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {group.tokens.map((t) => (
            <TokenRow key={t.name} spec={t} kind={group.kind} value={vals[t.name] ?? ''}
              paper={isColor ? paper : undefined} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TokenRow({
  spec, kind, value, paper,
}: { spec: TokenSpec; kind: TokenGroup['kind']; value: string; paper?: string }) {
  const ratio = paper ? contrastOf(value, paper) : null;
  return (
    <tr className={spec.internal ? 'tbl__row--internal' : undefined}>
      <td className="tbl__sample"><Sample kind={kind} value={value} /></td>
      <td>
        <code className="code">{spec.name}</code>
        {spec.internal && <span className="tag">derived</span>}
      </td>
      <td className="tbl__val">{value || '—'}</td>
      {paper !== undefined && (
        <td className="tbl__ratio">
          {/* A token that measures nearly 1:1 against cream is a ground,
              not an ink — grading it as failing text would be noise. */}
          {!ratio ? <span className="tbl__def">—</span>
            : ratio < 1.5 ? <span className="tbl__def">ground</span>
              : <Ratio value={ratio} />}
        </td>
      )}
      <td>{spec.role}</td>
    </tr>
  );
}

/** Contrast ratio with its WCAG grade, measured live. */
export function Ratio({ value, large = false }: { value: number; large?: boolean }) {
  const aa = value >= (large ? 3 : 4.5);
  const aaa = value >= (large ? 4.5 : 7);
  const grade = aaa ? 'AAA' : aa ? 'AA' : 'fail';
  return (
    <span className={`ratio ratio--${aa ? 'pass' : 'fail'}`}>
      <span className="num">{value.toFixed(2)}</span>
      <span className="ratio__grade">{grade}</span>
    </span>
  );
}

/* ================================================================
   Swatch — a pigment at full size, measured
   ================================================================ */

export function Swatch({
  token, on, label,
}: { token: string; on?: string; label?: string }) {
  const vals = useTokenValues([token, on ?? '--paper']);
  const bg = vals[token] ?? '';
  const fg = vals[on ?? '--paper'] ?? '';
  const ratio = bg && fg ? contrastOf(fg, bg) : null;
  const rgb = parseColor(bg);

  return (
    <div className="swatch">
      <div className="swatch__chip tex-ink" style={{ background: bg, color: fg }}>
        <span className="swatch__hex num">{bg}</span>
        {label && <span className="swatch__label">{label}</span>}
      </div>
      <div className="swatch__meta">
        <code className="code">{token}</code>
        {ratio && <Ratio value={ratio} />}
        {rgb && isNeutral(rgb) && <span className="tag tag--bad">neutral</span>}
      </div>
    </div>
  );
}

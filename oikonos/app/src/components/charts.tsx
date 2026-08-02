import { useId, useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { INK_VAR, INK_HEX, type Ink } from './ui';
import { surface, gentle, reveal } from '../lib/motion';
import { compactINR } from '../lib/format';
import './charts.css';

/* ================================================================
   Riso grain filter — one definition, referenced by every chart
   ================================================================ */

export function GrainDefs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={id} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85"
          numOctaves="3" seed="4" result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="d" />
        <feComponentTransfer in="d" result="g">
          <feFuncA type="linear" slope="0.42" intercept="-0.08" />
        </feComponentTransfer>
        <feComposite in="g" in2="SourceAlpha" operator="in" result="grain" />
        <feBlend in="SourceGraphic" in2="grain" mode="overlay" />
      </filter>
    </defs>
  );
}

/* ================================================================
   Sparkline — net worth trend
   ================================================================ */

function catmullRom(pts: [number, number][], tension = 1): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function Sparkline({
  values, ink = 'ink', width = 320, height = 84, fill = true, dot = true,
}: {
  values: number[]; ink?: Ink; width?: number; height?: number;
  fill?: boolean; dot?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  const { line, area, last } = useMemo(() => {
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const span = hi - lo || 1;
    const padY = 12;
    const padX = 6;   // keeps the end dot's stroke inside the viewBox
    const plotW = width - padX * 2;
    const pts = values.map((v, i) => [
      padX + (i / (values.length - 1)) * plotW,
      height - padY - ((v - lo) / span) * (height - padY * 2),
    ] as [number, number]);
    const line = catmullRom(pts);
    return {
      line,
      area: `${line} L${width - padX},${height} L${padX},${height} Z`,
      last: pts[pts.length - 1],
    };
  }, [values, width, height]);

  const c = INK_HEX[ink];

  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
      fill="none" aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.20" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </linearGradient>
      </defs>

      {fill && (
        <motion.path
          d={area} fill={`url(#sg-${uid})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: inView || reduce ? 1 : 0 }}
          transition={{ ...gentle, delay: 0.35 }}
        />
      )}

      <motion.path
        d={line} stroke={c} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: inView || reduce ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : reveal}
      />

      {dot && (
        <motion.circle
          cx={last[0]} cy={last[1]} r="4" fill={c}
          stroke="var(--paper)" strokeWidth="2.5"
          initial={{ scale: 0 }}
          animate={{ scale: inView || reduce ? 1 : 0 }}
          transition={{ ...surface, delay: 0.7 }}
          style={{ transformOrigin: `${last[0]}px ${last[1]}px` }}
        />
      )}
    </svg>
  );
}

/* ================================================================
   Paired month columns — income vs expenses
   ================================================================ */

export function MonthColumns({
  data, height = 150, labelEvery = 1,
}: {
  data: { label: string; income: number; expenses: number }[];
  height?: number; labelEvery?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const peak = Math.max(...data.flatMap((d) => [d.income, d.expenses])) || 1;

  return (
    <div ref={ref} className="cols" style={{ height: height + 26 }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <GrainDefs id={`cg-${uid}`} />
      </svg>
      {data.map((d, i) => (
        <div key={d.label} className="cols__slot">
          <div className="cols__pair" style={{ height }}>
            {(['income', 'expenses'] as const).map((k) => (
              <motion.span
                key={k}
                className="cols__bar"
                style={{
                  background: k === 'income' ? INK_VAR.olive : INK_VAR.vermilion,
                  transformOrigin: 'bottom',
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: inView || reduce ? Math.max(0.02, d[k] / peak) : 0 }}
                transition={reduce ? { duration: 0 } : { ...surface, delay: 0.05 * i }}
                title={`${d.label} ${k}: ${compactINR(d[k])}`}
              />
            ))}
          </div>
          <span className="cols__label">
            {i % labelEvery === 0 ? d.label : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Ring meter — a budget's month at a glance
   ================================================================ */

export function Ring({
  value, ink = 'olive', size = 56, stroke = 6, children,
}: {
  value: number; ink?: Ink; size?: number; stroke?: number;
  children?: React.ReactNode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));

  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} aria-hidden
        style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--hairline)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={INK_VAR[ink]} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: inView || reduce ? circ * (1 - pct) : circ }}
          transition={reduce ? { duration: 0 } : surface}
        />
      </svg>
      {children && <span className="ring__center">{children}</span>}
    </span>
  );
}

/* ================================================================
   Share bar — one stacked rule showing category proportions
   ================================================================ */

/**
 * Adjacent segments printed in the same ink would read as one block, so a
 * caller can hand each segment an explicit tone. `tintScale` derives that
 * ladder by stepping the ink toward paper.
 */
export function tintScale(ink: Ink, index: number, total: number): string {
  const mix = total <= 1 ? 0 : Math.round((index / (total - 1)) * 42);
  return `color-mix(in oklab, ${INK_VAR[ink]} ${100 - mix}%, var(--paper))`;
}

export function ShareBar({
  parts, height = 12,
}: {
  parts: { id: string; share: number; ink: Ink; color?: string }[];
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className="sharebar" style={{ height }}>
      {parts.map((p, i) => (
        <motion.span
          key={p.id}
          className="sharebar__seg tex-ink"
          style={{ background: p.color ?? INK_VAR[p.ink] }}
          initial={{ flexGrow: 0, opacity: 0 }}
          animate={{
            flexGrow: inView || reduce ? Math.max(0.004, p.share) : 0,
            opacity: inView || reduce ? 1 : 0,
          }}
          transition={reduce ? { duration: 0 } : { ...surface, delay: 0.04 * i }}
        />
      ))}
    </div>
  );
}

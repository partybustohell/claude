import {
  useEffect, useRef, useState, type ReactNode, type CSSProperties,
} from 'react';
import { motion, useInView, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { gentle, snap, surface, easeOutExpo } from '../lib/motion';
import { groupINR } from '../lib/format';
import { CategoryGlyph, ArrowLeft, More } from './icons';
import './ui.css';

type Ink = 'ink' | 'olive' | 'vermilion' | 'paper';

const INK_VAR: Record<Ink, string> = {
  ink: 'var(--ink)', olive: 'var(--olive)',
  vermilion: 'var(--vermilion)', paper: 'var(--paper)',
};
const INK_WASH: Record<Ink, string> = {
  ink: 'var(--ink-wash)', olive: 'var(--olive-wash)',
  vermilion: 'var(--vermilion-wash)', paper: 'var(--paper-deep)',
};

/** Literal values, for SVG attributes where var() does not resolve. */
const INK_HEX: Record<Ink, string> = {
  ink: '#0d3996', olive: '#2e7349',
  vermilion: '#ef422d', paper: '#faf2e1',
};

export { INK_VAR, INK_WASH, INK_HEX };
export type { Ink };

/* ================================================================
   Screen — the scrollable body of a route
   ================================================================ */

export function Screen({
  tone = 'paper', children, className = '', ...rest
}: { tone?: 'paper' | 'ink' | 'olive'; children: ReactNode; className?: string }
  & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const bg = tone === 'paper' ? 'var(--paper)'
    : tone === 'ink' ? 'var(--ink)' : 'var(--olive)';
  return (
    <motion.div
      className={`screen ${tone === 'paper' ? 'tex-paper' : 'tex-ink'} ${className}`}
      style={{ background: bg }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   Eyebrow / section label
   ================================================================ */

export function Eyebrow({
  children, tone, style,
}: { children: ReactNode; tone?: string; style?: CSSProperties }) {
  return (
    <span className="eyebrow" style={{ color: tone ?? 'var(--fg-muted)', ...style }}>
      {children}
    </span>
  );
}

export function SectionHead({
  title, action, onAction, tone = 'var(--fg-muted)',
}: { title: string; action?: string; onAction?: () => void; tone?: string }) {
  return (
    <div className="sectionhead">
      <Eyebrow tone={tone}>{title}</Eyebrow>
      {action && (
        <button className="sectionhead__action eyebrow" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ================================================================
   Buttons
   ================================================================ */

export function Button({
  children, variant = 'primary', ink = 'ink', full, icon, trailing,
  onClick, disabled, style, className = '',
}: {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'outline' | 'quiet';
  ink?: Ink;
  full?: boolean;
  icon?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const solid = variant === 'primary';
  const bg = solid ? INK_VAR[ink] : variant === 'quiet' ? INK_WASH[ink] : 'transparent';
  const fg = solid
    ? (ink === 'paper' ? 'var(--ink)' : 'var(--on-ink)')
    : INK_VAR[ink];

  return (
    <motion.button
      className={`btn btn--${variant} ${full ? 'btn--full' : ''} ${className}`}
      style={{
        background: bg,
        color: fg,
        borderColor: variant === 'outline' ? INK_VAR[ink] : 'transparent',
        boxShadow: solid
          ? (ink === 'vermilion' ? 'var(--sh-red)' : ink === 'paper' ? 'var(--sh-2)' : 'var(--sh-ink)')
          : 'none',
        ...style,
      }}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.975, y: 1 }}
      whileHover={disabled ? undefined : { y: -1 }}
      transition={snap}
    >
      {solid && <span className="btn__grain" aria-hidden />}
      {icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
      {trailing && <span className="btn__trailing">{trailing}</span>}
    </motion.button>
  );
}

/** Circular icon button used in top bars. */
export function IconButton({
  children, onClick, tone = 'var(--ink)', bordered = true, label,
}: { children: ReactNode; onClick?: () => void; tone?: string; bordered?: boolean; label: string }) {
  return (
    <motion.button
      className="iconbtn"
      aria-label={label}
      onClick={onClick}
      style={{ color: tone, borderColor: bordered ? 'currentColor' : 'transparent' }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={snap}
    >
      {children}
    </motion.button>
  );
}

/* ================================================================
   Top bar
   ================================================================ */

export function TopBar({
  onBack, title, tone = 'var(--ink)', right, sticky,
}: {
  onBack?: () => void; title?: string; tone?: string;
  right?: ReactNode; sticky?: boolean;
}) {
  return (
    <div className={`topbar ${sticky ? 'topbar--sticky' : ''}`} style={{ color: tone }}>
      {onBack ? (
        <motion.button className="topbar__btn" onClick={onBack} aria-label="Back"
          whileTap={{ scale: 0.88, x: -2 }} transition={snap}>
          <ArrowLeft size={22} />
        </motion.button>
      ) : <span className="topbar__btn" />}
      {title && <span className="topbar__title display">{title}</span>}
      {right ?? (
        <motion.button className="topbar__btn topbar__btn--end" aria-label="More"
          whileTap={{ scale: 0.88 }} transition={snap}>
          <More size={22} />
        </motion.button>
      )}
    </div>
  );
}

/* ================================================================
   Card
   ================================================================ */

export function Card({
  children, tone = 'paper', pad = 20, radius = 'var(--r-lg)',
  elevation = 2, className = '', style, onClick,
}: {
  children: ReactNode; tone?: Ink | 'warm'; pad?: number; radius?: string;
  elevation?: 0 | 1 | 2 | 3 | 4; className?: string;
  style?: CSSProperties; onClick?: () => void;
}) {
  const bg = tone === 'warm' ? 'var(--paper-warm)'
    : tone === 'paper' ? 'var(--paper)' : INK_VAR[tone as Ink];
  const dark = tone === 'ink' || tone === 'olive' || tone === 'vermilion';
  const Comp = onClick ? motion.button : motion.div;
  return (
    <Comp
      className={`card ${dark ? 'tex-ink' : 'tex-card'} ${onClick ? 'card--tap' : ''} ${className}`}
      style={{
        background: bg,
        padding: pad,
        borderRadius: radius,
        boxShadow: elevation === 0 ? 'none' : `var(--sh-${elevation})`,
        color: dark ? 'var(--on-ink)' : 'var(--ink)',
        ...style,
      }}
      onClick={onClick}
      {...(onClick ? { whileTap: { scale: 0.985 }, transition: snap } : {})}
    >
      {children}
    </Comp>
  );
}

/* ================================================================
   Category medallion
   ================================================================ */

export function CategoryBadge({
  icon, ink = 'olive', size = 44, onDark = false,
}: { icon: string; ink?: Ink; size?: number; onDark?: boolean }) {
  return (
    <span
      className="badge tex-ink"
      style={{
        width: size, height: size,
        background: INK_VAR[ink],
        color: 'var(--on-ink)',
        boxShadow: onDark
          ? 'inset 0 0 0 1px rgba(255,255,255,0.14)'
          : '0 2px 5px rgba(48,36,12,0.14)',
      }}
    >
      <CategoryGlyph icon={icon} size={Math.round(size * 0.46)} />
    </span>
  );
}

/* ================================================================
   Progress bar — the system's signature meter
   ================================================================ */

export function Meter({
  value, ink = 'olive', track, height = 8, delay = 0, showThumb = false, radius,
}: {
  value: number; ink?: Ink; track?: string; height?: number;
  delay?: number; showThumb?: boolean; radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(1, value));
  const r = radius ?? height / 2;

  return (
    <div
      ref={ref}
      className="meter"
      /* A translucent cobalt track desaturates to neutral grey over cream,
         which this palette does not permit. The default track is warm
         paper; callers on a saturated field pass their own. */
      style={{ height, borderRadius: r, background: track ?? 'var(--paper-deep)' }}
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.span
        className="meter__fill tex-ink"
        style={{ background: INK_VAR[ink], borderRadius: r }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView || reduce ? pct : 0 }}
        transition={reduce ? { duration: 0 } : { ...surface, delay }}
      />
      {showThumb && (
        <motion.span
          className="meter__thumb"
          style={{ background: INK_VAR[ink], height: height + 8, width: height + 8 }}
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: `${(inView ? pct : 0) * 100}%`, opacity: inView ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { ...surface, delay }}
        />
      )}
    </div>
  );
}

/* ================================================================
   Odometer — figures that count up on reveal
   ================================================================ */

export function Amount({
  value, prefix = '₹', sign, className = '', style, duration = 1500, animate = true,
}: {
  value: number; prefix?: string; sign?: boolean;
  className?: string; style?: CSSProperties; duration?: number; animate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(animate && !reduce ? 0 : Math.abs(value));

  useEffect(() => {
    if (!animate || reduce) { setShown(Math.abs(value)); return; }
    if (!inView) return;
    const target = Math.abs(value);
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setShown(target * easeOutExpo(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, animate, reduce]);

  const neg = value < 0;
  const body = groupINR(Math.round(shown));
  return (
    <span ref={ref} className={`figure ${className}`} style={style}>
      {(sign ?? neg) && (neg ? '−' : '+')}{prefix}{body}
    </span>
  );
}

/* ================================================================
   Delta chip — "↑ 12.4% vs last month"
   ================================================================ */

export function Delta({
  value, suffix, size = 13,
}: { value: number; suffix?: string; size?: number }) {
  const up = value >= 0;
  const color = up ? 'var(--olive)' : 'var(--vermilion)';
  return (
    <span className="delta" style={{ color, fontSize: size }}>
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d={up ? 'M6 10V2M6 2 2.4 5.6M6 2l3.6 3.6' : 'M6 2v8M6 10l-3.6-3.6M6 10l3.6-3.6'}
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="num" style={{ fontWeight: 700 }}>
        {Math.abs(value).toFixed(1)}%
      </span>
      {suffix && <span className="delta__suffix">{suffix}</span>}
    </span>
  );
}

/* ================================================================
   Hairline divider — a printed rule, not a border
   ================================================================ */

export function Rule({ tone, inset = 0, style }: { tone?: string; inset?: number; style?: CSSProperties }) {
  return (
    <div
      className="rule"
      style={{
        marginLeft: inset, background: tone ?? 'var(--hairline)', ...style,
      }}
      aria-hidden
    />
  );
}

/* ================================================================
   Stagger helpers
   ================================================================ */

export function Stack({
  children, gap = 16, className = '', style, delay = 0,
}: { children: ReactNode; gap?: number; className?: string; style?: CSSProperties; delay?: number }) {
  return (
    <motion.div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap, ...style }}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function Rise({
  children, className = '', style, y = 16,
}: { children: ReactNode; className?: string; style?: CSSProperties; y?: number }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: gentle },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   Empty state
   ================================================================ */

export function Empty({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="empty">
      {icon && <div className="empty__icon">{icon}</div>}
      <p className="display empty__title">{title}</p>
      <p className="empty__body">{body}</p>
    </div>
  );
}

import type { ReactNode } from 'react';
import './PhoneFrame.css';

/**
 * The physical device. Titanium rail with a specular sweep, a real
 * bezel gap, and a screen that clips its own content. Rendered once,
 * around the whole app.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <div className="stage__vignette" aria-hidden />
      <div className="device">
        <div className="device__rail" aria-hidden />
        <div className="device__sheen" aria-hidden />
        {/* side hardware */}
        <span className="device__btn device__btn--silence" aria-hidden />
        <span className="device__btn device__btn--up" aria-hidden />
        <span className="device__btn device__btn--down" aria-hidden />
        <span className="device__btn device__btn--power" aria-hidden />

        <div className="device__screen">
          {children}
          <div className="device__glass" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** Dynamic-island-era status bar, drawn not faked. */
export function StatusBar({ tone = 'ink' }: { tone?: 'ink' | 'paper' }) {
  const c = tone === 'paper' ? 'var(--on-ink)' : 'var(--ink)';
  return (
    <div className="statusbar" style={{ color: c }}>
      <span className="statusbar__time num">9:41</span>
      <div className="island" aria-hidden>
        <span className="island__cam" />
      </div>
      <div className="statusbar__right" aria-hidden>
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={8 - i * 2.4} width="3" height={4 + i * 2.4}
              rx="1" fill="currentColor" opacity={i === 3 ? 0.36 : 1} />
          ))}
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M1 4.1a10.6 10.6 0 0 1 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.6 6.9a6.8 6.8 0 0 1 8.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6.2 9.6a3 3 0 0 1 3.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2"
            stroke="currentColor" strokeOpacity="0.42" strokeWidth="1.1" />
          <rect x="2.2" y="2.2" width="17.8" height="7.6" rx="2" fill="currentColor" />
          <path d="M23.2 4.2v3.6c.9-.3 1.4-.9 1.4-1.8s-.5-1.5-1.4-1.8Z" fill="currentColor" fillOpacity="0.42" />
        </svg>
      </div>
    </div>
  );
}

/** The home indicator at the bottom of the screen. */
export function HomeIndicator({ tone = 'ink' }: { tone?: 'ink' | 'paper' }) {
  return (
    <div className="home-indicator" aria-hidden>
      <span style={{
        background: tone === 'paper' ? 'rgba(253,248,236,0.62)' : 'rgba(13,57,150,0.34)',
      }} />
    </div>
  );
}

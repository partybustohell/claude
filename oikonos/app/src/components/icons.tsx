/**
 * Icon set — drawn on a 24-unit grid with a 1.7 stroke so they sit
 * at the same optical weight as Inter 600. Geometric, single-weight,
 * open terminals: the same hand as the illustrations.
 */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function S({ size = 24, children, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  );
}

/* ---- Navigation ---- */
export const ArrowLeft = (p: P) => (
  <S {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></S>
);
export const ArrowRight = (p: P) => (
  <S {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></S>
);
export const ArrowUp = (p: P) => (
  <S {...p}><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></S>
);
export const ArrowDown = (p: P) => (
  <S {...p}><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></S>
);
export const ChevronRight = (p: P) => (<S {...p}><path d="m9 5 7 7-7 7" /></S>);
export const ChevronDown = (p: P) => (<S {...p}><path d="m5 9 7 7 7-7" /></S>);
export const Close = (p: P) => (<S {...p}><path d="M6 6l12 12M18 6 6 18" /></S>);
export const More = (p: P) => (
  <S {...p} strokeWidth="2.2">
    <path d="M5 12h.01" /><path d="M12 12h.01" /><path d="M19 12h.01" />
  </S>
);
export const Plus = (p: P) => (<S {...p}><path d="M12 5v14M5 12h14" /></S>);
export const Check = (p: P) => (<S {...p}><path d="m4 12.5 5 5L20 6.5" /></S>);
export const Search = (p: P) => (
  <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></S>
);
export const Pencil = (p: P) => (
  <S {...p}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14.5 6 3 3" />
  </S>
);
export const Filter = (p: P) => (
  <S {...p}><path d="M3 6h18M6 12h12M10 18h4" /></S>
);

/* ---- Account ---- */
export const IcEye = (p: P) => (
  <S {...p}>
    <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.9" />
  </S>
);
export const IcEyeOff = (p: P) => (
  <S {...p}>
    <path d="M4 5.5 20 18.5" />
    <path d="M9.6 7.1A9.6 9.6 0 0 1 12 6c5.9 0 9.5 6 9.5 6a17 17 0 0 1-3 3.4" />
    <path d="M17.2 16.6A9.7 9.7 0 0 1 12 18c-5.9 0-9.5-6-9.5-6a17.3 17.3 0 0 1 4.2-4.4" />
    <path d="M10 10.2a2.9 2.9 0 0 0 4 4.1" />
  </S>
);
/** A closed padlock — the shackle sits high enough to read at 17px. */
export const IcLock = (p: P) => (
  <S {...p}>
    <rect x="4.6" y="10.4" width="14.8" height="9.6" rx="2.4" />
    <path d="M8.3 10.4V7.9a3.7 3.7 0 0 1 7.4 0v2.5" />
    <path d="M12 14.2v2.2" />
  </S>
);
export const IcMail = (p: P) => (
  <S {...p}>
    <rect x="3" y="5.4" width="18" height="13.2" rx="2.4" />
    <path d="m3.8 7.2 7.1 5.2a1.9 1.9 0 0 0 2.2 0l7.1-5.2" />
  </S>
);
export const IcExit = (p: P) => (
  <S {...p}>
    <path d="M14.5 4.5h3.4A1.6 1.6 0 0 1 19.5 6.1v11.8a1.6 1.6 0 0 1-1.6 1.6h-3.4" />
    <path d="M11 8.2 14.8 12 11 15.8" />
    <path d="M14.4 12H4.5" />
  </S>
);

/* ---- Tab bar ---- */
export const TabHome = ({ active, ...p }: P & { active?: boolean }) => (
  <S {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z"
      fill={active ? 'currentColor' : 'none'} />
    <path d="M9.5 20.5v-6h5v6" stroke={active ? 'var(--paper)' : 'currentColor'} />
  </S>
);
export const TabActivity = ({ active, ...p }: P & { active?: boolean }) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" fill={active ? 'currentColor' : 'none'} />
    <path d="M7.5 14h9M9.5 10.5h5" stroke={active ? 'var(--paper)' : 'currentColor'} />
    <path d="M12 8.5v2M12 14v1.6" stroke={active ? 'var(--paper)' : 'currentColor'} />
  </S>
);
export const TabBudgets = ({ active, ...p }: P & { active?: boolean }) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" fill={active ? 'currentColor' : 'none'} />
    <path d="M12 6.4V12l3.8 2.4" stroke={active ? 'var(--paper)' : 'currentColor'} />
  </S>
);
export const TabGoals = ({ active, ...p }: P & { active?: boolean }) => (
  <S {...p}>
    <path d="M6 21V4" />
    <path d="M6 4.5h10.5l-2 3.6 2 3.6H6" fill={active ? 'currentColor' : 'none'} />
  </S>
);

/* ---- Category glyphs ---- */
export const IcBag = (p: P) => (
  <S {...p}>
    <path d="M5.5 8h13l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H8a1.5 1.5 0 0 1-1.5-1.4L5.5 8Z" />
    <path d="M9 9V6.6a3 3 0 0 1 6 0V9" />
  </S>
);
export const IcBasket = (p: P) => (
  <S {...p}>
    <path d="M4 9.5h16l-1.6 9A1.6 1.6 0 0 1 16.8 20H7.2a1.6 1.6 0 0 1-1.6-1.5L4 9.5Z" />
    <path d="m8.5 9.5 2-5M15.5 9.5l-2-5" /><path d="M10 13v3.5M14 13v3.5" />
  </S>
);
export const IcWheel = (p: P) => (
  <S {...p}>
    <path d="M3 15.5h18M5 15.5l1.8-5.2A2.4 2.4 0 0 1 9.1 8.6h5.8a2.4 2.4 0 0 1 2.3 1.7L19 15.5" />
    <path d="M4.5 15.5v2.6M19.5 15.5v2.6" /><circle cx="7.6" cy="15.4" r="1.5" /><circle cx="16.4" cy="15.4" r="1.5" />
  </S>
);
export const IcHouse = (p: P) => (
  <S {...p}><path d="M4 10.8 12 4.5l8 6.3V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19v-8.2Z" />
    <path d="M9.6 20.4V14h4.8v6.4" /></S>
);
export const IcTag = (p: P) => (
  <S {...p}>
    <path d="M11.4 3.6H20v8.6l-8.2 8.2a1.6 1.6 0 0 1-2.3 0l-6.3-6.3a1.6 1.6 0 0 1 0-2.3l8.2-8.2Z" />
    <circle cx="16.2" cy="7.8" r="1.5" />
  </S>
);
export const IcLeaf = (p: P) => (
  <S {...p}>
    <path d="M20 4.5c0 8.4-4.3 12.6-9.5 12.6A5.6 5.6 0 0 1 5 11.5C5 6.9 10.3 4.5 20 4.5Z" />
    <path d="M4.5 20c3.6-4.7 7.6-8 12-10.2" />
  </S>
);
export const IcSail = (p: P) => (
  <S {...p}>
    <path d="M12 3.4 5.5 15.5H12V3.4Z" /><path d="M13.6 7.8 18.5 15.5h-4.9" />
    <path d="M3.4 18.4c1.5.9 2.6.9 4.1 0s2.6-.9 4.1 0 2.6.9 4.1 0 2.6-.9 4.1 0" />
  </S>
);
export const IcBolt = (p: P) => (
  <S {...p}><path d="M13.4 3 5.6 13.4h5.2L10.2 21l7.8-10.4h-5.2L13.4 3Z" /></S>
);
export const IcTicket = (p: P) => (
  <S {...p}>
    <path d="M4 8.4A1.4 1.4 0 0 1 5.4 7h13.2A1.4 1.4 0 0 1 20 8.4v2a2 2 0 0 0 0 3.2v2A1.4 1.4 0 0 1 18.6 17H5.4A1.4 1.4 0 0 1 4 15.6v-2a2 2 0 0 0 0-3.2v-2Z" />
    <path d="M13 7v1.6M13 11.2v1.6M13 15.4V17" />
  </S>
);
export const IcBook = (p: P) => (
  <S {...p}>
    <path d="M4.5 5.2A1.2 1.2 0 0 1 5.7 4h4.1A2.2 2.2 0 0 1 12 6.2v13a2 2 0 0 0-2-1.6H4.5V5.2Z" />
    <path d="M19.5 5.2A1.2 1.2 0 0 0 18.3 4h-4.1A2.2 2.2 0 0 0 12 6.2v13a2 2 0 0 1 2-1.6h5.5V5.2Z" />
  </S>
);
export const IcRise = (p: P) => (
  <S {...p}><path d="M4 16.5 9.6 10l3.6 3.4L20 6.5" /><path d="M15.4 6.5H20V11" /></S>
);
export const IcFall = (p: P) => (
  <S {...p}><path d="M4 7.5 9.6 14l3.6-3.4L20 17.5" /><path d="M15.4 17.5H20V13" /></S>
);
export const IcSwap = (p: P) => (
  <S {...p}>
    <path d="M4 8.5h13" /><path d="m14 5.2 3.3 3.3L14 11.8" />
    <path d="M20 15.5H7" /><path d="m10 12.2-3.3 3.3L10 18.8" />
  </S>
);
export const IcCoin = (p: P) => (
  <S {...p}>
    <ellipse cx="12" cy="7.5" rx="7" ry="3" /><path d="M5 7.5v9c0 1.7 3.1 3 7 3s7-1.3 7-3v-9" />
    <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
  </S>
);
export const IcUser = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="9.2" r="3.6" />
    <path d="M5.4 20a6.8 6.8 0 0 1 13.2 0" />
  </S>
);
export const IcFlag = (p: P) => (
  <S {...p}><path d="M6 21V4" /><path d="M6 4.5h11l-2.2 3.8L17 12H6" /></S>
);
export const IcRepeat = (p: P) => (
  <S {...p}>
    <path d="M4.5 11a7.5 7.5 0 0 1 12.8-5.3l2.2 2.1" /><path d="M19.5 3.6v4.2h-4.2" />
    <path d="M19.5 13a7.5 7.5 0 0 1-12.8 5.3l-2.2-2.1" /><path d="M4.5 20.4v-4.2h4.2" />
  </S>
);
export const IcCard = (p: P) => (
  <S {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.4" /><path d="M3 10h18" />
    <path d="M6.5 14.6h3.2" />
  </S>
);
export const IcBank = (p: P) => (
  <S {...p}>
    <path d="M3.5 9.5 12 4.5l8.5 5" /><path d="M5.5 9.5v8M10 9.5v8M14 9.5v8M18.5 9.5v8" />
    <path d="M3.5 20.5h17" />
  </S>
);
export const IcWallet = (p: P) => (
  <S {...p}>
    <path d="M3.5 7.6A2 2 0 0 1 5.5 5.6h11a2 2 0 0 1 2 2v1.4" />
    <rect x="3.5" y="7.6" width="17" height="11.8" rx="2.2" />
    <path d="M16.5 13.5h.01" />
  </S>
);
export const IcSpark = (p: P) => (
  <S {...p}>
    <path d="M12 3.5c.6 4 1.9 5.4 5.9 6-4 .6-5.3 2-5.9 6-.6-4-1.9-5.4-5.9-6 4-.6 5.3-2 5.9-6Z" />
  </S>
);

const CATEGORY_ICONS: Record<string, (p: P) => React.ReactElement> = {
  bag: IcBag, basket: IcBasket, wheel: IcWheel, house: IcHouse, tag: IcTag,
  leaf: IcLeaf, sail: IcSail, bolt: IcBolt, ticket: IcTicket, book: IcBook,
  rise: IcRise, swap: IcSwap, coin: IcCoin,
};

export function CategoryGlyph({ icon, size = 20, ...rest }: P & { icon: string }) {
  const C = CATEGORY_ICONS[icon] ?? IcCoin;
  return <C size={size} {...rest} />;
}

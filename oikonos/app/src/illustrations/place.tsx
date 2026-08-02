/**
 * PLACEMENT
 * ============================================================
 * Which plate a screen carries, and where it sits.
 *
 * The four hero screens each own a bespoke drawing. The other
 * thirty-eight share a world: nine plates, cropped into. That is how an
 * illustrated product actually works — you do not draw thirty-eight
 * unrelated pictures, you build one place and look at it from different
 * corners, so a hillside on the goals screen is the same hillside the
 * chapel stands on.
 *
 * The mapping is deliberate, not decorative. Accounts are vessels, so
 * the accounts cluster gets the harbour. An envelope is a jar, so the
 * budgets cluster gets the store room. A subscription is a mill that
 * turns whether or not you looked at it. A category is a tessera. The
 * app screens get the colophon, because the subject there is Oikonos
 * itself and the honest picture of that is ink hitting paper.
 *
 * WEIGHT is the other half of the decision and it is not a detail. A
 * dense ledger gets a FOOT plate — the drawing waits at the end of the
 * scroll, where it cannot fight a single number. A screen with a hero
 * region and room to breathe gets a BAND. A screen with neither gets
 * nothing, and there are none of those left.
 */
import type { ReactElement } from 'react';
import { Harbour } from './Harbour';
import { Amphorae } from './Amphorae';
import { Ascent } from './Ascent';
import { Windmill } from './Windmill';
import { Mosaic } from './Mosaic';
import { Lighthouse } from './Lighthouse';
import { Shopfront } from './Shopfront';
import { Colophon } from './Colophon';
import './place.css';

export const PLATES = {
  harbour: Harbour,
  amphorae: Amphorae,
  ascent: Ascent,
  windmill: Windmill,
  mosaic: Mosaic,
  lighthouse: Lighthouse,
  shopfront: Shopfront,
  colophon: Colophon,
} as const;

export type PlateName = keyof typeof PLATES;

/**
 * The plate at the end of a scroll.
 *
 * `height` crops the plate rather than scaling it — the drawing keeps
 * its own proportions and the screen decides how much of it to show,
 * which is what lets one harbour serve a screen with 40px to spare and
 * a screen with 200.
 */
export function PlateFoot({
  plate, height = 200, flush = false, tone = 'paper', label,
}: {
  plate: PlateName;
  height?: number;
  flush?: boolean;
  tone?: 'paper' | 'ink';
  label?: string;
}): ReactElement {
  const P = PLATES[plate];
  return (
    <div
      className={`plate-foot ${flush ? 'plate-foot--flush' : ''} ${tone === 'ink' ? 'plate-foot--ink' : ''}`}
      style={{ height }}
      aria-hidden={label ? undefined : true}
    >
      <div className="plate-foot__crop">
        <P className="plate-foot__art" />
      </div>
    </div>
  );
}

/** The plate as a band inside a hero region the screen has laid out. */
export function PlateBand({
  plate, height = 210, style,
}: {
  plate: PlateName;
  height?: number;
  style?: React.CSSProperties;
}): ReactElement {
  const P = PLATES[plate];
  return (
    <div className="plate-band" style={{ height, ...style }} aria-hidden>
      <div className="plate-foot__crop">
        <P className="plate-foot__art" />
      </div>
    </div>
  );
}

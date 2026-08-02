/**
 * PLATE PROOF
 *
 * A press proof: one plate, alone, on the stock it will print on, at
 * the size it will print at. Judging a drawing through the screen it
 * eventually lands in means judging it past a headline and a card, and
 * the drawing is not what you end up looking at.
 *
 * Reached only by the capture harness — `?plate=harbour&ground=paper`.
 * It is not a route and nothing in the app links to it.
 *
 * The stock carries the same tex-paper / tex-ink overlay a real screen
 * does. It did not, and round three's critics judged the plates on bare
 * untextured cream — "noise dusted over a flat vector lattice", "the
 * cream ground stays smooth, so it is noise on artwork, not ink on
 * paper". They were describing the harness as much as the drawing: on a
 * real screen the tooth runs across plate and paper alike, and a proof
 * that omits it is not a proof of what ships.
 */
import { Harbour } from './Harbour';
import { Amphorae } from './Amphorae';
import { Ascent } from './Ascent';
import { Windmill } from './Windmill';
import { Mosaic } from './Mosaic';
import { Lighthouse } from './Lighthouse';
import { Shopfront } from './Shopfront';
import { Colophon } from './Colophon';
import { Santorini } from './Santorini';
import { OliveGrove } from './OliveGrove';
import { HomeHorizon } from './HomeHorizon';
import { WelcomeCliff } from './WelcomeCliff';
import { TxnCafeTable } from './TxnCafeTable';
import { GoalAcropolis } from './GoalAcropolis';
import './proof.css';

export const PLATES: Record<string, (p: { className?: string }) => React.ReactElement> = {
  harbour: Harbour,
  amphorae: Amphorae,
  ascent: Ascent,
  windmill: Windmill,
  mosaic: Mosaic,
  lighthouse: Lighthouse,
  shopfront: Shopfront,
  colophon: Colophon,
  santorini: Santorini,
  olivegrove: OliveGrove,
  horizon: HomeHorizon,
  cliff: WelcomeCliff,
  cafe: TxnCafeTable,
  acropolis: GoalAcropolis,
};

export function Proof({ name, ground }: { name: string; ground: string }) {
  const P = PLATES[name];
  return (
    <div className={`proof proof--${ground} ${ground === 'paper' ? 'tex-paper' : 'tex-ink'}`}>
      {P ? <P className="proof__plate" /> : (
        <p className="proof__missing">no plate named “{name}”</p>
      )}
    </div>
  );
}

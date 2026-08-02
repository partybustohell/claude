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
    <div className={`proof proof--${ground}`}>
      {P ? <P className="proof__plate" /> : (
        <p className="proof__missing">no plate named “{name}”</p>
      )}
    </div>
  );
}

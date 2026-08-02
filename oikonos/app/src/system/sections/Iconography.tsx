import type { ReactElement } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChevronRight, ChevronDown,
  Close, More, Plus, Check, Search, Pencil, Filter,
  TabHome, TabActivity, TabBudgets, TabGoals,
  IcBag, IcBasket, IcWheel, IcHouse, IcTag, IcLeaf, IcSail, IcBolt,
  IcTicket, IcBook, IcRise, IcFall, IcSwap, IcCoin, IcUser, IcFlag,
  IcRepeat, IcCard, IcBank, IcWallet, IcSpark,
} from '../../components/icons';
import { CategoryBadge } from '../../components/ui';
import { Chapter, Code, Do, DoDont, Dont, Note, Specimen, Sub } from '../kit';

/** Components rather than elements, so the grid owns rendering and keys. */
type IconComp = (p: { size?: number; active?: boolean }) => ReactElement;
type Entry = [string, IconComp];

const NAVIGATION: Entry[] = [
  ['ArrowLeft', ArrowLeft], ['ArrowRight', ArrowRight],
  ['ArrowUp', ArrowUp], ['ArrowDown', ArrowDown],
  ['ChevronRight', ChevronRight], ['ChevronDown', ChevronDown],
  ['Close', Close], ['More', More],
];

const ACTIONS: Entry[] = [
  ['Plus', Plus], ['Check', Check], ['Search', Search],
  ['Pencil', Pencil], ['Filter', Filter],
];

const TABS: Entry[] = [
  ['TabHome', TabHome], ['TabActivity', TabActivity],
  ['TabBudgets', TabBudgets], ['TabGoals', TabGoals],
];

const SUBJECTS: Entry[] = [
  ['IcBag', IcBag], ['IcBasket', IcBasket], ['IcWheel', IcWheel],
  ['IcHouse', IcHouse], ['IcTag', IcTag], ['IcLeaf', IcLeaf],
  ['IcSail', IcSail], ['IcBolt', IcBolt], ['IcTicket', IcTicket],
  ['IcBook', IcBook], ['IcRise', IcRise], ['IcFall', IcFall],
  ['IcSwap', IcSwap], ['IcCoin', IcCoin], ['IcUser', IcUser],
  ['IcFlag', IcFlag], ['IcRepeat', IcRepeat], ['IcCard', IcCard],
  ['IcBank', IcBank], ['IcWallet', IcWallet], ['IcSpark', IcSpark],
];

/** Keys accepted by CategoryGlyph — anything else falls back to a coin. */
const GLYPH_KEYS = [
  'bag', 'basket', 'wheel', 'house', 'tag', 'leaf',
  'sail', 'bolt', 'ticket', 'book', 'rise', 'swap', 'coin',
];

function IconGrid({ entries, active }: { entries: Entry[]; active?: boolean }) {
  return (
    <div className="icongrid">
      {entries.map(([name, Icon]) => (
        <div className="iconcell" key={name}>
          <Icon active={active} />
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}

export function Iconography() {
  return (
    <Chapter
      id="icons"
      title="Iconography"
      lede={
        <>
          One set, drawn on a 24-unit grid with a 1.7 stroke so the icons sit
          at the same optical weight as Inter 600 beside them. Geometric,
          single-weight, open terminals — the same hand as the illustrations,
          scaled down.
        </>
      }
    >
      <Sub title="Navigation">
        <Specimen ground="paper" pad={12}><IconGrid entries={NAVIGATION} /></Specimen>
      </Sub>

      <Sub title="Actions">
        <Specimen ground="paper" pad={12}><IconGrid entries={ACTIONS} /></Specimen>
      </Sub>

      <Sub
        title="Tabs"
        note="Tab icons take an active prop and fill rather than change weight, so the row keeps its rhythm when the selection moves."
      >
        <Specimen ground="paper" label="Inactive above, active below" pad={12}>
          <IconGrid entries={TABS} />
          <IconGrid entries={TABS} active />
        </Specimen>
      </Sub>

      <Sub title="Subjects">
        <Specimen ground="paper" pad={12}><IconGrid entries={SUBJECTS} /></Specimen>
      </Sub>

      <Sub
        title="Category medallions"
        note="A category is never drawn as a loose icon in a list. It is a filled medallion — CategoryBadge — so a row scans as a series of stamps rather than a series of outlines."
      >
        <Specimen ground="paper" pad={24}>
          <div className="rowline">
            {GLYPH_KEYS.map((k, i) => (
              <CategoryBadge
                key={k}
                icon={k}
                ink={(['olive', 'ink', 'vermilion'] as const)[i % 3]}
              />
            ))}
          </div>
        </Specimen>
        <Note kind="rule">
          <p>
            Medallions carry <Code>tex-ink</Code> like any other saturated
            field, and take their glyph through <Code>CategoryGlyph</Code>,
            which falls back to a coin for an unknown key rather than
            rendering nothing.
          </p>
        </Note>
      </Sub>

      <Sub title="Rules">
        <DoDont>
          <Do>
            Size icons from the type they sit beside — 17px against a row
            title, 22px in a top bar, 24px standing alone.
          </Do>
          <Dont>
            Change the stroke weight to make an icon read at a new size. Draw
            it on the 24-unit grid and scale the whole thing.
          </Dont>
          <Do>
            Give every icon-only control a name — <Code>IconButton</Code>{' '}
            requires a <Code>label</Code> prop for exactly this reason.
          </Do>
          <Dont>
            Introduce an icon from another library. A different hand next to
            this one is visible immediately, even at 17px.
          </Dont>
        </DoDont>
      </Sub>
    </Chapter>
  );
}

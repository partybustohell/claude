import { DEVICE, ELEVATION, RADII, SPACE, TEXTURE } from '../tokens';
import {
  Chapter, Code, Do, DoDont, Dont, Note, Snippet, Specimen, Sub, TokenTable, useTokenValues,
} from '../kit';

function SpaceRuler() {
  const vals = useTokenValues(SPACE.tokens.map((t) => t.name));
  return (
    <div className="ruler">
      {SPACE.tokens.map((t) => {
        const px = parseFloat(vals[t.name] ?? '0');
        return (
          <div className="ruler__row" key={t.name}>
            <span className="ruler__name">{t.name}</span>
            <span className="ruler__bar" style={{ width: Number.isNaN(px) ? 0 : px }} />
            <span className="tbl__def">{vals[t.name]}</span>
          </div>
        );
      })}
    </div>
  );
}

function RadiiPlate() {
  const vals = useTokenValues(RADII.tokens.map((t) => t.name));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--s-4)' }}>
      {RADII.tokens.map((t) => (
        <div key={t.name} className="radchip" style={{ borderRadius: `var(${t.name})` }}>
          {t.name.replace('--r-', '')} · {vals[t.name]}
        </div>
      ))}
    </div>
  );
}

function ElevationPlate() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--s-6)' }}>
      {ELEVATION.tokens.map((t) => (
        <div key={t.name} className="elevcard" style={{ boxShadow: `var(${t.name})` }}>
          {t.name.replace('--sh-', '')}
        </div>
      ))}
    </div>
  );
}

/** The screen skeleton every route is poured into. */
function ScreenAnatomy() {
  const vals = useTokenValues(['--safe-top', '--tabbar-h', '--gutter', '--device-w', '--device-h']);
  const band = (label: string, value: string, tone: string, fg: string) => (
    <div
      style={{
        background: tone, color: fg, padding: '10px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 'var(--t-caption)', fontWeight: 600,
      }}
    >
      <span>{label}</span>
      <span className="num" style={{ opacity: 0.75 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 340, borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--sh-2)' }}>
      {band('Safe area', vals['--safe-top'] ?? '', 'var(--ink-wash)', 'var(--ink-deep)')}
      {band('TopBar', 'auto', 'var(--paper-deep)', 'var(--ink)')}
      <div
        style={{
          background: 'var(--paper)', padding: '28px 14px', display: 'grid', gap: 8,
          boxShadow: `inset ${vals['--gutter'] || '24px'} 0 0 -22px var(--vermilion), inset -${vals['--gutter'] || '24px'} 0 0 -22px var(--vermilion)`,
        }}
      >
        <span style={{ fontSize: 'var(--t-caption)', fontWeight: 600, color: 'var(--ink)' }}>
          .pane — the scrolling body
        </span>
        <span style={{ fontSize: 'var(--t-caption)', color: 'var(--fg-muted)', lineHeight: 1.5 }}>
          Side padding {vals['--gutter']}. Bottom padding at least{' '}
          {vals['--tabbar-h']} so the tab bar never crops a row.
        </span>
      </div>
      {band('TabBar', vals['--tabbar-h'] ?? '', 'var(--ink)', 'var(--on-ink)')}
    </div>
  );
}

/* ---------------------------------------------------------------- */

export function Layout() {
  return (
    <Chapter
      id="layout"
      title="Space, shape and surface"
      lede={
        <>
          One 4pt grid, one gutter, one ladder of corner radii and one warm
          elevation scale. The system is drawn for a single 390&nbsp;×&nbsp;844
          canvas, so these values are absolute rather than fluid — a screen
          that needs a new interval is almost always a screen that has skipped
          a step in the rhythm.
        </>
      }
    >
      <Sub title="Space">
        <Specimen ground="paper" pad={24}><SpaceRuler /></Specimen>
        <TokenTable group={SPACE} />
        <Note kind="rule">
          <p>
            Section gaps are 28–32px; intra-section gaps are 12–16px. The
            distance between two sections must always be visibly larger than
            the distance inside one — that difference is the only thing
            telling a reader where a group ends.
          </p>
        </Note>
        <DoDont>
          <Do>
            Break the gutter only with a full-bleed illustration, and let it
            run behind the text rather than under it.
          </Do>
          <Dont>
            Pad a scroll container by less than <Code>--tabbar-h</Code>. A
            half-visible row under the tab bar reads as a rendering fault, not
            as more content.
          </Dont>
        </DoDont>
      </Sub>

      <Sub
        title="Radii"
        note="Radius tracks the size of the shape so curvature stays optically constant from a 24px chip to the device shell."
      >
        <Specimen ground="paper" pad={24}><RadiiPlate /></Specimen>
        <TokenTable group={RADII} />
      </Sub>

      <Sub
        title="Elevation"
        note="Two shadows per level: a tight contact shadow and a wide ambient one. Both are warm brown — a neutral shadow over cream reads as dirt on the print."
      >
        <Specimen ground="paper" pad={32}><ElevationPlate /></Specimen>
        <TokenTable group={ELEVATION} />
        <Note kind="why">
          <p>
            <Code>--sh-ink</Code> and <Code>--sh-red</Code> exist because a
            saturated object casts a shadow tinted by its own ink. A cobalt
            button on brown shadow looks pasted on; on cobalt shadow it looks
            printed.
          </p>
        </Note>
      </Sub>

      <Sub
        title="Texture"
        note="Three tiles, applied by surface type. They are generated seamless — wrap-tiled, blurred, re-cropped — so they never seam at any background-size."
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 'var(--s-4)' }}>
          <div className="texplate tex-paper" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
            .tex-paper
          </div>
          <div className="texplate tex-ink" style={{ background: 'var(--ink)', color: 'var(--on-ink)' }}>
            .tex-ink
          </div>
          <div className="texplate tex-card" style={{ background: 'var(--paper-warm)', color: 'var(--ink)' }}>
            .tex-card
          </div>
          <div className="texplate tex-stipple" style={{ background: 'var(--olive)', color: 'var(--on-olive)' }}>
            .tex-stipple
          </div>
        </div>
        <TokenTable group={TEXTURE} />
        <Note kind="trap">
          <p>
            A textured element needs <Code>position: relative</Code>,{' '}
            <Code>overflow: hidden</Code> and <Code>isolation: isolate</Code>{' '}
            — the utilities paint into <Code>::before</Code> and{' '}
            <Code>::after</Code> with blend modes, and without isolation they
            blend against whatever is behind the element instead of the
            element itself.
          </p>
        </Note>
        <Snippet>
          {`/* A saturated field */
<div className="tex-ink" style={{ background: 'var(--ink)' }} />

/* A raised cream surface */
<Card tone="paper">…</Card>   /* applies tex-card for you */`}
        </Snippet>
      </Sub>

      <Sub
        title="Screen anatomy"
        note="Every route is the same skeleton: safe area, an optional TopBar, a scrolling .pane inside the gutter, and either the tab bar or the home indicator."
      >
        <ScreenAnatomy />
        <TokenTable group={DEVICE} />
        <Note kind="rule">
          <p>
            Screens printed on a saturated field are registered in{' '}
            <Code>DARK_ROUTES</Code>, which flips the status-bar glyphs and
            paints the safe area in the screen's own ink. Skipping that
            registration leaves a cream band above the artwork.
          </p>
        </Note>
      </Sub>
    </Chapter>
  );
}

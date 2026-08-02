import { motion } from 'framer-motion';
import { CATEGORIES } from '../../data/store';
import type { CategoryId } from '../../data/types';
import { CategoryGlyph } from '../../components/icons';
import { INK_VAR } from '../../components/ui';
import { snap } from '../../lib/motion';

/**
 * Category picker cell.
 *
 * An unselected cell is NOT a faded version of a selected one — dimming a
 * coloured disc reads as grey, which this palette does not permit. Instead
 * the unselected state is the ink drawn on paper (glyph only, tinted
 * ring); selecting floods the disc with the ink.
 */
export function CatCell({
  id, on, onSelect, size = 46,
}: { id: CategoryId; on: boolean; onSelect: () => void; size?: number }) {
  const c = CATEGORIES[id];
  const ink = INK_VAR[c.ink];

  return (
    <motion.button
      className={`catcell ${on ? 'catcell--on' : ''}`}
      onClick={onSelect}
      whileTap={{ scale: 0.9 }}
      transition={snap}
      aria-pressed={on}
      aria-label={c.label}
    >
      <motion.span
        className={on ? 'catcell__disc tex-ink' : 'catcell__disc'}
        style={{ width: size, height: size }}
        animate={{
          backgroundColor: on ? ink : 'rgba(0,0,0,0)',
          color: on ? 'var(--on-ink)' : ink,
          boxShadow: on
            ? '0 2px 6px rgba(48,36,12,0.18)'
            : `inset 0 0 0 1.4px ${ink}33`,
          scale: on ? 1 : 0.94,
        }}
        transition={snap}
      >
        <CategoryGlyph icon={c.icon} size={Math.round(size * 0.46)} />
      </motion.span>
      <span className="catcell__label">{c.label.split(' &')[0].split(' ')[0]}</span>
    </motion.button>
  );
}

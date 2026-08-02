/**
 * GOAL SCENES
 * ============================================================
 * A goal carries a `scene` — the cover you pick when you name it. New
 * Goal has offered four of them since the screen was built, and the
 * picker has always worked; the detail screen simply ignored the answer
 * and printed the Acropolis on every goal, so choosing Harbour changed
 * a thumbnail and nothing else.
 *
 * This is the table that makes the choice mean something. `h` is the
 * height the plate is given on the goal screen — it is per-scene because
 * the plates are not all the same shape, and forcing a 250-tall harbour
 * into a 470 box would scale it half again and crop the quay off both
 * sides.
 */
import type { Goal } from '../data/types';
import { GoalAcropolis } from './GoalAcropolis';
import { Santorini } from './Santorini';
import { OliveGrove } from './OliveGrove';
import { Harbour } from './Harbour';

type Scene = Goal['scene'];

export const SCENE_PLATE: Record<Scene, {
  Art: (p: { className?: string }) => React.ReactElement;
  h: number;
}> = {
  acropolis:  { Art: GoalAcropolis, h: 470 },
  santorini:  { Art: Santorini, h: 470 },
  olivegrove: { Art: OliveGrove, h: 470 },
  harbour:    { Art: Harbour, h: 268 },
};

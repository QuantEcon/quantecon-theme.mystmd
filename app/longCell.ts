/**
 * Long-cell tags (PROTOTYPE, QuantEcon/quantecon-theme.mystmd#242): which of a
 * code cell's tags ask for its input or its output to be capped, and how.
 *
 * The lectures cap long cells two ways on the Sphinx theme: `collapse-N` caps
 * the code INPUT at N em behind an Expand / Collapse bar, and `scroll-output`
 * (older spelling `output_scroll`) caps the OUTPUT with a scrollbar. Whether the
 * mystmd theme keeps two mechanisms or one is a policy decision
 * (QuantEcon/project-theme-parity#19); this prototype renders all four
 * combinations so the decision can be taken on a side-by-side:
 *
 *   collapse-N          input  capped at N em, Expand / Collapse bar
 *   scroll-input        input  capped at SCROLL_EMS, scrollbar      (prototype-only)
 *   scroll-output       output capped at SCROLL_EMS, scrollbar
 *   output_scroll       output, as scroll-output
 *   collapse-output-N   output capped at N em, the same bar          (prototype-only)
 *
 * Plain TypeScript with no React, so `node --test` can import it
 * (tests/unit/long-cell.test.mjs).
 */

/** The scroll cap, in em of the code font: the Sphinx theme's `output_scroll` height. */
export const SCROLL_EMS = 24;

export type Cap = { kind: 'collapse'; ems: number } | { kind: 'scroll'; ems: number };

export type LongCellSpec = { input?: Cap; output?: Cap };

const COLLAPSE = /^collapse-(output-)?(\d+)$/;

/**
 * The caps a cell's tags ask for, or `null` when they ask for none. An input
 * and an output cap are independent. Where two tags claim the same side, the
 * first one wins: a cell is authored once and the order is the author's.
 * `collapse-0` and non-numeric heights are ignored rather than collapsing a
 * cell to nothing.
 */
export function longCellSpec(tags: unknown): LongCellSpec | null {
  if (!Array.isArray(tags)) return null;
  const spec: LongCellSpec = {};
  for (const tag of tags) {
    if (typeof tag !== 'string') continue;
    const collapse = COLLAPSE.exec(tag);
    if (collapse) {
      const ems = Number(collapse[2]);
      if (!Number.isFinite(ems) || ems <= 0) continue;
      if (collapse[1]) spec.output ??= { kind: 'collapse', ems };
      else spec.input ??= { kind: 'collapse', ems };
    } else if (tag === 'scroll-input') {
      spec.input ??= { kind: 'scroll', ems: SCROLL_EMS };
    } else if (tag === 'scroll-output' || tag === 'output_scroll') {
      spec.output ??= { kind: 'scroll', ems: SCROLL_EMS };
    }
  }
  return spec.input || spec.output ? spec : null;
}

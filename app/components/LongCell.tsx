/**
 * The Expand / Collapse bar for a long code input or a long output.
 *
 * A code cell's tags can ask for its input or its outputs to be collapsed
 * (app/longCell.ts). The cell's `block` renderer puts the parsed spec in
 * context; the `code` and `outputs` renderers, which run inside it, read the
 * side that concerns them and wrap upstream's element in a CollapseRegion.
 *
 * The region is capped in the server HTML, so a page never shows a tagged
 * cell at full height first. The bar, and the fade that says there is more,
 * appear only while the content is taller than the cap. The server shows them
 * where the line count makes that certain; in the browser the region measures
 * itself, and again whenever it resizes (an image loading, a live-compute
 * run), so a cell that fits at the reader's width shows no bar. Printed, or
 * read without JavaScript, the region is not capped at all
 * (styles/quantecon.css).
 */
import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { capEms } from '../longCell';
import type { LongCellSpec } from '../longCell';

const LongCellContext = createContext<LongCellSpec | null>(null);

export function LongCellProvider({ spec, children }: { spec: LongCellSpec; children: ReactNode }) {
  return <LongCellContext.Provider value={spec}>{children}</LongCellContext.Provider>;
}

/** N of the enclosing cell's collapse tag for this side, if it has one. */
export function useLongCellCap(side: 'input' | 'output'): number | undefined {
  return useContext(LongCellContext)?.[side];
}

const NOUN = { input: 'code', output: 'output' } as const;

/**
 * Collapse `children` to N + 0.5 em behind an Expand / Collapse bar. The
 * provider is reset inside, so a nested code block or output (an embedded
 * cell, say) is not collapsed twice.
 */
export function CollapseRegion({
  n,
  side,
  overflowsInitially,
  children,
}: {
  n: number;
  side: 'input' | 'output';
  /** True only where the server is certain the content overflows the cap. */
  overflowsInitially: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(overflowsInitially);
  const region = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const bodyId = useId();

  useEffect(() => {
    const el = body.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    // The body's own box: it grows while short content grows towards the cap,
    // and shrinks when long content shrinks under it, which is when the answer
    // can change.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded]);

  const toggle = () => {
    const collapsing = expanded;
    setExpanded(!expanded);
    if (!collapsing) return;
    // Collapsing from far down a long cell would leave the reader in the middle
    // of whatever follows it. Bring the end of the region back into view.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() =>
      region.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }),
    );
  };

  return (
    <div
      ref={region}
      className={`qe-collapse qe-collapse--${side}`}
      data-expanded={expanded}
      data-overflows={overflows}
      style={{ '--qe-collapse-cap': `${capEms(n)}em` } as CSSProperties}
    >
      <div ref={body} id={bodyId} className="qe-collapse__body">
        <LongCellContext.Provider value={null}>{children}</LongCellContext.Provider>
      </div>
      {overflows && (
        <button
          type="button"
          className="qe-collapse__bar"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={toggle}
        >
          {expanded ? 'Collapse' : 'Expand'}
          <span className="sr-only"> {NOUN[side]}</span>
        </button>
      )}
    </div>
  );
}

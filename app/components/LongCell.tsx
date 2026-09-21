/**
 * Long code inputs and long outputs (PROTOTYPE, QuantEcon/quantecon-theme.mystmd#242).
 *
 * A code cell's tags can ask for its input or its output to be capped
 * (app/longCell.ts). The cell's `block` renderer puts the parsed spec in
 * context; the `code` and `outputs` renderers, which run inside it, read the
 * side that concerns them and wrap upstream's element in one of two regions:
 *
 *  - CollapseRegion: capped at N em, with an Expand / Collapse bar under it --
 *    the Sphinx theme's `collapse-N` (quantecon-book-theme#300), including its
 *    scroll back to the end of the block when collapsing again.
 *  - ScrollRegion: capped at 24 em with a scrollbar -- the Sphinx theme's
 *    `output_scroll`.
 *
 * Both render their capped state in the server HTML, so a page is never seen
 * at full height first. The bar is a real `<button>` with `aria-expanded`, and
 * the scroll region is focusable so the keyboard can scroll it.
 *
 * The caps are in em OF THE CODE FONT, as on the Sphinx theme: `.qe-long-cell`
 * sets the code block's font size, so `20em` here is twenty of its ems.
 */
import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Cap, LongCellSpec } from '../longCell';

const LongCellContext = createContext<LongCellSpec | null>(null);

export function LongCellProvider({ spec, children }: { spec: LongCellSpec; children: ReactNode }) {
  return <LongCellContext.Provider value={spec}>{children}</LongCellContext.Provider>;
}

/** The cap the enclosing cell asks for on this side, if any. */
export function useLongCellCap(side: 'input' | 'output'): Cap | undefined {
  return useContext(LongCellContext)?.[side];
}

/**
 * Wrap `children` in the region `cap` asks for. The provider is reset inside,
 * so a nested code block or output (an embedded cell, say) is not capped twice.
 */
export function Capped({
  cap,
  side,
  children,
}: {
  cap: Cap;
  side: 'input' | 'output';
  children: ReactNode;
}) {
  const inner = <LongCellContext.Provider value={null}>{children}</LongCellContext.Provider>;
  return cap.kind === 'collapse' ? (
    <CollapseRegion ems={cap.ems} side={side}>
      {inner}
    </CollapseRegion>
  ) : (
    <ScrollRegion ems={cap.ems} side={side}>
      {inner}
    </ScrollRegion>
  );
}

const NOUN = { input: 'code', output: 'output' } as const;

function CollapseRegion({
  ems,
  side,
  children,
}: {
  ems: number;
  side: 'input' | 'output';
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  // Until measured, assume the content overflows: the server HTML then shows the
  // bar, which is right for every cell an author bothered to tag.
  const [overflows, setOverflows] = useState(true);
  const region = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const bodyId = useId();

  useEffect(() => {
    const el = body.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
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
      className={`qe-long-cell qe-collapse qe-collapse--${side}`}
      data-expanded={expanded}
      data-overflows={overflows}
    >
      <div
        ref={body}
        id={bodyId}
        className="qe-collapse__body"
        style={expanded ? undefined : { maxHeight: `${ems + 0.5}em` }}
      >
        {children}
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

function ScrollRegion({
  ems,
  side,
  children,
}: {
  ems: number;
  side: 'input' | 'output';
  children: ReactNode;
}) {
  return (
    <div
      className={`qe-long-cell qe-scroll qe-scroll--${side}`}
      style={{ maxHeight: `${ems}em` }}
      // Focusable, so the keyboard can scroll it; named, so a screen reader
      // says what the scrolling region is.
      tabIndex={0}
      role="region"
      aria-label={`Scrollable ${NOUN[side]}`}
    >
      {children}
    </div>
  );
}

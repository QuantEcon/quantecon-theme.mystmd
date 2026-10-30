import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as RTooltip from '@radix-ui/react-tooltip';
import classNames from 'classnames';
import { NotebookToolbar } from '@myst-theme/jupyter';

/**
 * Labels for the NotebookToolbar buttons whose upstream wording we override.
 * Keyed by the button's class; anything else keeps its upstream title.
 */
const LABEL_OVERRIDES: Record<string, string> = {
  'myst-jp-nb-toolbar-power-btn': 'Run Notebook in Browser',
};

const SHOW_DELAY_MS = 700; // Radix's default, as used by the header `Tooltip`.

/**
 * The upstream NotebookToolbar labels its buttons with native `title`
 * attributes / SVG `<title>` elements, which browsers draw as an unstyled
 * system tooltip -- unlike every other header icon, which uses the Radix
 * `Tooltip`. Capture each label into `data-qe-label` and strip the native
 * ones, so the only tooltip is the styled one rendered by `ComputeTooltips`.
 */
function adoptNativeLabels(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('button').forEach((button) => {
    const override = Object.keys(LABEL_OVERRIDES).find((cls) => button.classList.contains(cls));
    const svgTitle = button.querySelector('svg > title');
    const label =
      (override && LABEL_OVERRIDES[override]) ||
      button.getAttribute('title') ||
      svgTitle?.textContent ||
      button.getAttribute('data-qe-label');
    if (label) button.setAttribute('data-qe-label', label);
    button.removeAttribute('title');
    button.querySelectorAll('svg > title').forEach((t) => t.remove());
  });
}

/** Same look and delay as `toolbar/Tooltip`, anchored to whichever button is hovered/focused. */
function ComputeTooltips({ slot }: { slot: HTMLElement }) {
  const [target, setTarget] = useState<{ label: string; rect: DOMRect } | null>(null);

  useEffect(() => {
    adoptNativeLabels(slot);
    const observer = new MutationObserver(() => adoptNativeLabels(slot));
    observer.observe(slot, { childList: true, subtree: true, attributes: true, attributeFilter: ['title'] });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const hide = () => {
      clearTimeout(timer);
      setTarget(null);
    };
    const show = (event: Event, delay: number) => {
      const button = (event.target as HTMLElement).closest?.('button[data-qe-label]');
      if (!button) return;
      clearTimeout(timer);
      timer = setTimeout(
        () => setTarget({ label: button.getAttribute('data-qe-label')!, rect: button.getBoundingClientRect() }),
        delay,
      );
    };
    const onOver = (e: Event) => show(e, SHOW_DELAY_MS);
    const onFocus = (e: Event) => show(e, 0);
    slot.addEventListener('mouseover', onOver);
    slot.addEventListener('mouseout', hide);
    slot.addEventListener('focusin', onFocus);
    slot.addEventListener('focusout', hide);
    slot.addEventListener('click', hide);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      slot.removeEventListener('mouseover', onOver);
      slot.removeEventListener('mouseout', hide);
      slot.removeEventListener('focusin', onFocus);
      slot.removeEventListener('focusout', hide);
      slot.removeEventListener('click', hide);
    };
  }, [slot]);

  return (
    <RTooltip.Provider>
      <RTooltip.Root open={!!target}>
        <RTooltip.Trigger asChild>
          <span
            aria-hidden
            style={{
              position: 'fixed',
              pointerEvents: 'none',
              left: target?.rect.left ?? 0,
              top: target?.rect.top ?? 0,
              width: target?.rect.width ?? 0,
              height: target?.rect.height ?? 0,
            }}
          />
        </RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            sideOffset={5}
            className={classNames(
              'z-10 px-2 py-1 bg-white rounded-md shadow-md dark:bg-qepage-dark text-qetext-light dark:text-qetext-dark dark:shadow-sm dark:shadow-white/20',
            )}
          >
            {target?.label}
            <RTooltip.Arrow className="fill-white dark:fill-qepage-dark" />
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}

/**
 * Renders the live-compute NotebookToolbar (a Power toggle, then
 * Run/Restart/Clear once a kernel connects) into the fixed QuantEcon header
 * toolbar via a portal, rather than in the article body — so it is always
 * visible while scrolling and sits alongside the Launch button.
 *
 * The portal keeps this component a React child of `PageContent` (inside the
 * Thebe `ThebeLoaderAndServer` / `ExecuteScopeProvider`), so its hooks and the
 * kernel connection keep working even though its DOM lands in the header, which
 * is mounted outside those providers. The target `#qe-compute-slot` lives in
 * `Toolbar`. Client-only: portals don't render during SSR, and live compute is
 * a client-side feature anyway.
 */
export function ComputeToolbarSlot() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(document.getElementById('qe-compute-slot'));
  }, []);
  if (!slot) return null;
  return (
    <>
      {createPortal(<NotebookToolbar />, slot)}
      <ComputeTooltips slot={slot} />
    </>
  );
}

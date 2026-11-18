import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NotebookToolbar } from '@myst-theme/jupyter';

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
  return createPortal(<NotebookToolbar />, slot);
}

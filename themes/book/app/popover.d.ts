/**
 * Popover API attribute typings.
 *
 * React 18's JSX types predate the Popover API, though react-dom does render
 * these attributes (it passes through unknown lowercase ones).
 *
 * Delete this file on the move to React 19, which types them natively.
 */
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual';
  }

  interface ButtonHTMLAttributes<T> {
    popovertarget?: string;
    popovertargetaction?: 'toggle' | 'show' | 'hide';
  }
}

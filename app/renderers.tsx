import type { GenericNode } from 'myst-common';
import type { NodeRenderers } from '@myst-theme/providers';
import { MyST } from 'myst-to-react';
import { OUTPUT_RENDERERS } from '@myst-theme/jupyter';

/**
 * Fancy ordered lists (QuantEcon/mystmd#50): `list` nodes carry `style`
 * (lower-alpha | upper-alpha | lower-roman | upper-roman) and `delimiter`
 * (paren | parens) for Pandoc fancy_lists markers such as `a.`, `iv.`, `(i)`.
 *
 * myst-to-react's `list` renderer drops both fields, so `(a)` / `(i)` lists
 * render with decimal markers. This override maps `style` to the
 * `<ol type>` attribute and exposes `delimiter` as a `delimiter-paren` /
 * `delimiter-parens` class consumed by styles/lists.css — the same hook the
 * fork's `myst-to-html` emits, so one CSS spec serves both renderers.
 *
 * Drop this override (and styles/lists.css) once the fix lands in upstream
 * jupyter-book/myst-theme alongside the fancy-lists mystmd upstreaming
 * (QuantEcon/mystmd#51).
 */
type OlStyle = 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
type OlDelimiter = 'paren' | 'parens';

const OL_TYPE: Record<OlStyle, 'a' | 'A' | 'i' | 'I'> = {
  'lower-alpha': 'a',
  'upper-alpha': 'A',
  'lower-roman': 'i',
  'upper-roman': 'I',
};

// No HTML attribute expresses the delimiter; expose a CSS hook for `(a)` / `a)` markers.
// The lookup doubles as the allow-list — unknown values (and `period`) emit nothing.
const DELIMITER_CLASS: Record<OlDelimiter, string> = {
  paren: 'delimiter-paren',
  parens: 'delimiter-parens',
};

export const LIST_RENDERERS: NodeRenderers = {
  list({ node, className }: { node: GenericNode; className?: string }) {
    if (node.ordered) {
      // The style is mirrored as a `list-*` class because CSS can't target the
      // `type` attribute reliably: HTML matches [type=...] case-insensitively,
      // so ol[type='a'] and ol[type='A'] select the same elements.
      const isKnownStyle = node.style && node.style in OL_TYPE;
      const olType = isKnownStyle ? OL_TYPE[node.style as OlStyle] : undefined;
      const styleClass = isKnownStyle ? `list-${node.style}` : undefined;
      const delimiterClass =
        node.delimiter && node.delimiter in DELIMITER_CLASS
          ? DELIMITER_CLASS[node.delimiter as OlDelimiter]
          : undefined;
      return (
        <ol
          start={node.start ?? undefined}
          type={olType}
          id={node.html_id}
          className={[className, styleClass, delimiterClass].filter(Boolean).join(' ') || undefined}
        >
          <MyST ast={node.children} />
        </ol>
      );
    }
    return (
      <ul id={node.html_id} className={className}>
        <MyST ast={node.children} />
      </ul>
    );
  },
};

/**
 * Collapsible stderr. A cell's stderr streams fold behind a "Code warnings"
 * button, where upstream @myst-theme/jupyter renders them as a plain
 * `<pre class="jupyter-error">`. The fold is done at render: a stderr stream
 * `output` node is wrapped in a native `<details>`, closed by default, so it
 * works in the server-rendered HTML with no script and no DOM surgery. Every
 * other output goes to upstream's renderer untouched. Styled by the
 * `.qe-stderr` block in styles/quantecon.css.
 */
const UpstreamOutput = OUTPUT_RENDERERS.output as (props: {
  node: GenericNode;
  className?: string;
}) => JSX.Element | null;

export const STDERR_RENDERERS: NodeRenderers = {
  output(props: { node: GenericNode; className?: string }) {
    const data = props.node.jupyter_data as { output_type?: string; name?: string } | undefined;
    if (data?.output_type === 'stream' && data?.name === 'stderr') {
      return (
        <details className="qe-stderr">
          <summary>
            <span className="qe-stderr__icon" aria-hidden="true">
              ⚠
            </span>{' '}
            Code warnings
          </summary>
          <UpstreamOutput {...props} />
        </details>
      );
    }
    return <UpstreamOutput {...props} />;
  },
};

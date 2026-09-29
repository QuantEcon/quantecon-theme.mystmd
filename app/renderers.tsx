import type { GenericNode } from 'myst-common';
import type { NodeRenderers } from '@myst-theme/providers';
import { Block, DEFAULT_RENDERERS, MyST } from 'myst-to-react';
import { NOTEBOOK_BLOCK_RENDERERS, OUTPUT_RENDERERS } from '@myst-theme/jupyter';
import { ProjectTOCBlock } from './components/ProjectTOC';
import { CollapseRegion, LongCellProvider, useLongCellCap } from './components/LongCell';
import { certainlyOverflows, longCellSpec, outputTextLines, sourceLines } from './longCell';

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

/**
 * Landing-page `{tableofcontents}`: the CLI's toc transform turns the
 * directive into a `block` whose only marker is `data.part === 'toc:project'`
 * — unreachable by `selectRenderer`'s unist-util-select keys, which match
 * top-level props only. So this wraps the base `block` renderer instead:
 * project TOCs go to ProjectTOCBlock (app/components/ProjectTOC.tsx), every
 * other block — including `toc:children`/`toc:page`/`toc:section` — falls
 * through to upstream's Block untouched.
 */
const UpstreamBlock = Block as (props: {
  node: GenericNode;
  className?: string;
}) => JSX.Element;

export const TOC_RENDERERS: NodeRenderers = {
  block(props: { node: GenericNode; className?: string }) {
    if ((props.node.data as { part?: string } | undefined)?.part === 'toc:project') {
      return <ProjectTOCBlock {...props} />;
    }
    return <UpstreamBlock {...props} />;
  },
};

/**
 * Long code inputs and long outputs, collapsed behind an Expand / Collapse
 * bar by cell tag: `collapse-N` on the input, `collapse-output-N` on the
 * outputs (app/longCell.ts, app/components/LongCell.tsx). Every cell tag
 * reaches the block's `data.tags` whatever the engine makes of it, so the
 * theme reads them there. Three renderers cooperate:
 *
 *  - `block`, under the SAME selector key upstream registers for notebook
 *    cells, so this replaces upstream's entry and delegates to it: a cell with
 *    a collapse tag gets the parsed spec in context; every other cell goes to
 *    upstream untouched.
 *  - `code` and `outputs` read their side of that spec and wrap upstream's
 *    element in a CollapseRegion. With no spec in context, or nothing on the
 *    page to collapse, they return upstream's element as it is.
 */
type Renderer = (props: { node: GenericNode; className?: string }) => JSX.Element | null;

const NOTEBOOK_BLOCK_KEY = 'block[kind=notebook-code],block[kind=notebook-content]';
const UpstreamNotebookBlock = (NOTEBOOK_BLOCK_RENDERERS.block as Record<string, Renderer>)[
  NOTEBOOK_BLOCK_KEY
];
const UpstreamCode = (DEFAULT_RENDERERS.code as { base: Renderer }).base;
const UpstreamOutputs = OUTPUT_RENDERERS.outputs as Renderer;

export const LONG_CELL_RENDERERS: NodeRenderers = {
  block: {
    [NOTEBOOK_BLOCK_KEY]: function LongCellBlock(props: { node: GenericNode; className?: string }) {
      const tags = (props.node.data as { tags?: unknown } | undefined)?.tags;
      const spec = props.node.kind === 'notebook-code' ? longCellSpec(tags) : null;
      if (!spec) return <UpstreamNotebookBlock {...props} />;
      return (
        <LongCellProvider spec={spec}>
          <UpstreamNotebookBlock {...props} />
        </LongCellProvider>
      );
    },
  },
  code(props: { node: GenericNode; className?: string }) {
    const n = useLongCellCap('input');
    const { node } = props;
    // Only the cell's own executable input: a `{code-block}` quoted inside an
    // output, say, is not what the tag is about. A removed input renders
    // nothing to collapse.
    if (!n || !node.executable || node.visibility === 'remove') return <UpstreamCode {...props} />;
    // A hidden input waits folded in a "Source" disclosure, so until a reader
    // opens it there is nothing tall on the page.
    const certain = node.visibility !== 'hide' && certainlyOverflows(sourceLines(node.value), n);
    return (
      <CollapseRegion n={n} side="input" overflowsInitially={certain}>
        <UpstreamCode {...props} />
      </CollapseRegion>
    );
  },
  outputs(props: { node: GenericNode; className?: string }) {
    const n = useLongCellCap('output');
    const { node } = props;
    const outputs = (node.children ?? []).map((child) => child.jupyter_data);
    // A cell that stored no output, or whose output is removed, has nothing
    // to collapse.
    if (!n || node.visibility === 'remove' || outputs.length === 0) {
      return <UpstreamOutputs {...props} />;
    }
    const certain = node.visibility !== 'hide' && certainlyOverflows(outputTextLines(outputs), n);
    return (
      <CollapseRegion n={n} side="output" overflowsInitially={certain}>
        <UpstreamOutputs {...props} />
      </CollapseRegion>
    );
  },
};

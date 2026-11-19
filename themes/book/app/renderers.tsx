import React, { useCallback, useState } from 'react';
import type { GenericNode } from 'myst-common';
import type { NodeRenderer, NodeRenderers } from '@myst-theme/providers';
import { XRefProvider, useFrontmatter, useReferences } from '@myst-theme/providers';
import { DEFAULT_RENDERERS, HashLink, HoverPopover, MyST } from 'myst-to-react';
import { collect } from './mdast';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/light';
import python from 'react-syntax-highlighter/dist/cjs/languages/hljs/python';
import julia from 'react-syntax-highlighter/dist/cjs/languages/hljs/julia';
import r from 'react-syntax-highlighter/dist/cjs/languages/hljs/r';
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/hljs/yaml';
import latex from 'react-syntax-highlighter/dist/cjs/languages/hljs/latex';
import plaintext from 'react-syntax-highlighter/dist/cjs/languages/hljs/plaintext';

/* ============================================================
   Theorem environments
   ============================================================ */

/**
 * The name in a proof's header, e.g. "Theorem".
 *
 * When the project sets a numbering template for the kind, the name comes
 * from it, so `numbering: {proof:property: {template: 'Fact %s'}}` heads the
 * environment "Fact 1.2", agreeing with cross-references to it. This is the
 * behaviour of QuantEcon/myst-theme `qe-v1` (QuantEcon/mystmd#149), which
 * the converted editions rely on. A template that uses `{name}` is ignored,
 * since the title is shown separately.
 */
export function proofName(
  kind?: string,
  numbering?: Record<string, { template?: string } | undefined>,
): string {
  const template = kind ? numbering?.[`proof:${kind}`]?.template : undefined;
  if (template && !template.includes('{name}')) {
    const name = template.replace(/%s|\{number\}/g, '').replace(/ /g, ' ').trim();
    if (name) return name;
  }
  return kind ? kind.slice(0, 1).toUpperCase() + kind.slice(1) : '';
}

/**
 * Which of the five Manuscript hues an environment takes: statements
 * (theorem blue), definitions and assumptions (clay), examples (green),
 * remarks (amber) and proofs (grey).
 */
export function proofHue(kind?: string): 'theorem' | 'definition' | 'example' | 'remark' | 'proof' {
  switch (kind) {
    case 'theorem':
    case 'lemma':
    case 'proposition':
    case 'corollary':
    case 'conjecture':
      return 'theorem';
    case 'definition':
    case 'axiom':
    case 'assumption':
    case 'criterion':
      return 'definition';
    case 'example':
    case 'property':
    case 'observation':
      return 'example';
    case 'remark':
      return 'remark';
    default:
      return 'proof';
  }
}

/**
 * A MyST `proof` node (`{prf:theorem}` and kin) as a Manuscript environment:
 * an italic label, a hairline rule in the environment's hue, no fill.
 *
 *   Theorem 2.3.1 (Banach).  …body…
 *   Proof.  …body…
 *
 * `class: dropdown` folds the body into a native <details>.
 */
const ProofRenderer: NodeRenderer = ({ node, className }) => {
  const frontmatter = useFrontmatter() as { numbering?: Record<string, { template?: string }> } | undefined;
  const [first, ...rest] = node.children ?? [];
  const hasTitle = first?.type === 'admonitionTitle';
  const body = hasTitle ? rest : node.children;
  const kind: string | undefined = node.kind;
  const hue = proofHue(kind);
  const name = proofName(kind, frontmatter?.numbering);
  const classes = String(node.class ?? '').split(/\s+/);
  const dropdown = classes.includes('dropdown');
  const id = node.html_id || node.identifier;

  const label = (
    <span className="qb-env__label">
      <HashLink id={id} kind={name} className="qb-env__tag">
        {name}
        {node.enumerator ? ` ${node.enumerator}` : ''}
      </HashLink>
      {hasTitle && (
        <span className="qb-env__name">
          {' '}
          (<MyST ast={first.children} />)
        </span>
      )}
      <span className="qb-env__stop">.</span>
    </span>
  );
  const cls = ['qb-env', `qb-env--${hue}`, 'myst-proof', className].filter(Boolean).join(' ');
  if (dropdown) {
    return (
      <details id={id} className={cls} data-kind={kind}>
        <summary>{label}</summary>
        <div className="qb-env__body">
          <MyST ast={body} />
        </div>
      </details>
    );
  }
  return (
    <div id={id} className={cls} data-kind={kind}>
      {label}
      <div className="qb-env__body">
        <MyST ast={body} />
      </div>
    </div>
  );
};

/* ============================================================
   Code
   ============================================================ */

const LANGUAGES: Record<string, any> = { python, julia, r, bash, javascript, json, yaml, latex, plaintext };
for (const [nameKey, def] of Object.entries(LANGUAGES)) SyntaxHighlighter.registerLanguage(nameKey, def);

const LANGUAGE_ALIASES: Record<string, string> = {
  py: 'python',
  python3: 'python',
  ipython: 'python',
  ipython3: 'python',
  jl: 'julia',
  sh: 'bash',
  shell: 'bash',
  console: 'bash',
  js: 'javascript',
  yml: 'yaml',
  tex: 'latex',
  text: 'plaintext',
  txt: 'plaintext',
  output: 'plaintext',
};

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  julia: 'Julia',
  r: 'R',
  bash: 'Shell',
  javascript: 'JavaScript',
  json: 'JSON',
  yaml: 'YAML',
  latex: 'LaTeX',
  plaintext: 'Text',
};

export function normaliseLanguage(lang?: string): string {
  const l = (lang ?? '').trim().toLowerCase();
  const resolved = LANGUAGE_ALIASES[l] ?? l;
  return resolved in LANGUAGES ? resolved : 'plaintext';
}

export function languageLabel(lang?: string): string {
  const raw = (lang ?? '').trim();
  const resolved = normaliseLanguage(raw);
  if (resolved === 'plaintext' && raw && !(raw.toLowerCase() in LANGUAGE_ALIASES)) return raw;
  return LANGUAGE_LABELS[resolved] ?? 'Text';
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      },
      () => undefined,
    );
  }, [text]);
  return (
    <button type="button" className="qb-codecard__copy" onClick={copy} aria-label="Copy the code">
      <span aria-live="polite">{copied ? 'copied' : 'copy'}</span>
    </button>
  );
}

/**
 * A code block as a Manuscript code card: a bar naming the language (and the
 * file, when the block has one) with a copy button, over the highlighted
 * code. Highlighting emits `hljs-*` classes rather than inline styles, so
 * the palette comes from the theme's tokens and follows light and dark.
 */
const CodeRenderer: NodeRenderer = ({ node, className }) => {
  const lang = normaliseLanguage(node.lang);
  const value: string = node.value ?? '';
  const emphasise = new Set<number>(node.emphasizeLines ?? []);
  return (
    <div
      id={node.html_id || node.identifier || undefined}
      className={['qb-codecard', 'myst-code', 'not-prose', className].filter(Boolean).join(' ')}
      data-lang={lang}
    >
      <div className="qb-codecard__bar">
        <span className="qb-codecard__dot" aria-hidden="true" />
        <span className="qb-codecard__lang">{languageLabel(node.lang)}</span>
        {node.filename && <span className="qb-codecard__file">{node.filename}</span>}
        <CopyButton text={value} />
      </div>
      <SyntaxHighlighter
        language={lang}
        useInlineStyles={false}
        showLineNumbers={!!node.showLineNumbers}
        startingLineNumber={node.startingLineNumber ?? 1}
        wrapLines={emphasise.size > 0}
        lineProps={(n: number) => (emphasise.has(n) ? { 'data-highlight': 'true' } : {})}
        PreTag="pre"
        className="qb-codecard__pre"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

/* ============================================================
   Headings
   ============================================================ */

/** Section numbers in a mono clay label before the heading text. */
const HeadingRenderer: NodeRenderer = ({ node, className }) => {
  const { enumerator, depth } = node as GenericNode & { depth: number };
  const id = node.html_id || node.identifier || node.key;
  return React.createElement(
    `h${depth}`,
    { id, className: ['relative group', className].filter(Boolean).join(' ') },
    <>
      {enumerator && <span className="qb-secnum">{enumerator}</span>}
      <span className="heading-text">
        <MyST ast={node.children} />
      </span>
      <HashLink id={id} kind="Section" className="font-normal" hover hideInPopup noWidth />
    </>,
  );
};

/* ============================================================
   Admonitions and footnote marks
   ============================================================ */

/** The kinds upstream's admonition renderer knows, by `kind` or by class. */
const ADMONITION_KINDS = [
  'note',
  'important',
  'hint',
  'seealso',
  'tip',
  'attention',
  'warning',
  'caution',
  'danger',
  'error',
];

const UpstreamAdmonition = (DEFAULT_RENDERERS.admonition as Record<string, NodeRenderer>).base;

/**
 * Upstream's admonition, with a generic one tagged. A titled `{admonition}`
 * has no kind, and upstream renders it as a note; the class lets it take a
 * neutral grey instead of note-blue (styles/book.css). A box whose class
 * names a kind (`:class: tip`) is that kind, not generic.
 */
const AdmonitionRenderer: NodeRenderer = (props) => {
  const classes = String(props.node.class ?? '')
    .toLowerCase()
    .split(/\s+/);
  const generic = !props.node.kind && !classes.some((c) => ADMONITION_KINDS.includes(c));
  const className = generic
    ? [props.className, 'qb-admonition-generic'].filter(Boolean).join(' ')
    : props.className;
  return <UpstreamAdmonition {...props} className={className} />;
};

function FootnoteCard({ identifier }: { identifier: string }) {
  const references = useReferences();
  const node =
    // `footnotes` is on the references at runtime (upstream reads it too) but
    // not in their type.
    (references as { footnotes?: Record<string, GenericNode> } | undefined)?.footnotes?.[identifier] ??
    collect(references?.article, 'footnoteDefinition').find((fn) => fn.identifier === identifier);
  return (
    <XRefProvider>
      <div className="hover-document article w-[500px] sm:max-w-[500px] px-3 text-sm">
        <MyST ast={node?.children} />
      </div>
    </XRefProvider>
  );
}

/**
 * Upstream's footnote mark with a bare numeral, "1" rather than "[1]", as the
 * Manuscript design's `sup.fnref` draws it. The brackets are text in
 * upstream's link, so the mark is rendered here; its id, link and hover card
 * are upstream's.
 */
const FootnoteReferenceRenderer: NodeRenderer = ({ node, className }) => (
  <HoverPopover openDelay={0} card={<FootnoteCard identifier={node.identifier} />}>
    <span id={`fnref-${node.key}`} className={className}>
      <sup className="hover-link">
        <HashLink id={`fn-${node.identifier}`} title="Link to Footnote" scrollBehavior="instant" canSelectText>
          {node.enumerator ?? node.number ?? node.identifier}
        </HashLink>
      </sup>
    </span>
  </HoverPopover>
);

export const BOOK_RENDERERS: NodeRenderers = {
  proof: ProofRenderer,
  code: CodeRenderer,
  heading: HeadingRenderer,
  admonition: AdmonitionRenderer,
  footnoteReference: FootnoteReferenceRenderer,
};

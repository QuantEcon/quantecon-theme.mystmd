/**
 * Test-only transform: stamp fancy-list `style` / `delimiter` onto ordered lists.
 *
 * The visual harness builds this fixture with stock npm `mystmd`, which does not
 * parse Pandoc fancy_lists markers (that parser lives in the QuantEcon mystmd
 * fork — QuantEcon/mystmd#50). To exercise the theme's fancy-list renderer
 * (app/renderers.tsx + styles/lists.css) regardless of the CLI's parser, this
 * plugin lets lists.md write ordinary `1.` lists and stamp them explicitly:
 *
 *     % fancy: lower-alpha parens
 *     1. becomes (a)
 *     2. becomes (b)
 *
 * A `% fancy: <style> [<delimiter>]` comment applies to the next ordered list
 * in the same container. Styles: lower-alpha | upper-alpha | lower-roman |
 * upper-roman. Delimiters: paren | parens (omit for period-style markers).
 */
const FANCY = /^\s*fancy:\s*(lower-alpha|upper-alpha|lower-roman|upper-roman)(?:\s+(paren|parens))?\s*$/;

function stamp(node) {
  const children = node?.children;
  if (!Array.isArray(children)) return;
  let pending;
  for (const child of children) {
    const match = child.type === 'comment' && typeof child.value === 'string' && child.value.match(FANCY);
    if (match) {
      pending = { style: match[1], delimiter: match[2] };
      continue;
    }
    if (pending && child.type === 'list' && child.ordered) {
      child.style = pending.style;
      if (pending.delimiter) child.delimiter = pending.delimiter;
      pending = undefined;
    }
    stamp(child);
  }
}

const plugin = {
  name: 'Fancy-list fixture stamp',
  transforms: [
    {
      name: 'stamp-fancy-lists',
      doc: 'Stamp style/delimiter onto ordered lists following a `% fancy: ...` comment.',
      stage: 'document',
      plugin: () => (tree) => {
        stamp(tree);
      },
    },
  ],
};

export default plugin;

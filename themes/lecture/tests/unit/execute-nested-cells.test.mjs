/**
 * Regression coverage for #117 — code cells nested inside a directive
 * (`{exercise}`, `{solution}`, `{note}`, …) must be registered with the kernel.
 *
 * `@myst-theme/jupyter`'s `notebookFromMdast` walked only the mdast root's
 * direct children, so a cell at `root > block > exercise > block` never entered
 * `notebook.cells` or the `idkmap` — while the renderer matches
 * `block[kind=notebook-code]` at any depth and drew a run button regardless.
 * The button therefore rendered and did nothing.
 *
 * This imports the *patched* file out of `node_modules`, so it fails both if
 * the traversal regresses and if `patches/@myst-theme+jupyter+1.3.0.patch`
 * stops applying (`npm ci` runs patch-package via `postinstall`).
 *
 * The module has no imports of its own, so a hand-rolled `core` is enough.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { notebookFromMdast } from '../../../../node_modules/@myst-theme/jupyter/dist/execute/utils.js';

class FakeNotebook {
  constructor(id) {
    this.id = id;
    this.cells = [];
  }
  get code() {
    return this.cells.filter((c) => c.kind === 'code');
  }
}
class FakeCodeCell {
  constructor(id, notebookId, source) {
    Object.assign(this, { kind: 'code', id, notebookId, source });
  }
}
class FakeMarkdownCell {
  constructor(id, notebookId, source) {
    Object.assign(this, { kind: 'markdown', id, notebookId, source });
  }
}
const core = {
  ThebeNotebook: FakeNotebook,
  ThebeCodeCell: FakeCodeCell,
  ThebeMarkdownCell: FakeMarkdownCell,
};

/**
 * `block[kind=notebook-code] > [code, outputs]` — the shape mystmd emits for a
 * `{code-cell}`, identical at top level and nested (checked against a real
 * `myst build` of a page carrying both).
 */
const cell = (key, value, outputsId) => ({
  type: 'block',
  kind: 'notebook-code',
  key,
  children: [
    { type: 'code', lang: 'python', executable: true, value, key: `${key}-code` },
    { type: 'outputs', id: outputsId, children: [], key: `${key}-outputs` },
  ],
});

/** A wrapper block holding prose plus directives, as mystmd merges them. */
const mdast = {
  type: 'root',
  children: [
    cell('top1', 'a = 1', 'out-top1'),
    {
      type: 'block',
      key: 'wrapper',
      children: [
        { type: 'paragraph', key: 'p1', children: [] },
        {
          type: 'exercise',
          key: 'ex',
          children: [
            cell('nested1', 'b = 2', 'out-nested1'),
            {
              type: 'admonition',
              kind: 'note',
              key: 'note',
              children: [cell('nested2', 'c = 3', 'out-nested2')],
            },
          ],
        },
      ],
    },
    cell('top2', 'd = 4', 'out-top2'),
  ],
};

function build(tree = mdast) {
  const idkmap = {};
  const notebook = notebookFromMdast(core, {}, 'page', 'page', tree, idkmap, {});
  return { notebook, idkmap };
}

test('cells nested in directives are registered, in document order', () => {
  const { notebook } = build();
  // Document order is execution order: thebe-core executes `notebook.cells` in
  // array order, so a nested cell must sit between the top-level cells that
  // surround it in the source, not appended at the end.
  assert.deepEqual(
    notebook.code.map((c) => c.id),
    ['top1', 'nested1', 'nested2', 'top2']
  );
  assert.deepEqual(
    notebook.code.map((c) => c.source),
    ['a = 1', 'b = 2', 'c = 3', 'd = 4']
  );
});

test('the nested block key resolves to a cell — the run button target', () => {
  const { idkmap } = build();
  // The renderer draws <NotebookRunCell id={node.key} />, so this is the exact
  // lookup that returned undefined and produced `no cell found on execute`.
  assert.deepEqual(idkmap.nested1, { pageSlug: 'page', notebookSlug: 'page', cellId: 'nested1' });
  assert.deepEqual(idkmap.nested2, { pageSlug: 'page', notebookSlug: 'page', cellId: 'nested2' });
});

test('nested outputs ids resolve, so live outputs attach instead of blanking', () => {
  const { idkmap } = build();
  // Asserted against concrete values, not against idkmap.nested1: comparing the
  // two would pass unpatched, when both sides are undefined.
  assert.deepEqual(idkmap['out-nested1'], {
    pageSlug: 'page',
    notebookSlug: 'page',
    cellId: 'nested1',
  });
  assert.deepEqual(idkmap['out-nested2'], {
    pageSlug: 'page',
    notebookSlug: 'page',
    cellId: 'nested2',
  });
});

test('top-level cells and the markdown fallback are unchanged', () => {
  const { notebook, idkmap } = build();
  assert.deepEqual(idkmap.top1, { pageSlug: 'page', notebookSlug: 'page', cellId: 'top1' });
  // The wrapper block still yields exactly one markdown cell; its source is
  // built from direct children only, so the nested code is not duplicated.
  const markdown = notebook.cells.filter((c) => c.kind === 'markdown');
  assert.equal(markdown.length, 1);
  assert.equal(markdown[0].id, 'wrapper');
  assert.ok(!markdown[0].source.includes('b = 2'));
});

test('labels on a nested cell are registered for cross-referencing', () => {
  const labelled = {
    type: 'root',
    children: [
      {
        type: 'block',
        key: 'wrapper',
        children: [
          {
            type: 'solution',
            key: 'sol',
            children: [
              {
                ...cell('nested-labelled', 'e = 5', 'out-labelled'),
                identifier: 'my-cell',
              },
            ],
          },
        ],
      },
    ],
  };
  const { idkmap } = build(labelled);
  assert.deepEqual(idkmap['my-cell'], {
    pageSlug: 'page',
    notebookSlug: 'page',
    cellId: 'nested-labelled',
  });
});

test('embed subtrees are skipped — they belong to another page notebook', () => {
  const withEmbed = {
    type: 'root',
    children: [
      cell('top1', 'a = 1', 'out-top1'),
      {
        type: 'block',
        key: 'wrapper',
        children: [
          {
            type: 'embed',
            key: 'emb',
            // A copy of another page's cell: fresh block key, but the SOURCE
            // notebook's outputs id. Registering it would add a phantom cell
            // and collide that id in the shared idkmap.
            children: [cell('embedded', 'x = 9', 'out-source-page')],
          },
        ],
      },
    ],
  };
  const { notebook, idkmap } = build(withEmbed);
  assert.deepEqual(
    notebook.code.map((c) => c.id),
    ['top1']
  );
  assert.equal(idkmap.embedded, undefined);
  assert.equal(idkmap['out-source-page'], undefined);
});

test('the lone-container figure case still resolves', () => {
  const figure = {
    type: 'root',
    children: [
      {
        type: 'block',
        key: 'figblock',
        children: [
          {
            type: 'container',
            kind: 'figure',
            key: 'fig',
            children: [
              { type: 'code', lang: 'python', value: 'plot()', key: 'fig-code' },
              { type: 'outputs', id: 'out-fig', children: [], key: 'fig-outputs' },
            ],
          },
        ],
      },
    ],
  };
  const { notebook, idkmap } = build(figure);
  assert.deepEqual(
    notebook.code.map((c) => c.id),
    ['figblock']
  );
  assert.deepEqual(idkmap['out-fig'], {
    pageSlug: 'page',
    notebookSlug: 'page',
    cellId: 'figblock',
  });
});

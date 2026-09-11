/**
 * Unit tests for the `{raw}` block rewriter (scripts/rewrite-raw-blocks.mjs).
 *
 * The fixtures below are the shapes the lecture sources actually carry, taken
 * from `short_path.md` (a `{raw} html` header), `need_for_speed.md` (a
 * `{raw} jupyter` header), `simple_linear_regression.md` (the Our World in Data
 * chart, on a colon fence) and `opt_transport.md` (the factory table).
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { rewriteDocument } from '../../scripts/rewrite-raw-blocks.mjs';

const FRONTMATTER = ['---', 'jupytext:', '  text_representation:', '    extension: .md', '---'].join(
  '\n'
);

const HEADER_BODY = [
  '<div id="qe-notebook-header" align="right" style="text-align:right;">',
  '        <a href="https://quantecon.org/" title="quantecon.org">',
  '                <img style="width:250px;display:inline;" width="250px" src="https://assets.quantecon.org/img/qe-menubar-logo.svg" alt="QuantEcon">',
  '        </a>',
  '</div>',
].join('\n');

const headerDoc = (lang, fence = '```') =>
  `${FRONTMATTER}\n\n(short_path)=\n${fence}{raw} ${lang}\n${HEADER_BODY}\n${fence}\n\n# Shortest Paths\n\nText.\n`;

test('deletes a `{raw} jupyter` header, leaving the label on the heading', () => {
  const { text, counts, unknown } = rewriteDocument(headerDoc('jupyter'));
  assert.deepEqual(unknown, []);
  assert.equal(counts.headers, 1);
  assert.ok(!text.includes('{raw}'));
  assert.ok(!text.includes('qe-notebook-header'));
  // The blank line below the block goes with it, so the target still names the
  // heading rather than sitting a paragraph above it.
  assert.match(text, /\(short_path\)=\n# Shortest Paths/);
});

test('deletes a `{raw} html` header too', () => {
  const { text, counts } = rewriteDocument(headerDoc('html'));
  assert.equal(counts.headers, 1);
  assert.ok(!text.includes('qe-notebook-header'));
});

test('deletes a header on a longer fence', () => {
  const { counts } = rewriteDocument(headerDoc('html', '````'));
  assert.equal(counts.headers, 1);
});

test('converts the Our World in Data chart to `{iframe}`', () => {
  const source = [
    '**Q2:** Gather some data',
    '',
    ':::{raw} html',
    '<iframe src="https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita" loading="lazy" style="width: 100%; height: 600px; border: 0px none;"></iframe>',
    ':::',
    '',
    'After.',
    '',
  ].join('\n');
  const { text, counts, unknown } = rewriteDocument(source);
  assert.deepEqual(unknown, []);
  assert.equal(counts.iframes, 1);
  assert.equal(
    text,
    [
      '**Q2:** Gather some data',
      '',
      ':::{iframe} https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita',
      ':width: 100%',
      ':::',
      '',
      'After.',
      '',
    ].join('\n')
  );
});

test('unwraps a table, keeping its colspan and rowspan', () => {
  const source = [
    'Before.',
    '',
    '```{raw} html',
    '<table>',
    '    <tr>',
    '        <th colspan="3"><center>Factory</center></th>',
    '\t    <th rowspan="2">Requirement</th>',
    '\t</tr >',
    '</table>',
    '```',
    '',
    'After.',
    '',
  ].join('\n');
  const { text, counts, unknown } = rewriteDocument(source);
  assert.deepEqual(unknown, []);
  assert.equal(counts.tables, 1);
  assert.ok(!text.includes('{raw}'));
  assert.ok(text.includes('<table>'));
  assert.ok(text.includes('colspan="3"'));
  assert.ok(text.includes('rowspan="2"'));
  // The HTML itself is untouched, tabs and all.
  assert.ok(text.includes('\t    <th rowspan="2">Requirement</th>'));
});

test('a second pass changes nothing', () => {
  for (const source of [headerDoc('jupyter'), headerDoc('html')]) {
    const once = rewriteDocument(source).text;
    const twice = rewriteDocument(once);
    assert.equal(twice.text, once);
    assert.deepEqual(twice.counts, { headers: 0, iframes: 0, tables: 0 });
  }
});

test('reports any other `{raw}` block by line, and leaves it alone', () => {
  const source = ['# Title', '', '```{raw} latex', '\\newpage', '```', '', 'After.', ''].join('\n');
  const { text, unknown } = rewriteDocument(source);
  assert.equal(text, source);
  assert.deepEqual(unknown, [{ line: 3, reason: '{raw} latex' }]);
});

test('reports a block nested inside another directive at its real line', () => {
  const source = [
    '# Title',
    '',
    '::::{exercise}',
    'Body.',
    '',
    ':::{raw} html',
    '<p>something else</p>',
    ':::',
    '::::',
    '',
  ].join('\n');
  const { text, unknown } = rewriteDocument(source);
  assert.equal(text, source);
  assert.deepEqual(unknown, [{ line: 6, reason: '{raw} html' }]);
});

test('rewrites a header nested inside another directive', () => {
  const source = ['::::{note}', ':::{raw} jupyter', HEADER_BODY, ':::', '::::', ''].join('\n');
  const { text, counts } = rewriteDocument(source);
  assert.equal(counts.headers, 1);
  assert.equal(text, ['::::{note}', '::::', ''].join('\n'));
});

test('leaves a `{raw}` block quoted inside a code fence alone', () => {
  const source = [
    'How the old sources looked:',
    '',
    '````markdown',
    '```{raw} jupyter',
    HEADER_BODY,
    '```',
    '````',
    '',
  ].join('\n');
  const { text, counts, unknown } = rewriteDocument(source);
  assert.equal(text, source);
  assert.deepEqual(counts, { headers: 0, iframes: 0, tables: 0 });
  assert.deepEqual(unknown, []);
});

test('a document with no `{raw}` block is returned unchanged', () => {
  const source = ['# Title', '', '```{note}', 'Hello.', '```', ''].join('\n');
  assert.equal(rewriteDocument(source).text, source);
});

test('a CRLF source is rewritten, and keeps its line endings', () => {
  const source = headerDoc('jupyter').replace(/\n/g, '\r\n');
  const { text, counts, unknown } = rewriteDocument(source);
  assert.deepEqual(unknown, []);
  assert.equal(counts.headers, 1, 'a trailing CR must not hide the fence');
  assert.ok(!text.includes('qe-notebook-header'));
  assert.ok(text.includes('\r\n'));
  assert.ok(!/[^\r]\n/.test(text), 'no bare LF should be left in a CRLF file');
});

test('an unhandled block in a CRLF source is still reported', () => {
  const source = ['# Title', '', '```{raw} latex', '\\newpage', '```', ''].join('\r\n');
  const { unknown } = rewriteDocument(source);
  assert.deepEqual(unknown, [{ line: 3, reason: '{raw} latex' }]);
});

test('a table gets blank lines around it, so following Markdown still parses', () => {
  // An HTML block runs to the next blank line; without one the heading below
  // would be swallowed into it and render as literal text.
  const source = [
    'Intro.',
    '```{raw} html',
    '<table><tr><th>A</th></tr></table>',
    '```',
    '## A Real Heading',
    '',
  ].join('\n');
  const { text, counts } = rewriteDocument(source);
  assert.equal(counts.tables, 1);
  assert.equal(
    text,
    ['Intro.', '', '<table><tr><th>A</th></tr></table>', '', '## A Real Heading', ''].join('\n')
  );
});

test('a body that only starts with a table is reported, not unfenced', () => {
  const source = [
    '```{raw} html',
    '<table><tr><td>a</td></tr></table>',
    '<script>document.title = "hi"</script>',
    '```',
    '',
  ].join('\n');
  const { text, counts, unknown } = rewriteDocument(source);
  assert.equal(text, source);
  assert.equal(counts.tables, 0);
  assert.equal(unknown.length, 1);
});

test('only `html` blocks are converted; another format is reported', () => {
  for (const lang of ['latex', 'tex']) {
    const source = ['```{raw} ' + lang, '<table><tr><td>a</td></tr></table>', '```', ''].join('\n');
    const { text, counts, unknown } = rewriteDocument(source);
    assert.equal(text, source, `${lang} must not be unfenced as HTML`);
    assert.equal(counts.tables, 0);
    assert.deepEqual(unknown, [{ line: 1, reason: `{raw} ${lang}` }]);
  }
});

test('a block quoted inside a code-listing directive is left alone', () => {
  for (const directive of ['code-cell ipython3', 'code-block md', 'literalinclude']) {
    const source = [
      '```{' + directive + '}',
      ':::{raw} jupyter',
      HEADER_BODY,
      ':::',
      '```',
      '',
    ].join('\n');
    const { text, counts, unknown } = rewriteDocument(source);
    assert.equal(text, source, `${directive} body must not be rewritten`);
    assert.deepEqual(counts, { headers: 0, iframes: 0, tables: 0 });
    assert.deepEqual(unknown, []);
  }
});

test('a tilde code fence is stepped over like a backtick one', () => {
  const source = ['~~~markdown', '```{raw} latex', '\\newpage', '```', '~~~', ''].join('\n');
  const { text, unknown } = rewriteDocument(source);
  assert.equal(text, source);
  assert.deepEqual(unknown, []);
});

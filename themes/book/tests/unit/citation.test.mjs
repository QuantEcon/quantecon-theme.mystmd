/** citation_* meta (app/citation.ts). Requires Node 22.18+ or 23.6+ (type stripping). */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { citationMeta } from '../../app/citation.ts';

const project = {
  title: 'Economic Networks: Theory and Computation',
  authors: [{ name: 'Thomas J. Sargent' }, { name: 'John Stachurski' }],
  doi: '10.1017/9781009456340',
  venue: { title: 'QuantEcon' },
  downloads: [{ url: '/economic-networks.pdf', format: 'pdf' }],
};
const pairs = (tags) => tags.map((t) => `${t.name}=${t.content}`);

test('the cover cites the book', () => {
  assert.deepEqual(pairs(citationMeta({ project, origin: 'https://example.org' })), [
    'citation_title=Economic Networks: Theory and Computation',
    'citation_author=Thomas J. Sargent',
    'citation_author=John Stachurski',
    'citation_publisher=QuantEcon',
    'citation_doi=10.1017/9781009456340',
    'citation_pdf_url=https://example.org/economic-networks.pdf',
  ]);
});

test('a chapter cites itself in the book', () => {
  const tags = pairs(citationMeta({ project, chapterTitle: 'Production', url: 'https://example.org/ch-production/' }));
  assert.equal(tags[0], 'citation_title=Production');
  assert.equal(tags[1], 'citation_inbook_title=Economic Networks: Theory and Computation');
  assert.ok(tags.includes('citation_public_url=https://example.org/ch-production/'));
  // No origin: the PDF path is left as the site gives it.
  assert.ok(tags.includes('citation_pdf_url=/economic-networks.pdf'));
});

test('nothing without a title', () => {
  assert.deepEqual(citationMeta({ project: {} }), []);
});

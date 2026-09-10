/**
 * Unit tests for the social/SEO meta helpers (app/seo.ts, #92). Run with
 * `npm run test:unit` (node --test with type stripping, Node >= 23.6).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mergeMeta, ogLocale, siteOrigin, socialMetaTags } from '../../app/seo.ts';

const byKey = (tags) => Object.fromEntries(tags.map((t) => [t.property ?? t.name, t.content]));

test('siteOrigin: site_url wins and is reduced to an origin; domains are the fallback', () => {
  assert.equal(siteOrigin('https://python-programming.quantecon.org/'), 'https://python-programming.quantecon.org');
  assert.equal(siteOrigin('https://quantecon.github.io/lecture-python-programming.fa/'), 'https://quantecon.github.io');
  assert.equal(siteOrigin('example.org'), 'https://example.org');
  assert.equal(siteOrigin(undefined, ['python-programming.quantecon.org']), 'https://python-programming.quantecon.org');
  assert.equal(siteOrigin('', ['', ' example.org/ ']), 'https://example.org');
  assert.equal(siteOrigin(undefined, ['http://localhost:3000']), 'http://localhost:3000');
  assert.equal(siteOrigin(undefined, undefined), undefined);
  assert.equal(siteOrigin('   ', []), undefined);
});

test('ogLocale: BCP 47 to OpenGraph', () => {
  assert.equal(ogLocale('en'), 'en_US');
  assert.equal(ogLocale('zh-cn'), 'zh_CN');
  assert.equal(ogLocale('fa'), 'fa_IR');
  assert.equal(ogLocale('pt-BR'), 'pt_BR');
  assert.equal(ogLocale('xx'), 'xx');
  assert.equal(ogLocale(undefined), undefined);
});

test('the Sphinx set, on a lecture page with the site-level images', () => {
  const tags = byKey(
    socialMetaTags({
      siteTitle: 'Python Programming for Economics and Finance',
      pathname: '/python-by-example/',
      options: {
        site_url: 'https://python-programming.quantecon.org',
        twitter: 'quantecon',
        og_logo_url: 'https://assets.quantecon.org/img/qe-og-logo.png',
        twitter_logo_url: 'https://assets.quantecon.org/img/qe-twitter-logo.png',
        current_language: 'en',
      },
    }),
  );
  assert.deepEqual(tags, {
    'og:type': 'website',
    'og:site_name': 'Python Programming for Economics and Finance',
    'og:url': 'https://python-programming.quantecon.org/python-by-example/',
    'og:image': 'https://assets.quantecon.org/img/qe-og-logo.png',
    'twitter:site': '@quantecon',
    'twitter:card': 'summary',
    'twitter:image': 'https://assets.quantecon.org/img/qe-twitter-logo.png',
    'og:locale': 'en_US',
  });
});

test('a page thumbnail beats the site image for og:image; twitter:image follows the Twitter logo', () => {
  const tags = byKey(
    socialMetaTags({
      pathname: '/p',
      pageImage: '/thumb.png',
      options: { og_logo_url: 'https://x/og.png', twitter_logo_url: 'https://x/tw.png', twitter: '@qe' },
    }),
  );
  assert.equal(tags['og:image'], '/thumb.png');
  assert.equal(tags['twitter:image'], 'https://x/tw.png');
  assert.equal(tags['twitter:site'], '@qe');
});

test('nothing configured: only og:type, and no dangling twitter tags', () => {
  const tags = socialMetaTags({ pathname: '/p' });
  assert.deepEqual(tags, [{ property: 'og:type', content: 'website' }]);
});

test('mergeMeta replaces same-key upstream tags and keeps the rest in order', () => {
  const base = [
    { title: 'T' },
    { property: 'og:title', content: 'T' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { property: 'og:image', content: '/old.png' },
  ];
  const merged = mergeMeta(base, [
    { property: 'og:image', content: '/new.png' },
    { name: 'twitter:card', content: 'summary' },
    { property: 'og:type', content: 'website' },
  ]);
  assert.deepEqual(merged, [
    { title: 'T' },
    { property: 'og:title', content: 'T' },
    { property: 'og:image', content: '/new.png' },
    { name: 'twitter:card', content: 'summary' },
    { property: 'og:type', content: 'website' },
  ]);
});

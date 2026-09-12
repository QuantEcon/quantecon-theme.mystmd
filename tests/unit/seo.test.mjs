/**
 * Unit tests for the social/SEO meta helpers (app/seo.ts). Run with
 * `npm run test:unit` (node --test with type stripping, Node >= 23.6).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  absoluteImage,
  canonicalLink,
  mergeMeta,
  normalizeBaseurl,
  ogLocale,
  pageUrl,
  siteOrigin,
  socialMetaTags,
} from '../../app/seo.ts';

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

test('normalizeBaseurl: no trailing slash survives, and empty means absent', () => {
  // Whoever deploys the site writes BASE_URL by hand, so both spellings arrive.
  // Every consumer joins the result to a path that already starts with a slash
  // -- the head links build `${baseurl}/favicon.ico` and `${baseurl}/myst-theme.css`,
  // and the base-URL provider builds every in-site link -- so a surviving
  // trailing slash would double the separator in all of them.
  assert.equal(normalizeBaseurl('/lecture-wasm'), '/lecture-wasm');
  assert.equal(normalizeBaseurl('/lecture-wasm/'), '/lecture-wasm');
  assert.equal(normalizeBaseurl('/lecture-wasm//'), '/lecture-wasm');
  assert.equal(normalizeBaseurl('  /quantecon-theme.mystmd/pr-preview/pr-9/  '), '/quantecon-theme.mystmd/pr-preview/pr-9');
  // Undefined rather than '' for an absent value, so `baseurl && ...` guards in
  // the Document still tell absent from present.
  assert.equal(normalizeBaseurl(undefined), undefined);
  assert.equal(normalizeBaseurl(''), undefined);
  assert.equal(normalizeBaseurl('   '), undefined);
  assert.equal(normalizeBaseurl('/'), undefined);
});

test('ogLocale: BCP 47 to OpenGraph', () => {
  assert.equal(ogLocale('en'), 'en_US');
  assert.equal(ogLocale('zh-cn'), 'zh_CN');
  assert.equal(ogLocale('fa'), 'fa_IR');
  assert.equal(ogLocale('pt-BR'), 'pt_BR');
  assert.equal(ogLocale('xx'), 'xx');
  assert.equal(ogLocale(undefined), undefined);
});

test('the full set, on a lecture page with the site-level images', () => {
  const tags = byKey(
    socialMetaTags({
      siteTitle: 'Python Programming for Economics and Finance',
      url: 'https://python-programming.quantecon.org/python-by-example/',
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
      url: 'https://example.org/p/',
      pageImage: '/thumb.png',
      options: {
        site_url: 'https://example.org',
        og_logo_url: 'https://x/og.png',
        twitter_logo_url: 'https://x/tw.png',
        twitter: '@qe',
      },
    }),
  );
  // Made absolute: a scraper cannot resolve a root-relative path.
  assert.equal(tags['og:image'], 'https://example.org/thumb.png');
  assert.equal(tags['twitter:image'], 'https://x/tw.png');
  assert.equal(tags['twitter:site'], '@qe');
});

test('nothing configured: only og:type, and no dangling twitter tags', () => {
  const tags = socialMetaTags({});
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

const QE = 'https://quantecon.github.io';

test('pageUrl: the trailing-slash form, with and without a base URL', () => {
  const origin = 'https://python-programming.quantecon.org';
  assert.equal(pageUrl({ origin, pathname: '/about-py' }), `${origin}/about-py/`);
  assert.equal(pageUrl({ origin, pathname: '/about-py/' }), `${origin}/about-py/`);
  assert.equal(
    pageUrl({ origin: QE, pathname: '/short-path', baseurl: '/lecture-wasm' }),
    `${QE}/lecture-wasm/short-path/`,
  );
  // A trailing slash on the base is not doubled.
  assert.equal(
    pageUrl({ origin: QE, pathname: '/short-path', baseurl: '/lecture-wasm/' }),
    `${QE}/lecture-wasm/short-path/`,
  );
});

test('pageUrl: the base appears exactly once, whether or not the path carries it', () => {
  // At render time the path has no base; on the client the router has no
  // basename so it does. Both must give the same URL.
  for (const pathname of ['/short-path', '/lecture-wasm/short-path']) {
    const url = pageUrl({ origin: QE, pathname, baseurl: '/lecture-wasm' });
    assert.equal(url, `${QE}/lecture-wasm/short-path/`);
    assert.equal((url.match(/lecture-wasm/g) ?? []).length, 1);
  }
});

test('pageUrl: a page whose slug equals the base segment is not mistaken for the root', () => {
  // The base is stripped only as a `<base>/` prefix. At render time the path
  // is the bare page path, so an exact match is the page, not the site root.
  assert.equal(
    pageUrl({ origin: QE, pathname: '/notebook', baseurl: '/notebook' }),
    `${QE}/notebook/notebook/`,
  );
  // ...and the client path for that same page agrees.
  assert.equal(
    pageUrl({ origin: QE, pathname: '/notebook/notebook', baseurl: '/notebook' }),
    `${QE}/notebook/notebook/`,
  );
  // The home page of that site still resolves to the root.
  assert.equal(pageUrl({ origin: QE, pathname: '/notebook/', baseurl: '/notebook' }), `${QE}/notebook/`);
});

test('pageUrl: the home page is the site root, named by path or by index slug', () => {
  assert.equal(pageUrl({ origin: QE, pathname: '/', baseurl: '/lecture-wasm' }), `${QE}/lecture-wasm/`);
  // With a base URL the export renders the root index.html by requesting the
  // index slug, so that is the home page's render-time path -- and the slug's
  // own URL is not served.
  assert.equal(
    pageUrl({ origin: QE, pathname: '/intro', baseurl: '/lecture-wasm', indexSlug: 'intro' }),
    `${QE}/lecture-wasm/`,
  );
  assert.equal(pageUrl({ origin: QE, pathname: '/intro', indexSlug: 'intro' }), `${QE}/`);
  // A different page is unaffected by the index slug.
  assert.equal(
    pageUrl({ origin: QE, pathname: '/introduction', indexSlug: 'intro' }),
    `${QE}/introduction/`,
  );
});

test('pageUrl: a project home page resolves to the project root, not the site root', () => {
  // On a site whose projects carry a slug, the export renders the project's
  // own index.html by requesting `<projectSlug>/<indexSlug>` and writes it as
  // `<projectSlug>/index.html`, so the served URL is the project root.
  assert.equal(
    pageUrl({
      origin: QE,
      pathname: '/alpha/index',
      baseurl: '/lecture-wasm',
      projectSlug: 'alpha',
      indexSlug: 'index',
    }),
    `${QE}/lecture-wasm/alpha/`,
  );
  // Without a base URL the same project home is requested at its slug.
  assert.equal(
    pageUrl({ origin: QE, pathname: '/alpha', projectSlug: 'alpha', indexSlug: 'index' }),
    `${QE}/alpha/`,
  );
  // Any other page of that project keeps its own path.
  assert.equal(
    pageUrl({
      origin: QE,
      pathname: '/alpha/page1',
      baseurl: '/lecture-wasm',
      projectSlug: 'alpha',
      indexSlug: 'index',
    }),
    `${QE}/lecture-wasm/alpha/page1/`,
  );
});

test('pageUrl: nothing without an origin, as Sphinx emits nothing without html_baseurl', () => {
  assert.equal(pageUrl({ pathname: '/about-py' }), undefined);
  assert.equal(pageUrl({ origin: undefined, pathname: '/', baseurl: '/x' }), undefined);
});

test('canonicalLink: a link descriptor, or nothing', () => {
  assert.deepEqual(canonicalLink('https://example.org/p/'), [
    { tagName: 'link', rel: 'canonical', href: 'https://example.org/p/' },
  ]);
  assert.deepEqual(canonicalLink(undefined), []);
});

test('absoluteImage: only root-relative paths take the origin', () => {
  assert.equal(absoluteImage('/build/graph.png', 'https://example.org'), 'https://example.org/build/graph.png');
  assert.equal(absoluteImage('https://cdn.example/og.png', 'https://example.org'), 'https://cdn.example/og.png');
  assert.equal(absoluteImage('/build/graph.png', undefined), '/build/graph.png');
  assert.equal(absoluteImage(undefined, 'https://example.org'), undefined);
  // A protocol-relative URL names its own host: it starts with a slash but is
  // not a path on this site, so prefixing the origin would break it.
  assert.equal(absoluteImage('//assets.example.org/og.png', 'https://example.org'), '//assets.example.org/og.png');
});

test('og:url comes from the same URL the canonical link uses', () => {
  const url = pageUrl({
    origin: 'https://quantecon.github.io',
    pathname: '/short-path',
    baseurl: '/lecture-wasm',
  });
  const tags = byKey(socialMetaTags({ url, options: { site_url: 'https://quantecon.github.io' } }));
  assert.equal(tags['og:url'], url);
  assert.equal(canonicalLink(url)[0].href, url);
});

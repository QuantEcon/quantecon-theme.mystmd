/**
 * Unit tests for the multilingual helpers (app/i18n.ts): option parsing for
 * the YAML-block string form, the book-theme resolution rules for people and
 * labels, and the cross-edition URLs behind the language switcher and the
 * hreflang alternates. Plain TypeScript with no React, run under `node --test`
 * with type stripping like launch-urls.test.mjs (Node >= 23.6).
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  frontmatterPeople,
  hreflangLinks,
  htmlDir,
  htmlLang,
  languageHref,
  normaliseLanguages,
  normalisePeople,
  parseStructured,
  resolveLabel,
  resolvePeople,
  stripBaseurl,
} from '../../app/i18n.ts';

const LANGS_YAML = `
- code: en
  name: English
  url: https://python-programming.quantecon.org/
- code: fa
  name: فارسی
  url: https://quantecon.github.io/lecture-python-programming.fa
`;

test('parseStructured: strings are YAML, lists pass through, empty is []', () => {
  assert.deepEqual(parseStructured('- a\n- b'), ['a', 'b']);
  assert.deepEqual(parseStructured('[{"name": "x"}]'), [{ name: 'x' }]);
  assert.deepEqual(parseStructured([{ name: 'x' }]), [{ name: 'x' }]);
  assert.deepEqual(parseStructured('   '), []);
  assert.equal(parseStructured(undefined), undefined);
  assert.equal(parseStructured('- a\n b: [unclosed'), undefined);
});

test('normaliseLanguages: needs code, name and url, two or more entries, no trailing slash', () => {
  const langs = normaliseLanguages(LANGS_YAML);
  assert.equal(langs.length, 2);
  assert.equal(langs[0].url, 'https://python-programming.quantecon.org');
  assert.equal(langs[1].name, 'فارسی');
  // A real list works the same way.
  assert.equal(normaliseLanguages(parseStructured(LANGS_YAML)).length, 2);
  // One valid entry is not a switcher.
  assert.deepEqual(normaliseLanguages('- code: en\n  name: English\n  url: https://x'), []);
  // Entries missing a field are dropped, which can take the count below two.
  assert.deepEqual(
    normaliseLanguages('- code: en\n  name: English\n  url: https://x\n- code: fa\n  name: فارسی'),
    [],
  );
  assert.deepEqual(normaliseLanguages(undefined), []);
  assert.deepEqual(normaliseLanguages('not a list'), []);
});

test('normalisePeople: mappings, plain names, a single entry; nameless dropped', () => {
  assert.deepEqual(normalisePeople('- name: A\n  url: https://a\n- name: B'), [
    { name: 'A', url: 'https://a' },
    { name: 'B' },
  ]);
  assert.deepEqual(normalisePeople(['A', { name: 'B' }]), [{ name: 'A' }, { name: 'B' }]);
  assert.deepEqual(normalisePeople('Solo'), [{ name: 'Solo' }]);
  assert.deepEqual(normalisePeople({ name: 'One', url: 'https://one' }), [{ name: 'One', url: 'https://one' }]);
  assert.deepEqual(normalisePeople([{ url: 'https://nobody' }, { name: '  ' }]), []);
  assert.deepEqual(normalisePeople(''), []);
  assert.deepEqual(normalisePeople(undefined), []);
});

test('frontmatterPeople: strict list-of-mappings override, explicit empty suppresses', () => {
  assert.deepEqual(frontmatterPeople(''), []);
  assert.deepEqual(frontmatterPeople(null), []);
  assert.deepEqual(frontmatterPeople([]), []);
  assert.deepEqual(frontmatterPeople('- name: P'), [{ name: 'P' }]);
  // Not a list of mappings: left alone (inherit).
  assert.equal(frontmatterPeople('Jane Doe, John Roe'), undefined);
  assert.equal(frontmatterPeople(['A', 'B']), undefined);
  // A mapping without a usable name is left alone too.
  assert.equal(frontmatterPeople([{ given: 'A', family: 'B' }]), undefined);
});

test('resolvePeople: page replaces, absent inherits, empty suppresses, unreadable inherits', () => {
  const site = { translators: '- name: Site' };
  assert.deepEqual(resolvePeople(undefined, site, 'translators'), {
    people: [{ name: 'Site' }],
    suppressed: false,
  });
  assert.deepEqual(resolvePeople({ translators: '- name: Page' }, site, 'translators'), {
    people: [{ name: 'Page' }],
    suppressed: false,
  });
  assert.deepEqual(resolvePeople({ translators: '' }, site, 'translators'), {
    people: [],
    suppressed: true,
  });
  assert.deepEqual(resolvePeople({ translators: 'Not, readable' }, site, 'translators'), {
    people: [{ name: 'Site' }],
    suppressed: false,
  });
});

test('resolveLabel: page first, then site, then fallback; empty is empty', () => {
  assert.equal(resolveLabel(undefined, undefined, 'translators_label', 'Translated by'), 'Translated by');
  assert.equal(resolveLabel(undefined, { translators_label: '译者' }, 'translators_label', 'x'), '译者');
  assert.equal(resolveLabel({ translators_label: 'مترجم' }, { translators_label: '译者' }, 'translators_label', 'x'), 'مترجم');
  assert.equal(resolveLabel({ translators_label: '' }, { translators_label: '译者' }, 'translators_label', 'x'), '');
  assert.equal(resolveLabel({ translators_label: null }, undefined, 'translators_label', 'x'), '');
});

test('htmlLang / htmlDir', () => {
  assert.equal(htmlLang(undefined), 'en');
  assert.equal(htmlLang({ current_language: ' fa ' }), 'fa');
  assert.equal(htmlDir({ enable_rtl: true }), 'rtl');
  assert.equal(htmlDir({}), undefined);
});

test('stripBaseurl / languageHref: static-build prefix comes off, root joins as a slash', () => {
  assert.equal(stripBaseurl('/lecture-x/intro', '/lecture-x'), '/intro');
  assert.equal(stripBaseurl('/lecture-x', '/lecture-x/'), '/');
  assert.equal(stripBaseurl('/intro', undefined), '/intro');
  assert.equal(stripBaseurl('', undefined), '/');
  const fa = { code: 'fa', name: 'فارسی', url: 'https://example.org/fa' };
  assert.equal(languageHref(fa, '/intro'), 'https://example.org/fa/intro');
  assert.equal(languageHref(fa, '/'), 'https://example.org/fa/');
  assert.equal(languageHref(fa, '/lecture-x/intro', '/lecture-x'), 'https://example.org/fa/intro');
});

test('hreflangLinks: one per edition plus x-default on the first; none below two', () => {
  const links = hreflangLinks({ languages: LANGS_YAML }, '/intro');
  assert.deepEqual(
    links.map((l) => [l.hrefLang, l.href]),
    [
      ['en', 'https://python-programming.quantecon.org/intro'],
      ['fa', 'https://quantecon.github.io/lecture-python-programming.fa/intro'],
      ['x-default', 'https://python-programming.quantecon.org/intro'],
    ],
  );
  assert.ok(links.every((l) => l.tagName === 'link' && l.rel === 'alternate'));
  assert.deepEqual(hreflangLinks({}, '/intro'), []);
});

/**
 * Multilingual editions: the language switcher and `hreflang` alternates
 * (Phase 4, #90), document direction (Phase 5, #91) and translator credit
 * (#143). Pure TypeScript with no React, so tests/unit/i18n.test.mjs runs it
 * under `node --test` with type stripping, the way launchUrls.ts is tested.
 *
 * WHY THE LISTS ARE STRINGS
 *
 * The CLI validates `site.options` against template.yml and drops every key
 * the template does not declare (myst-templates `validateTemplateOptions`),
 * and the only types a template can declare are boolean, string, number,
 * choice and file. A list of languages cannot be declared, so `languages` and
 * `translators` are declared as strings and written as a YAML block:
 *
 *     languages: |
 *       - code: en
 *         name: English
 *         url: https://python-programming.quantecon.org
 *
 * `parseStructured` turns that back into a list. A real list is accepted as
 * it is, so nothing here changes if the engine ever passes lists through. A
 * page's `site:` frontmatter goes through the same validation, so the same
 * form applies there.
 *
 * The shapes and the resolution rules are quantecon-book-theme's
 * (`_process_languages`, `_normalise_people`, `_resolve_people`,
 * `_resolve_label` in its __init__.py), so a translated edition configures the
 * two themes with the same values.
 */
import { parse as parseYaml } from 'yaml';

export interface Language {
  code: string;
  name: string;
  url: string;
}

export interface Person {
  name: string;
  url?: string;
}

export interface I18nOptions {
  current_language?: string;
  enable_rtl?: boolean;
  languages?: unknown;
  translators?: unknown;
  translators_label?: string;
  language_switcher_label?: string;
}

export const DEFAULT_TRANSLATORS_LABEL = 'Translated by';
export const DEFAULT_SWITCHER_LABEL = 'Switch language';

/**
 * A structured option as the theme receives it: a list or object passes
 * through, a string is parsed as YAML (JSON is valid YAML), an empty string
 * is an explicit empty list, and unparseable text is `undefined`.
 */
export function parseStructured(raw: unknown): unknown {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'string') return raw;
  const text = raw.trim();
  if (!text) return [];
  try {
    return parseYaml(text);
  } catch {
    return undefined;
  }
}

function asString(value: unknown): string {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value : String(value);
}

/**
 * The languages to offer. Entries need all of `code`, `name` and `url`;
 * trailing slashes come off the URL so page paths join cleanly. Fewer than two
 * valid entries means no switcher and no alternates, as in the book theme.
 */
export function normaliseLanguages(raw: unknown): Language[] {
  const value = parseStructured(raw);
  if (!Array.isArray(value)) return [];
  const languages: Language[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const { code, name, url } = item as Record<string, unknown>;
    if (typeof code !== 'string' || typeof name !== 'string' || typeof url !== 'string') continue;
    if (!code.trim() || !name.trim() || !url.trim()) continue;
    languages.push({
      code: code.trim(),
      name: name.trim(),
      url: url.trim().replace(/\/+$/, ''),
    });
  }
  return languages.length > 1 ? languages : [];
}

/**
 * Coerce a people value into `{name, url?}` entries: the documented list of
 * mappings, a list of plain names, a single mapping or a single name. Entries
 * without a usable name are dropped.
 */
export function normalisePeople(raw: unknown): Person[] {
  let value = parseStructured(raw);
  if (value === undefined || value === null) return [];
  if (typeof value === 'string' || (typeof value === 'object' && !Array.isArray(value))) {
    value = [value];
  }
  if (!Array.isArray(value)) return [];
  const people: Person[] = [];
  for (const item of value) {
    let name: unknown;
    let url: unknown;
    if (typeof item === 'string') {
      name = item;
    } else if (item && typeof item === 'object' && !Array.isArray(item)) {
      name = (item as Record<string, unknown>).name;
      url = (item as Record<string, unknown>).url;
    } else {
      continue;
    }
    const n = asString(name);
    const u = asString(url);
    if (!n.trim()) continue;
    people.push(u ? { name: n, url: u } : { name: n });
  }
  return people;
}

/**
 * A page-level people value, or `undefined` when the page value is not one
 * this theme should act on. Stricter than the site option on purpose: only an
 * explicit empty value suppresses the block, and only a list of mappings that
 * all carry names counts as an override. Anything else is left alone so the
 * project-level credit still renders.
 */
export function frontmatterPeople(value: unknown): Person[] | undefined {
  if (value === undefined || value === null) return [];
  if (typeof value === 'string' && !value.trim()) return [];
  const parsed = parseStructured(value);
  if (parsed === undefined || parsed === null) return undefined;
  if (Array.isArray(parsed) && parsed.length === 0) return [];
  if (!Array.isArray(parsed)) return undefined;
  if (!parsed.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
    return undefined;
  }
  const people = normalisePeople(parsed);
  return people.length === parsed.length ? people : undefined;
}

/**
 * The people to credit on one page. A page value replaces the site value
 * outright (never merges); an absent key inherits. `suppressed` is true when
 * the page said "nobody", which keeps the block off that page rather than
 * falling back to the site-wide credit.
 */
export function resolvePeople(
  pageOptions: Record<string, unknown> | undefined,
  siteOptions: Record<string, unknown> | undefined,
  key: string,
): { people: Person[]; suppressed: boolean } {
  if (pageOptions && key in pageOptions) {
    const people = frontmatterPeople(pageOptions[key]);
    if (people !== undefined) return { people, suppressed: people.length === 0 };
  }
  return { people: normalisePeople(siteOptions?.[key]), suppressed: false };
}

/**
 * A label, page value first, then the site option, then the fallback. An
 * explicit empty value is an empty label (rendered as no label at all).
 */
export function resolveLabel(
  pageOptions: Record<string, unknown> | undefined,
  siteOptions: Record<string, unknown> | undefined,
  key: string,
  fallback: string,
): string {
  const source =
    pageOptions && key in pageOptions ? pageOptions : siteOptions && key in siteOptions ? siteOptions : undefined;
  if (!source) return fallback;
  return asString(source[key]);
}

/** The document language: the edition's code, or English when unset. */
export function htmlLang(options?: I18nOptions): string {
  const code = options?.current_language?.trim();
  return code || 'en';
}

/** The document direction: `rtl` when the edition opts in, else unset. */
export function htmlDir(options?: I18nOptions): 'rtl' | undefined {
  return options?.enable_rtl ? 'rtl' : undefined;
}

/**
 * The site-relative path of the current page. Static builds prefix every
 * route with the site's base URL, which is not part of the page's identity
 * across editions.
 */
export function stripBaseurl(pathname: string, baseurl?: string): string {
  let path = pathname || '/';
  const base = baseurl?.replace(/\/+$/, '');
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

/** The same page in another edition: that edition's site root plus the page path. */
export function languageHref(language: Language, pathname: string, baseurl?: string): string {
  return `${language.url}${stripBaseurl(pathname, baseurl)}`;
}

export interface AlternateLink {
  tagName: 'link';
  rel: 'alternate';
  hrefLang: string;
  href: string;
  // Remix's meta descriptor type is an open record; the index signature lets
  // these spread into a route's `meta` return without a cast.
  [key: string]: unknown;
}

/**
 * `<link rel="alternate" hreflang>` descriptors for the page, one per
 * edition plus `x-default` on the first, in the shape Remix's v2 `meta`
 * renders. Empty when fewer than two editions are configured.
 */
export function hreflangLinks(
  options: I18nOptions | undefined,
  pathname: string,
  baseurl?: string,
): AlternateLink[] {
  const languages = normaliseLanguages(options?.languages);
  if (languages.length === 0) return [];
  const link = (hrefLang: string, language: Language): AlternateLink => ({
    tagName: 'link',
    rel: 'alternate',
    hrefLang,
    href: languageHref(language, pathname, baseurl),
  });
  return [...languages.map((l) => link(l.code, l)), link('x-default', languages[0])];
}

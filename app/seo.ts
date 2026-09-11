/**
 * Social / SEO meta tags: the OpenGraph and Twitter card tags this theme adds
 * on top of what @myst-theme/site's `getMetaTagsForArticle` already produces
 * (title, description, keywords, og:title/description/url/image,
 * twitter:card/creator/title/description/image/alt).
 *
 * What upstream's set leaves out, sets differently, or emits where it never
 * renders:
 *
 *   og:type        "website" on every page, lecture pages included. "article"
 *                  would be the usual choice for a page with a byline, but it
 *                  commits to `article:published_time` / `author` / `section`
 *                  metadata the lectures do not carry, and the deployed sites
 *                  declare "website" throughout
 *   og:site_name   the site title
 *   og:url         upstream needs an `origin`, which the routes never had.
 *                  It comes from the `site_url` option; `site.domains` would
 *                  be the natural source, but the CLI's site manifest does
 *                  not carry it, so it is only a fallback should that change.
 *                  Built by `pageUrl`, the same function as the canonical
 *                  link, so the two cannot disagree
 *   canonical      a `<link>`, not a meta tag, but built from the same URL
 *   og:image       `og_logo_url` when the page has no thumbnail, made absolute
 *                  against the site origin: a social scraper cannot resolve a
 *                  root-relative path
 *   twitter:image  `twitter_logo_url` when set, even over a page thumbnail;
 *                  otherwise the og:image
 *   twitter:card   "summary" whenever `twitter` is set, in place of upstream's
 *                  own card type
 *   twitter:site   upstream puts it in the root route's meta, which Remix v2
 *                  replaces with the article route's, so it never renders
 *   og:locale      from `current_language`, when set
 *
 * Pure TypeScript with no React; tests/unit/seo.test.mjs runs it under
 * `node --test` with type stripping like the other helpers.
 */
import type { V2_MetaDescriptor } from '@remix-run/react';

export interface SeoSiteOptions {
  site_url?: string;
  twitter?: string;
  og_logo_url?: string;
  twitter_logo_url?: string;
  current_language?: string;
}

export interface SeoInput {
  /** `site.domains` from myst.yml, if the manifest ever carries it; `options.site_url` is the real source. */
  domains?: string[];
  /** Site title, for og:site_name. */
  siteTitle?: string;
  /** The page's own image, if any (thumbnail); site-level images fill in. */
  pageImage?: string;
  /** The page's public URL, from `pageUrl`; og:url is omitted without one. */
  url?: string;
  options?: SeoSiteOptions;
}

export interface PageUrlInput {
  /** Site origin, from `siteOrigin`. Without it there is no public URL. */
  origin?: string;
  /** The page's render-time path, which may or may not carry the base URL. */
  pathname: string;
  /** The static build's base URL, if the site has one. */
  baseurl?: string;
  /** `project.slug`, on a site whose projects are not at the site root. */
  projectSlug?: string;
  /** `project.index`: the slug whose page the project's root serves. */
  indexSlug?: string;
}

/**
 * The page's public URL. The canonical link and og:url are both built here, so
 * that the two rules below apply to both and they cannot drift apart.
 *
 * The home page resolves to the site root. With a base URL, mystmd renders the
 * root `index.html` by requesting the index slug, so the page's render-time
 * path is that slug -- and the slug's own URL is not served at all, so naming
 * it would point every home page at a 404.
 *
 * Every URL takes the trailing-slash form, which is what the export writes
 * (`<slug>/index.html`) and what a host redirects the slashless form to; a URL
 * taken straight from the render-time path would name a redirect.
 *
 * Returns undefined when the site sets no `site_url`, as Sphinx emits nothing
 * without `html_baseurl`.
 */
export function pageUrl({
  origin,
  pathname,
  baseurl,
  projectSlug,
  indexSlug,
}: PageUrlInput): string | undefined {
  if (!origin) return undefined;
  const base = (baseurl ?? '').trim().replace(/\/+$/, '');

  // The base is stripped only where it is a real prefix -- `<base>/...` -- and
  // never on an exact match. The browser router has no basename, so on the
  // client the path carries the base and has to lose it before it is
  // re-applied; at render time it does not carry it at all, and a page whose
  // own slug happens to equal the base segment would otherwise be mistaken
  // for the site root and canonicalised onto it.
  let path = pathname || '/';
  if (base && path.startsWith(`${base}/`)) path = path.slice(base.length);
  const slug = trim(path);

  // The project's root, which serves the index page. With a base URL the
  // export renders that page by requesting the index slug -- under the
  // project's own slug when it has one -- and writes it as the root's
  // index.html, so the render-time path is that slug and its own URL is not
  // served at all.
  const project = trim(projectSlug ?? '');
  const home = [project, indexSlug].filter(Boolean).join('/');
  let tail: string;
  if (slug === '') tail = '/';
  else if (indexSlug && slug === home) tail = project ? `/${project}/` : '/';
  else tail = `/${slug}/`;
  return `${origin}${base}${tail}`;
}

export interface CanonicalLink {
  tagName: 'link';
  rel: 'canonical';
  href: string;
  // Remix's meta descriptor type is an open record; the index signature lets
  // this spread into a route's `meta` return without a cast, as the hreflang
  // alternates do.
  [key: string]: unknown;
}

/**
 * `<link rel="canonical">` for the page, in the shape Remix's v2 `meta`
 * renders. Empty without a URL, so a site that sets no `site_url` emits
 * nothing -- what Sphinx does without `html_baseurl`.
 */
export function canonicalLink(url?: string): CanonicalLink[] {
  return url ? [{ tagName: 'link', rel: 'canonical', href: url }] : [];
}

/**
 * An image URL a social scraper can fetch: root-relative paths take the origin.
 * A protocol-relative URL already names its own host, so it is left alone --
 * it begins with a slash but is not a path on this site.
 */
export function absoluteImage(image?: string, origin?: string): string | undefined {
  if (!image) return undefined;
  if (!origin || !image.startsWith('/') || image.startsWith('//')) return image;
  return `${origin}${image}`;
}

/**
 * The canonical origin: `site_url` (an absolute URL, trailing slash and path
 * dropped to the origin), else `https://<first domain>` -- the CLI validates
 * domains as bare hosts.
 */
export function siteOrigin(siteUrl?: string, domains?: string[]): string | undefined {
  const fromOption = siteUrl?.trim();
  if (fromOption) {
    try {
      return new URL(/^https?:\/\//i.test(fromOption) ? fromOption : `https://${fromOption}`).origin;
    } catch {
      // fall through to domains
    }
  }
  const host = domains?.find((d) => typeof d === 'string' && d.trim());
  if (!host) return undefined;
  const h = host.trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(h) ? h : `https://${h}`;
}

const trim = (value: string): string => value.replace(/^\/+|\/+$/g, '');

function handle(twitter?: string): string | undefined {
  const t = twitter?.trim().replace(/^@/, '');
  return t ? `@${t}` : undefined;
}

/** BCP 47 code to an OpenGraph locale (`en` -> `en_US`, `zh-cn` -> `zh_CN`). */
export function ogLocale(code?: string): string | undefined {
  const c = code?.trim();
  if (!c) return undefined;
  const [lang, region] = c.split(/[-_]/);
  if (!lang) return undefined;
  if (region) return `${lang.toLowerCase()}_${region.toUpperCase()}`;
  const defaults: Record<string, string> = { en: 'en_US', fa: 'fa_IR', fr: 'fr_FR', zh: 'zh_CN', es: 'es_ES', ja: 'ja_JP' };
  return defaults[lang.toLowerCase()] ?? lang.toLowerCase();
}

/**
 * The tags to add to (or replace in) upstream's article set. Applied by
 * `mergeMeta`, which drops an upstream tag with the same name/property first,
 * so a site-level image does not sit beside a missing page image and
 * twitter:image follows the site's Twitter logo when one is configured.
 */
export function socialMetaTags({ domains, siteTitle, pageImage, url, options }: SeoInput): V2_MetaDescriptor[] {
  const origin = siteOrigin(options?.site_url, domains);
  const image = absoluteImage(pageImage || options?.og_logo_url, origin);
  const twitterImage = absoluteImage(options?.twitter_logo_url, origin) || image;
  const tags: V2_MetaDescriptor[] = [{ property: 'og:type', content: 'website' }];
  if (siteTitle) tags.push({ property: 'og:site_name', content: siteTitle });
  if (url) tags.push({ property: 'og:url', content: url });
  if (image) tags.push({ property: 'og:image', content: image });
  const site = handle(options?.twitter);
  if (site) {
    tags.push({ name: 'twitter:site', content: site });
    tags.push({ name: 'twitter:card', content: 'summary' });
  }
  if (twitterImage && (site || twitterImage !== absoluteImage(pageImage, origin))) {
    tags.push({ name: 'twitter:image', content: twitterImage });
  }
  const locale = ogLocale(options?.current_language);
  if (locale) tags.push({ property: 'og:locale', content: locale });
  return tags;
}

function key(tag: V2_MetaDescriptor): string | undefined {
  const t = tag as Record<string, unknown>;
  if (typeof t.property === 'string') return `property:${t.property}`;
  if (typeof t.name === 'string') return `name:${t.name}`;
  return undefined;
}

/** `additions` win over `base` on the same name/property; order otherwise kept. */
export function mergeMeta(base: V2_MetaDescriptor[], additions: V2_MetaDescriptor[]): V2_MetaDescriptor[] {
  const replaced = new Set(additions.map(key).filter((k): k is string => !!k));
  return [...base.filter((t) => !replaced.has(key(t) ?? '')), ...additions];
}

/**
 * Social / SEO meta tags (Phase 6, #92) -- the full OpenGraph and Twitter
 * card set the Sphinx lecture sites emit, on top of what @myst-theme/site's
 * `getMetaTagsForArticle` already produces (title, description, keywords,
 * og:title/description/url/image, twitter:card/creator/title/description/
 * image/alt).
 *
 * What upstream leaves out, and the Sphinx sites ship on every page:
 *
 *   og:type        "website" (Sphinx: every lecture page)
 *   og:site_name   the site title
 *   og:url         upstream needs an `origin`, which the routes never had.
 *                  It comes from the `site_url` option (the Sphinx sites'
 *                  `html_baseurl`); `site.domains` would be the natural
 *                  source, but the CLI's site manifest does not carry it, so
 *                  it is only a fallback should that change
 *   og:image /     a site-level image when the page has no thumbnail --
 *   twitter:image  `og_logo_url` and `twitter_logo_url`, the book theme's
 *                  option names, so a lecture repo copies its values across
 *   twitter:site   upstream puts it in the root route's meta, which Remix v2
 *                  replaces with the article route's, so it never rendered
 *   og:locale      from `current_language` (Phase 4), when set
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
  /** Path of the page, including the static build's base URL. */
  pathname: string;
  options?: SeoSiteOptions;
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
export function socialMetaTags({ domains, siteTitle, pageImage, pathname, options }: SeoInput): V2_MetaDescriptor[] {
  const origin = siteOrigin(options?.site_url, domains);
  const image = pageImage || options?.og_logo_url;
  const twitterImage = options?.twitter_logo_url || image;
  const tags: V2_MetaDescriptor[] = [{ property: 'og:type', content: 'website' }];
  if (siteTitle) tags.push({ property: 'og:site_name', content: siteTitle });
  if (origin) tags.push({ property: 'og:url', content: `${origin}${pathname}` });
  if (image) tags.push({ property: 'og:image', content: image });
  const site = handle(options?.twitter);
  if (site) {
    tags.push({ name: 'twitter:site', content: site });
    tags.push({ name: 'twitter:card', content: 'summary' });
  }
  if (twitterImage && (site || twitterImage !== pageImage)) {
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

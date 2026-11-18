import fetch from "node-fetch";
import type { SiteManifest } from "myst-config";
import {
  MYST_SPEC_VERSION,
  type PageLoader,
  getFooterLinks,
  getProject,
  normalizeBaseURL,
  updatePageStaticLinksInplace,
  updateSiteManifestStaticLinksInplace,
} from "@myst-theme/common";
import { redirect } from "react-router";
import {
  responseNoArticle,
  responseNoSite,
  getDomainFromRequest,
} from "@myst-theme/site";
import type { MystSearchIndex } from "@myst-theme/search";
import { slugToUrl } from "myst-common";
import { migrate } from "myst-migrate";
// Inlined into the build as a data URL, so the default favicon needs no file
// lookup at run time -- the server, the renderer and the dev server each find
// their files in a different place.
import defaultFaviconDataUrl from "../../public/logos/lectures-favicon.png?inline";

const CONTENT_CDN_PORT = process.env.CONTENT_CDN_PORT ?? "3100";
const CONTENT_CDN = normalizeBaseURL(
  process.env.CONTENT_CDN ?? `http://localhost:${CONTENT_CDN_PORT}`
);
const BASE_URL = `${normalizeBaseURL(process.env.BASE_URL ?? "")}/`;

type LinkRewriteOptions = { rewriteStaticFolder?: boolean };

/** A file on the content server, for the `_public/*` route. */
export function getCDNUrl(path: string): string {
  return `${CONTENT_CDN}/${path}`;
}

export async function getConfig(
  opts?: LinkRewriteOptions
): Promise<SiteManifest> {
  const url = `${CONTENT_CDN}/config.json`;
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) {
    throw new Error(`No site configuration found at ${url}`);
  }
  const data = (await response.json()) as SiteManifest;
  return updateSiteManifestStaticLinksInplace(data, (url) =>
    updateLink(url, opts)
  );
}

/**
 * Point a page's static file (an image, a download) at where the reader will
 * fetch it from: the content server under `myst start`, or the `_public/`
 * folder the static renderer writes every public file into (served through
 * the `[_public].$` route when MYST_HIDE_CDN is set).
 */
function updateLink(
  url: string,
  {
    rewriteStaticFolder = !!import.meta.env.VITE_BUILD_HTML ||
      process.env.MYST_HIDE_CDN !== undefined,
  }: LinkRewriteOptions = {}
) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol.startsWith("http")) return url;
  } catch {
    // pass
  }
  if (rewriteStaticFolder) {
    return `${BASE_URL}_public${url}`;
  }
  return `${CONTENT_CDN}${url}`;
}

async function getStaticContent(
  project?: string,
  slug?: string
): Promise<PageLoader | null> {
  if (!slug) return null;
  const projectSlug = project ? `${project}/` : "";
  const url = `${CONTENT_CDN}/content/${projectSlug}${slug}.json`;
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  let data = (await response.json()) as PageLoader & { version?: number };
  // Bring content from an older or newer mystmd to the AST version this
  // release of @myst-theme renders.
  try {
    data = (await migrate(
      { version: data.version ?? 0, ...data },
      { to: MYST_SPEC_VERSION }
    )) as PageLoader & { version: number };
  } catch (error) {
    console.error(`Error migrating content for ${projectSlug}${slug} (aborted):`, error);
  }
  return updatePageStaticLinksInplace(data, updateLink);
}

export async function getPage(
  request: Request,
  opts: {
    project?: string;
    loadIndexPage?: boolean;
    slug?: string;
    redirect?: boolean;
  }
): Promise<PageLoader> {
  const projectName = opts.project;
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config, projectName);
  if (!project) throw responseNoArticle();
  if (opts.slug === project.index && opts.redirect) {
    throw redirect(projectName ? `/${projectName}` : "/");
  }
  if (opts.slug?.endsWith(".index") && opts.redirect) {
    const newSlug = slugToUrl(opts.slug);
    throw redirect(projectName ? `/${projectName}/${newSlug}` : `/${newSlug}`);
  }
  let slug =
    opts.loadIndexPage || opts.slug == null ? project.index : opts.slug;
  let loader = await getStaticContent(projectName, slug).catch(() => null);
  if (!loader) {
    slug = `${slug}.index`;
    loader = await getStaticContent(projectName, slug).catch(() => null);
    if (!loader) throw responseNoArticle();
  }
  const footer = getFooterLinks(config, projectName, slug);
  return {
    ...loader,
    footer,
    domain: getDomainFromRequest(request),
    project: projectName,
  };
}

/**
 * The content server's URL for a path, if it serves a file there, or null.
 * Under `myst start` this is how a project's `static_files` are reached.
 */
export async function getStaticFileUrl(pathname: string): Promise<string | null> {
  const url = `${CONTENT_CDN}${pathname}`;
  const response = await fetch(url, { method: "HEAD" }).catch(() => null);
  if (!response || !response.ok) return null;
  return url;
}

export async function getObjectsInv(): Promise<Buffer | null> {
  const url = `${CONTENT_CDN}/objects.inv`;
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return response.buffer();
}

export async function getMystXrefJson(): Promise<Record<string, any> | null> {
  const url = `${CONTENT_CDN}/myst.xref.json`;
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  const xrefs = (await response.json()) as Record<string, any>;
  xrefs.references?.forEach((ref: any) => {
    ref.data = ref.data?.replace(/^\/content/, "");
  });
  return xrefs;
}

export async function getMystSearchJson(): Promise<MystSearchIndex | null> {
  const url = `${CONTENT_CDN}/myst.search.json`;
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return (await response.json()) as MystSearchIndex;
}

/**
 * The QuantEcon lectures favicon, served when no `favicon` option is set.
 * It lives under public/logos/ rather than at public/favicon.ico: a static
 * file at that path is served ahead of the `[favicon.ico]` route, so the
 * `favicon` site option would never take effect.
 */
const DEFAULT_FAVICON = {
  contentType: "image/png",
  buffer: Buffer.from(defaultFaviconDataUrl.split(",")[1], "base64"),
};

export async function getFavicon(): Promise<{
  contentType: string | null;
  buffer: Buffer;
} | null> {
  // We are always fetching this at run time, so we don't want the rewritten links
  const config = await getConfig({ rewriteStaticFolder: false });
  // A declared `file` option: the CLI copied the site's file into its public
  // folder and getConfig rewrote the path onto the content server.
  const url = config.options?.favicon;
  if (!url) return DEFAULT_FAVICON;
  return fetchFavicon(url);
}

async function fetchFavicon(url: string) {
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return {
    contentType: response.headers.get("Content-Type"),
    buffer: await response.buffer(),
  };
}

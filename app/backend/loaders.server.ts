import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";
import type { SiteManifest } from "myst-config";
import {
  type PageLoader,
  getFooterLinks,
  getProject,
  updatePageStaticLinksInplace,
  updateSiteManifestStaticLinksInplace,
} from "@myst-theme/common";
import { redirect } from "@remix-run/node";
import {
  responseNoArticle,
  responseNoSite,
  getDomainFromRequest,
} from "@myst-theme/site";
import type { MystSearchIndex } from "@myst-theme/search";
import { slugToUrl } from "myst-common";

const CONTENT_CDN_PORT = process.env.CONTENT_CDN_PORT ?? "3100";
const CONTENT_CDN =
  process.env.CONTENT_CDN ?? `http://localhost:${CONTENT_CDN_PORT}`;

type LinkRewriteOptions = { rewriteStaticFolder?: boolean };

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

function updateLink(
  url: string,
  {
    rewriteStaticFolder = process.env.MODE === "static",
  }: LinkRewriteOptions = {}
) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol.startsWith("http")) return url;
  } catch (error) {
    // pass
  }
  if (rewriteStaticFolder) {
    return `/myst_assets_folder${url}`;
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
  const data = (await response.json()) as PageLoader;
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
) {
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

export async function getObjectsInv(): Promise<Buffer | null> {
  const url = updateLink("/objects.inv");
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return response.buffer();
}

export async function getMystXrefJson(): Promise<Record<string, any> | null> {
  const url = updateLink("/myst.xref.json");
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  const xrefs = await response.json();
  xrefs.references?.forEach((ref: any) => {
    ref.data = ref.data?.replace(/^\/content/, "");
  });
  return xrefs;
}

export async function getMystSearchJson(): Promise<MystSearchIndex | null> {
  const url = updateLink("/myst.search.json");
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return await response.json();
}

/**
 * The QuantEcon lectures favicon (byte-identical to the Sphinx sites'
 * `_static/lectures-favicon.ico`), served when no `favicon` option is set.
 * It lives under public/logos/ rather than at public/favicon.ico: a static
 * file at that path is served ahead of the `[favicon.ico]` route, which is
 * why the `favicon` site option never took effect before #173.
 */
const DEFAULT_FAVICON = "public/logos/lectures-favicon.png";

// Read once: the file is static, and this runs on every /favicon.ico request.
let defaultFavicon: { contentType: string; buffer: Buffer } | null | undefined;

function readDefaultFavicon(): { contentType: string; buffer: Buffer } | null {
  if (defaultFavicon !== undefined) return defaultFavicon;
  // The theme server runs from the bundle directory (`build.start` in
  // template.yml), where public/ sits beside build/; the second candidate
  // covers being launched from elsewhere.
  const candidates = [
    path.resolve(process.cwd(), DEFAULT_FAVICON),
    path.resolve(__dirname, "..", DEFAULT_FAVICON),
  ];
  defaultFavicon = null;
  for (const file of candidates) {
    try {
      defaultFavicon = { contentType: "image/png", buffer: fs.readFileSync(file) };
      break;
    } catch {
      // try the next location
    }
  }
  return defaultFavicon;
}

export async function getFavicon(): Promise<{
  contentType: string | null;
  buffer: Buffer;
} | null> {
  // We are always fetching this at run time, so we don't want the rewritten links
  const config = await getConfig({ rewriteStaticFolder: false });
  // A declared `file` option: the CLI copied the site's file into its public
  // folder and getConfig rewrote the path onto the content server.
  const url = config.options?.favicon;
  if (!url) return readDefaultFavicon() ?? fetchFavicon("https://mystmd.org/favicon.ico");
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

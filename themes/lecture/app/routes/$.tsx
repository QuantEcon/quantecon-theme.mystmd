import { redirect, type LoaderFunctionArgs, type MetaArgs } from 'react-router';
import { getProject, isFlatSite, type PageLoader } from '@myst-theme/common';
import { getMetaTagsForArticle } from '@myst-theme/site';
import { getConfig, getPage, getStaticFileUrl } from '~/backend/loaders.server';
import type { SiteManifest } from 'myst-config';
import { ErrorPage } from '~/components/ErrorPage';
import { Page } from '~/components/Page';
import { hreflangLinks } from '@quantecon/theme-common/i18n';
import { canonicalLink, mergeMeta, pageUrl, siteOrigin, socialMetaTags } from '@quantecon/theme-common/seo';

// Never re-run the loader on a navigation that changes neither pathname nor
// search (Back off an in-page anchor on a static build).
export { shouldRevalidate } from '~/revalidate';

type ManifestProject = Required<SiteManifest>['projects'][0];

export function meta({ loaderData, matches, location }: MetaArgs<typeof loader>) {
  if (!loaderData) return [];

  const config: SiteManifest = loaderData.config;
  const project: ManifestProject | undefined = loaderData.project;
  const page: PageLoader['frontmatter'] = loaderData.page.frontmatter;

  const siteTitle = config?.title ?? project?.title ?? '';

  // The root loader carries the base URL, which is not part of the page path
  // other editions share.
  const rootMatch = matches.find((m) => m?.id === 'root');
  const baseurl = (rootMatch?.loaderData as { BASE_URL?: string } | undefined)?.BASE_URL;

  // The page's public URL, shared by og:url and the canonical link.
  const url = pageUrl({
    origin: siteOrigin((config?.options as any)?.site_url, config?.domains),
    pathname: location.pathname,
    baseurl,
    projectSlug: project?.slug,
    indexSlug: project?.index,
  });

  // The OpenGraph / Twitter tags this theme adds to (or replaces in) upstream's
  // article set -- see app/seo.ts.
  const social = socialMetaTags({
    domains: config?.domains,
    siteTitle: config?.title ?? project?.title,
    pageImage: (page?.thumbnailOptimized || page?.thumbnail) ?? (project?.thumbnailOptimized || project?.thumbnail) ?? undefined,
    url,
    options: config?.options as any,
  });
  return [
    ...mergeMeta(getMetaTagsForArticle({
      origin: '',
      url: location.pathname,
      title: page?.title ? `${page.title}${siteTitle ? ` - ${siteTitle}` : ''}` : siteTitle,
      description: page?.description ?? project?.description ?? config?.description ?? undefined,
      image:
        (page?.thumbnailOptimized || page?.thumbnail) ??
        (project?.thumbnailOptimized || project?.thumbnail) ??
        undefined,
      twitter: config?.options?.twitter,
      keywords: page?.keywords ?? project?.keywords ?? config?.keywords ?? [],
    }), social),
    // hreflang alternates for the translated editions.
    ...hreflangLinks(config?.options, location.pathname, baseurl),
    ...canonicalLink(url),
  ];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  // The splat is the path below the router's basename (BASE_URL), so a site
  // served under a sub-path resolves the same slugs as one at the root.
  const path = params['*'] ?? '';
  const [first, ...rest] = path.split('/').filter((part) => !!part);
  const config = await getConfig();
  const project = getProject(config, first);
  const projectName = project?.slug === first ? first : undefined;
  const slugParts = projectName ? rest : [first, ...rest].filter((part) => part !== undefined);
  const slug = slugParts.length ? slugParts.join('.') : undefined;
  const flat = isFlatSite(config);
  try {
    const page = await getPage(request, {
      project: flat ? projectName : projectName ?? slug,
      slug: flat ? slug : projectName ? slug : undefined,
      // The renderer writes every page at its own path, so a redirect to the
      // canonical one would only write a redirect stub there.
      redirect: !import.meta.env.VITE_BUILD_HTML,
    });
    return { config, page, project };
  } catch (error) {
    // Not a page: under `myst start`, a project's `static_files` are served
    // by the content server, so send the reader there.
    if (error instanceof Response && error.status === 404) {
      const cdnUrl = await getStaticFileUrl(new URL(request.url).pathname);
      if (cdnUrl) throw redirect(cdnUrl);
    }
    throw error;
  }
}

export default Page;

export function ErrorBoundary() {
  return <ErrorPage />;
}

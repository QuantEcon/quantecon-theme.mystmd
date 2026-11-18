import { getMetaTagsForArticle, responseNoArticle, responseNoSite } from '@myst-theme/site';
import { redirect, type LoaderFunctionArgs, type MetaArgs } from 'react-router';
import { getConfig, getPage } from '~/backend/loaders.server';
import type { SiteManifest } from 'myst-config';
import { getProject } from '@myst-theme/common';

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
  const project: ManifestProject = loaderData.project;
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
    pageImage: (project.thumbnailOptimized || project.thumbnail) ?? undefined,
    url,
    options: config?.options as any,
  });
  return [
    ...mergeMeta(getMetaTagsForArticle({
      origin: '',
      url: location.pathname,
      title: config?.title ?? project.title,
      description: config.description ?? project.description ?? undefined,
      image: (project.thumbnailOptimized || project.thumbnail) ?? undefined,
      keywords: config.keywords ?? project.keywords ?? [],
      twitter: config?.options?.twitter,
    }), social),
    // hreflang alternates for the translated editions.
    ...hreflangLinks(config?.options, location.pathname, baseurl),
    ...canonicalLink(url),
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  if (project.slug) throw redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return { config, page, project };
}

export default Page;

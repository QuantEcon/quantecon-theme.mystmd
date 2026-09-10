import {
  json,
  type V2_MetaFunction,
  type LinksFunction,
  type LoaderFunction,
} from '@remix-run/node';
import { getProject, isFlatSite, type PageLoader } from '@myst-theme/common';
import { getMetaTagsForArticle } from '@myst-theme/site';
// Self-hosted, not the CDN-backed KatexCSS from @myst-theme/site — see app/links.ts.
import { KatexCSS } from '~/links';
import { getConfig, getPage } from '~/backend/loaders.server';
import type { SiteManifest } from 'myst-config';
import { ErrorPage } from '~/components/ErrorPage';
import { Page } from '~/components/Page';
import { hreflangLinks } from '~/i18n';
import { mergeMeta, socialMetaTags } from '~/seo';

// Never re-run the loader on a navigation that changes neither pathname nor
// search (Back off an in-page anchor on a static build).
export { shouldRevalidate } from '~/revalidate';

type ManifestProject = Required<SiteManifest>['projects'][0];

export const meta: V2_MetaFunction<typeof loader> = ({ data, matches, location }) => {
  if (!data) return [];

  const config: SiteManifest = data.config;
  const project: ManifestProject = data.project;
  const page: PageLoader['frontmatter'] = data.page.frontmatter;

  const siteTitle = config?.title ?? project?.title ?? '';

  // The root loader carries the static build's base URL, which is not part of
  // the page path other editions share.
  // `matches` is typed `never` under this generic; the root match's data is the root loader's.
  const rootMatch = (matches as Array<{ id: string; data?: { BASE_URL?: string } }>).find(
    (m) => m.id === 'root',
  );
  const baseurl = rootMatch?.data?.BASE_URL;

  // The OpenGraph / Twitter tags upstream's article set leaves out, merged over
  // it (same-key tags replaced) -- see app/seo.ts.
  const social = socialMetaTags({
    domains: config?.domains,
    siteTitle: config?.title ?? project?.title,
    pageImage: (page?.thumbnailOptimized || page?.thumbnail) ?? (project?.thumbnailOptimized || project?.thumbnail) ?? undefined,
    pathname: `${baseurl ?? ''}${location.pathname}`,
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
  ];
};

export const links: LinksFunction = () => [KatexCSS];

export const loader: LoaderFunction = async ({ params, request }) => {
  const [first, ...rest] = new URL(request.url).pathname.slice(1).split('/');
  const config = await getConfig();
  const project = getProject(config, first);
  const projectName = project?.slug === first ? first : undefined;
  const slugParts = projectName ? rest : [first, ...rest];
  const slug = slugParts.length ? slugParts.join('.') : undefined;
  const flat = isFlatSite(config);
  const page = await getPage(request, {
    project: flat ? projectName : projectName ?? slug,
    slug: flat ? slug : projectName ? slug : undefined,
    redirect: process.env.MODE === 'static' ? false : true,
  });
  return json({ config, page, project });
};

export default Page;

export function ErrorBoundary() {
  return <ErrorPage />;
}

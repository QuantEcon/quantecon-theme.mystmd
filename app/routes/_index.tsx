import { getMetaTagsForArticle, responseNoArticle, responseNoSite } from '@myst-theme/site';
// Self-hosted, not the CDN-backed KatexCSS from @myst-theme/site — see app/links.ts.
import { KatexCSS } from '~/links';
import type { LinksFunction, LoaderFunction, V2_MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getConfig, getPage } from '~/backend/loaders.server';
import type { SiteManifest } from 'myst-config';
import { getProject } from '@myst-theme/common';

import { Page } from '~/components/Page';
import { hreflangLinks } from '~/i18n';

type ManifestProject = Required<SiteManifest>['projects'][0];

export const meta: V2_MetaFunction<typeof loader> = ({ data, matches, location }) => {
  if (!data) return [];

  const config: SiteManifest = data.config;
  const project: ManifestProject = data.project;
  // `matches` is typed `never` under this generic; the root match's data is the root loader's.
  const rootMatch = (matches as Array<{ id: string; data?: { BASE_URL?: string } }>).find(
    (m) => m.id === 'root',
  );
  const baseurl = rootMatch?.data?.BASE_URL;

  return [
    ...getMetaTagsForArticle({
      origin: '',
      url: location.pathname,
      title: config?.title ?? project.title,
      description: config.description ?? project.description ?? undefined,
      image: (project.thumbnailOptimized || project.thumbnail) ?? undefined,
      keywords: config.keywords ?? project.keywords ?? [],
      twitter: config?.options?.twitter,
    }),
    // hreflang alternates for the translated editions (Phase 4, #90).
    ...hreflangLinks(config?.options, location.pathname, baseurl),
  ];
};

export const links: LinksFunction = () => [KatexCSS];

export const loader: LoaderFunction = async ({ params, request }) => {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return json({ config, page, project });
};

export default Page;

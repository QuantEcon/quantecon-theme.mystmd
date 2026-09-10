import type { PageLoader } from '@myst-theme/common';
import { useLoaderData } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import { useBaseurl, useSiteManifest, ProjectProvider } from '@myst-theme/providers';
import { ComputeOptionsProvider, ThebeLoaderAndServer } from '@myst-theme/jupyter';
import { PageContent } from '~/components/PageContent';
import type { TemplateOptions } from '~/types';
import { NavigationAndArticleWrapper } from './NavigationAndArticleWrapper';
import { PageProvider } from './PageProvider';

type ManifestProject = Required<SiteManifest>['projects'][0];

export function Page() {
  const data = useLoaderData() as {
    page: PageLoader;
    project: ManifestProject;
  };
  const baseurl = useBaseurl();
  const pageDesign: TemplateOptions = (data.page.frontmatter as any)?.site ?? {};
  const siteDesign: TemplateOptions =
    (useSiteManifest() as SiteManifest & TemplateOptions)?.options ?? {};
  const { hide_toc, hide_search } = {
    ...siteDesign,
    ...pageDesign,
  };
  return (
    <div className="relative bg-white dark:bg-qepage-dark">
      <ProjectProvider project={data.project}>
        <PageProvider page={data.page}>
          <NavigationAndArticleWrapper hide_toc={hide_toc} hideSearch={hide_search}>
            <ComputeOptionsProvider
              features={{
                notebookCompute: true,
                figureCompute: true,
                launchBinder: false,
              }}
            >
              <ThebeLoaderAndServer baseurl={baseurl}>
                <main className="pt-[72px] px-2">
                  <PageContent article={data.page} />
                </main>
              </ThebeLoaderAndServer>
            </ComputeOptionsProvider>
          </NavigationAndArticleWrapper>
        </PageProvider>
      </ProjectProvider>
    </div>
  );
}

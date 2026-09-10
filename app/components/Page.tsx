import type { PageLoader } from '@myst-theme/common';
import { useOutlineHeight } from '@myst-theme/site';
import { useLoaderData } from '@remix-run/react';
import { useCallback } from 'react';
import type { SiteManifest } from 'myst-config';
import { useBaseurl, useSiteManifest, ProjectProvider } from '@myst-theme/providers';
import { ComputeOptionsProvider, ThebeLoaderAndServer } from '@myst-theme/jupyter';
import { PageContent } from '~/components/PageContent';
import type { TemplateOptions } from '~/types';
import { resolveLiveCompute } from '~/liveCompute';
import { NavigationAndArticleWrapper } from './NavigationAndArticleWrapper';
import { PageProvider } from './PageProvider';

type ManifestProject = Required<SiteManifest>['projects'][0];

export function Page() {
  const { container } = useOutlineHeight();
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
  // Per-lecture live compute (#114). Returning `undefined` from the override
  // makes ComputeOptionsProvider report `enabled: false`, which takes the
  // toolbar toggle, the error tray and the execute scope down together -- the
  // broad gate, since "not compatible" means nothing on the page should run.
  // Memoised: the provider recomputes its options whenever this identity
  // changes.
  const liveCompute = resolveLiveCompute(pageDesign as any, siteDesign as any);
  const gateCompute = useCallback(
    (options: any) => (liveCompute ? options : undefined),
    [liveCompute]
  );
  return (
    <div className="relative bg-white dark:bg-qepage-dark">
      <ProjectProvider project={data.project}>
        <PageProvider page={data.page}>
          <NavigationAndArticleWrapper hide_toc={hide_toc} hideSearch={hide_search}>
            <ComputeOptionsProvider
              optionOverrideFn={gateCompute}
              features={{
                notebookCompute: true,
                figureCompute: true,
                launchBinder: false,
              }}
            >
              <ThebeLoaderAndServer baseurl={baseurl}>
                <main className="pt-[72px] px-2" ref={container}>
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

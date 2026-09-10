import { useProjectManifest, useSiteManifest } from '@myst-theme/providers';
import { CirclePlay } from 'lucide-react';
import type { SiteManifest } from 'myst-config';
import { usePage } from '../PageProvider';
import type { TemplateOptions } from '~/types';
import { buildColabUrl, type LaunchConfig } from './launchUrls';
import { Tooltip } from './Tooltip';

export function LaunchButton({ size, showLabel }: { size: number; showLabel?: boolean }) {
  const project = useProjectManifest();
  const page = usePage();
  const launchOptions: TemplateOptions =
    (useSiteManifest() as SiteManifest & TemplateOptions)?.options ?? {};

  // Source org/repo from `project.github`, minus the `.myst` suffix if present.
  const orgRepo = project?.github
    ? new URL(project.github).pathname.slice(1).replace(/\.myst$/, '')
    : undefined;
  const location = page?.location;

  const {
    launch_repo_url,
    launch_repo_suffix,
    launch_branch,
    launch_notebooks_path,
    launch_source_path,
  } = launchOptions;

  // Without a source repo or a page path there is no notebook to open, so the
  // control is not rendered at all rather than shown as an inert affordance.
  if (!orgRepo || !location) return null;

  const config: LaunchConfig = {
    repoUrl: launch_repo_url,
    repoSuffix: launch_repo_suffix,
    branch: launch_branch,
    notebooksPath: launch_notebooks_path,
    sourcePath: launch_source_path,
  };

  // The tooltip merges onto the anchor (`asChild`) rather than rendering its
  // own trigger inside it -- see Tooltip.tsx and the GitHubButton for the
  // same shape. The anchor is the one interactive element.
  return (
    <Tooltip label="Launch notebook in Google Colab" asChild>
      <a
        href={buildColabUrl(orgRepo, location, config)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Launch notebook"
        className="flex items-center cursor-pointer"
      >
        <CirclePlay className="opacity-90 hover:scale-110" width={size} height={size} />
        {showLabel && <span className="ms-2">Launch</span>}
      </a>
    </Tooltip>
  );
}

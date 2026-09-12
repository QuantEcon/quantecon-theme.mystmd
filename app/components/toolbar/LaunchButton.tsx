import { useSiteManifest } from '@myst-theme/providers';
import { CirclePlay } from 'lucide-react';
import type { SiteManifest } from 'myst-config';
import { usePage } from '../PageProvider';
import type { TemplateOptions } from '~/types';
import { buildColabUrl, type LaunchConfig } from './launchUrls';
import { Tooltip } from './Tooltip';

export function LaunchButton({ size, showLabel }: { size: number; showLabel?: boolean }) {
  const page = usePage();
  const launchOptions: TemplateOptions =
    (useSiteManifest() as SiteManifest & TemplateOptions)?.options ?? {};

  const {
    launch_notebook_repo,
    launch_notebook_branch,
    launch_notebook_dir,
    launch_notebook_source_dir,
    launch_colab,
  } = launchOptions;
  const location = page?.location;

  // Launch is opt-in on both axes: `launch_notebook_repo` says where the
  // notebook lives, `launch_colab` says something can open it, and neither is
  // inferred. A site that has no notebooks repository gets no control at all,
  // rather than a link to a repository name that was guessed from the source
  // one and may not exist.
  //
  // A blank string counts as unset: the CLI validates an empty option as a
  // string and passes it through, and a control linking to `github//` helps
  // nobody.
  const repo = launch_notebook_repo?.trim();
  if (!repo || !launch_colab || !location) return null;

  const config: LaunchConfig = {
    repo,
    branch: launch_notebook_branch,
    dir: launch_notebook_dir,
    sourceDir: launch_notebook_source_dir,
  };

  // The tooltip merges onto the anchor (`asChild`) rather than rendering its
  // own trigger inside it -- see Tooltip.tsx and the GitHubButton for the
  // same shape. The anchor is the one interactive element.
  return (
    <Tooltip label="Launch notebook in Google Colab" asChild>
      <a
        href={buildColabUrl(location, config)}
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

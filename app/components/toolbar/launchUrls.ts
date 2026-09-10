// Pure URL/path builders for the notebook launcher.
//
// Kept free of React so the logic can be unit-tested in isolation
// (see tests/unit/launch-urls.test.mjs). Ported from the URL construction in
// quantecon-book-theme's `launch.py` (`nb_path_to_notebooks`, `path_to_docs`).

export interface LaunchConfig {
  repoUrl?: string; // launch_repo_url — explicit notebook repo, overrides the derived one
  repoSuffix?: string; // launch_repo_suffix — appended to the source repo (default ".notebooks")
  branch?: string; // launch_branch — notebook repo branch (default "main")
  notebooksPath?: string; // launch_notebooks_path — subdir within the notebook repo
  sourcePath?: string; // launch_source_path — prefix stripped from the page path
}

export const DEFAULT_REPO_SUFFIX = '.notebooks';
export const DEFAULT_BRANCH = 'main';
const COLAB_BASE_URL = 'https://colab.research.google.com/github/';

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

/**
 * org/repo for the notebook repository. Derived from the source repo plus the
 * configured suffix, unless an explicit `launch_repo_url` (full URL or
 * `org/repo` string) is given.
 */
export function notebookOrgRepo(sourceOrgRepo: string, config: LaunchConfig = {}): string {
  const { repoUrl } = config;
  if (repoUrl) {
    let path = repoUrl;
    try {
      path = new URL(repoUrl).pathname;
    } catch {
      // Not a full URL — treat the value as a bare `org/repo` string.
    }
    return trimSlashes(path).replace(/\.git$/, '');
  }
  const suffix = config.repoSuffix ?? DEFAULT_REPO_SUFFIX;
  return `${sourceOrgRepo}${suffix}`;
}

/**
 * Path of the notebook within the notebook repo, relative to its root
 * (no leading slash). Strips the source file extension robustly (handles dots
 * in directory names), removes the `source_path` prefix, and prepends
 * `notebooks_path`.
 */
export function notebookRelPath(location: string, config: LaunchConfig = {}): string {
  // Strip leading slash and the trailing source extension only (not every dot).
  let path = location.replace(/^\/+/, '').replace(/\.[^/.]+$/, '');

  // Strip the source_path prefix if the page lives under it.
  const sourcePath = trimSlashes(config.sourcePath ?? '');
  if (sourcePath && (path === sourcePath || path.startsWith(`${sourcePath}/`))) {
    path = trimSlashes(path.slice(sourcePath.length));
  }

  // Prepend the notebooks_path subdir.
  const notebooksPath = trimSlashes(config.notebooksPath ?? '');
  const prefix = notebooksPath ? `${notebooksPath}/` : '';
  return `${prefix}${path}.ipynb`;
}

/** Public Google Colab launch URL for the given page. */
export function buildColabUrl(
  sourceOrgRepo: string,
  location: string,
  config: LaunchConfig = {},
): string {
  const orgRepo = notebookOrgRepo(sourceOrgRepo, config);
  const branch = config.branch ?? DEFAULT_BRANCH;
  const relPath = notebookRelPath(location, config);
  return `${COLAB_BASE_URL}${orgRepo}/blob/${branch}/${relPath}`;
}


// Pure URL/path builders for the notebook launcher.
//
// Kept free of React so the logic can be unit-tested in isolation
// (see tests/unit/launch-urls.test.mjs). Ported from the URL construction in
// quantecon-book-theme's `launch.py` (`nb_path_to_notebooks`, `path_to_docs`).
//
// The notebook repository is always configured, never derived: a guessed name
// that happens not to exist sends the reader to a 404 on a site that never
// asked for the control.

export interface LaunchConfig {
  repo: string; // launch_notebook_repo — full URL or `org/repo`
  branch?: string; // launch_notebook_branch — notebook repo branch (default "main")
  dir?: string; // launch_notebook_dir — subdir within the notebook repo
  sourceDir?: string; // launch_notebook_source_dir — prefix stripped from the page path
}

export const DEFAULT_BRANCH = 'main';
const COLAB_BASE_URL = 'https://colab.research.google.com/github/';

/** Normalises an option value: surrounding whitespace, then surrounding slashes. */
function trimSlashes(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, '');
}

/**
 * org/repo for the notebook repository, from a full URL or a bare `org/repo`.
 */
export function notebookOrgRepo(repo: string): string {
  let path = repo;
  try {
    path = new URL(repo).pathname;
  } catch {
    // Not a full URL — treat the value as a bare `org/repo` string.
  }
  return trimSlashes(path).replace(/\.git$/, '');
}

/**
 * Path of the notebook within the notebook repo, relative to its root
 * (no leading slash). Strips the source file extension robustly (handles dots
 * in directory names), removes the `source_dir` prefix, and prepends `dir`.
 */
export function notebookRelPath(location: string, config: Partial<LaunchConfig> = {}): string {
  // Strip leading slash and the trailing source extension only (not every dot).
  let path = location.replace(/^\/+/, '').replace(/\.[^/.]+$/, '');

  // Strip the source_dir prefix if the page lives under it.
  const sourceDir = trimSlashes(config.sourceDir ?? '');
  if (sourceDir && (path === sourceDir || path.startsWith(`${sourceDir}/`))) {
    path = trimSlashes(path.slice(sourceDir.length));
  }

  // Prepend the notebook subdir.
  const dir = trimSlashes(config.dir ?? '');
  const prefix = dir ? `${dir}/` : '';
  return `${prefix}${path}.ipynb`;
}

/** Public Google Colab launch URL for the given page. */
export function buildColabUrl(location: string, config: LaunchConfig): string {
  const orgRepo = notebookOrgRepo(config.repo);
  // An option set to an empty (or blank) string reaches the theme as one --
  // the CLI validates it as a string and passes it through -- so falling back
  // on nullish alone would build `blob//<path>`, a 404. Trimmed like the other
  // path options, which a copied `/main/` needs.
  const branch = trimSlashes(config.branch ?? '') || DEFAULT_BRANCH;
  const relPath = notebookRelPath(location, config);
  return `${COLAB_BASE_URL}${orgRepo}/blob/${branch}/${relPath}`;
}

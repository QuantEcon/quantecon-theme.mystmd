import type { GitMetadata } from './components/PageHeaderHistory';

export interface TemplateOptions {
  // Every key here is declared in template.yml: the CLI drops any
  // `site.options` key the template does not declare, so an option that is
  // read but not declared never arrives. Keep the two in step.

  // Layout. Both are per-page: Page.tsx merges a page's `site:` block over
  // the site-wide options.
  hide_toc?: boolean;
  hide_search?: boolean;

  // Meta / SEO and analytics, passed through to @myst-theme/site.
  twitter?: string; // handle for twitter:site / twitter:creator, `@` optional
  site_url?: string; // public URL, for og:url; site.domains never reaches the manifest
  og_logo_url?: string; // og:image when the page has no thumbnail
  twitter_logo_url?: string; // twitter:image; falls back to og_logo_url
  favicon?: string; // declared `file`: the CLI copies it and rewrites this to its served path
  analytics_google?: string;
  analytics_plausible?: string;

  /**
   * Page-level override for the "Last changed" header control, normally
   * injected at build time by plugins/git-metadata.mjs (set under `site:` in
   * page frontmatter). Declared as a string holding a YAML block, like the
   * lists below, because template options are scalar-only; a real object is
   * accepted too (app/i18n.ts `parseStructured`).
   */
  git_metadata?: string | GitMetadata;

  // Notebook launcher configuration (set under `site.options` in myst.yml),
  // so non-default branches, repo naming and nested lecture dirs work. All
  // keys are optional; the defaults are `<github>.notebooks`, branch `main`,
  // and no source/notebooks path prefixing — the page path is used as-is.
  launch_repo_url?: string; // explicit notebook repo URL; overrides `<github> + launch_repo_suffix`
  launch_repo_suffix?: string; // suffix appended to the source repo to locate the notebook repo (default ".notebooks")
  launch_branch?: string; // notebook repo branch (default "main")
  launch_notebooks_path?: string; // subdir within the notebook repo where notebooks live
  launch_source_path?: string; // prefix stripped from the page path

  // Multilingual editions and translator credit. Declared in template.yml --
  // the CLI drops undeclared site options. The two lists arrive as strings
  // holding a YAML block, because template options are scalar-only;
  // app/i18n.ts parses either form. Only the two translator keys are read per
  // page (under `site:` in page frontmatter, by PageContent); the other four
  // are site-wide -- `current_language` and `enable_rtl` come from the root
  // loader's config, `languages` and the switcher label from the site
  // manifest -- and a page value is ignored. A page that sets any declared
  // key has its whole `site:` block replaced by the validated keys, which is
  // why `git_metadata` above is declared too: undeclared, it would be
  // silently lost from any page that also set one of these.
  current_language?: string; // BCP 47 code of this edition; document `lang`, active switcher entry
  enable_rtl?: boolean; // dir="rtl" on the document
  languages?: string | unknown[]; // YAML block of `{code, name, url}`; needs 2+ entries to render
  translators?: string | unknown[]; // YAML block of `{name, url?}`; '' suppresses on a page
  translators_label?: string; // default "Translated by"; '' hides the label
  language_switcher_label?: string; // default "Switch language"
}

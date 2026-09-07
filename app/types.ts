import type { GitMetadata } from './components/PageHeaderHistory';

export interface TemplateOptions {
  hide_toc?: boolean;
  hide_outline?: boolean;
  hide_search?: boolean;
  hide_footer_links?: boolean;
  outline_maxdepth?: number;
  hide_title_block?: boolean;
  /**
   * Page-level override for the "Last changed" header control, normally
   * injected at build time by plugins/git-metadata.mjs (set under `site:` in
   * page frontmatter).
   */
  git_metadata?: GitMetadata;

  // Notebook launcher configuration (set under `site.options` in myst.yml).
  // Generalises the previously hardcoded Colab launch URLs so
  // non-default branches, repo naming and nested lecture dirs work. All keys
  // are optional; the defaults reproduce the historical behaviour
  // (`<github>.notebooks`, branch `main`, and no source/notebooks path
  // prefixing — the page path is used as-is). Mirrors the book-theme
  // `html_theme_options.launch_buttons` config.
  launch_repo_url?: string; // explicit notebook repo URL; overrides `<github> + launch_repo_suffix`
  launch_repo_suffix?: string; // suffix appended to the source repo to locate the notebook repo (default ".notebooks")
  launch_branch?: string; // notebook repo branch (default "main")
  launch_notebooks_path?: string; // subdir within the notebook repo where notebooks live (book-theme nb_path_to_notebooks)
  launch_source_path?: string; // prefix stripped from the page path (book-theme path_to_docs)

  // Multilingual editions (Phases 4-5, #90 / #91, and translator credit,
  // #143). Declared in template.yml -- the CLI drops undeclared site options.
  // The two lists arrive as strings holding a YAML block, because template
  // options are scalar-only; app/i18n.ts parses either form. Every key can
  // also be set per page under `site:` in page frontmatter. Caution: a page
  // that sets any declared key here has its whole `site:` block replaced by
  // the validated keys, so an undeclared `git_metadata` on the same page is
  // lost -- keep the two on different pages, as the visual fixture does.
  current_language?: string; // BCP 47 code of this edition; document `lang`, active switcher entry
  enable_rtl?: boolean; // dir="rtl" on the document
  languages?: string | unknown[]; // YAML block of `{code, name, url}`; needs 2+ entries to render
  translators?: string | unknown[]; // YAML block of `{name, url?}`; '' suppresses on a page
  translators_label?: string; // default "Translated by"; '' hides the label
  language_switcher_label?: string; // default "Switch language"
}

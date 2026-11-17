/**
 * The site options the book theme reads. Every key is declared in
 * template.yml: the MyST CLI drops any `site.options` key the template does
 * not declare, so keep the two in step.
 */
export interface BookOptions {
  /** `light` (the default), `dark` or `system`: the scheme a reader sees before choosing one. */
  default_color_scheme?: string;
  /** Short title for the masthead; defaults to the project title before any colon. */
  masthead_title?: string;
  /** Series line above the title on the cover; defaults to the venue title. */
  series?: string;
  /** Licence line for the cover and colophon, when the project sets none. */
  license_label?: string;
  // Meta / SEO and analytics, as in the lecture theme.
  twitter?: string;
  site_url?: string;
  og_logo_url?: string;
  twitter_logo_url?: string;
  favicon?: string;
  analytics_google?: string;
  analytics_plausible?: string;
  hide_search?: boolean;
  /** Page-level: `contents` renders the page as the table of contents. */
  layout?: string;
}

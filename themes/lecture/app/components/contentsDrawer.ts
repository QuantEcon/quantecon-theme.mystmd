/**
 * Identifiers shared by the contents drawer and the button that opens it.
 *
 * `popovertarget` on the button is matched to the panel's `id` by the browser,
 * so the two must agree. Neither component owns the value: the panel
 * (ContentsSidebar) and the toggle (toolbar/SidebarToggle) both import it from
 * here, rather than one importing from the other.
 */
export const TOC_POPOVER_ID = 'qe-toc';

/** Labels the drawer's <nav>, so the heading is not announced twice. */
export const TOC_HEADING_ID = 'qe-toc-heading';

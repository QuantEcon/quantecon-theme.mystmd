import { ChevronDown } from "lucide-react";
import React from "react";
import { usePage } from "./PageProvider";

export interface GitChangelogEntry {
  hash: string;
  short_hash: string;
  author: string;
  date: string;
  message: string;
}

export interface GitMetadata {
  last_modified?: string;
  changelog?: GitChangelogEntry[];
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  // Pin the timezone so the server render, client hydration, and visual
  // snapshots agree on the date regardless of host timezone.
  timeZone: "UTC",
});

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : DATE_FORMAT.format(date);
}

function relativeTime(iso: string, now: number) {
  const seconds = (now - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(seconds) || seconds < 60) return "just now";
  const units: [number, string][] = [
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2592000, "week"],
    [31536000, "month"],
    [Infinity, "year"],
  ];
  let size = 60;
  for (const [limit, label] of units) {
    if (seconds < limit) {
      const count = Math.floor(seconds / size);
      return `${count} ${label}${count !== 1 ? "s" : ""} ago`;
    }
    size = limit;
  }
}

// Toggle and changelog copy share one size so the block reads as a unit.
const COPY = "text-[0.85rem]";

/**
 * "Last changed" page-header control that expands an inline changelog,
 * mirroring the quantecon-book-theme header.
 *
 * Layout: the root is `display: contents`, so the trigger and the panel become
 * flex items of the header's author row rather than nesting inside a box. The
 * trigger takes `ms-auto` (end-aligned, inline with the author names) and the
 * panel takes `w-full`, which wraps it onto its own line directly underneath.
 * Because the whole thing renders inside ProjectFrontmatter's bordered block,
 * expanding pushes the blue divider down and keeps the changelog adjacent to
 * its toggle and clear of the lecture content.
 *
 * Data sources, in order of precedence:
 *  1. `site.git_metadata` in the page frontmatter (manual override, and how
 *     the visual fixture pins deterministic data), then
 *  2. `mdast.data.git_metadata` injected at build time by
 *     plugins/git-metadata.mjs.
 *
 * Renders nothing when neither is present.
 */
export function PageHeaderHistory({ alignEnd = true }: { alignEnd?: boolean } = {}) {
  const page = usePage();
  // `ms-auto` pushes the control to the end of the header row. When the
  // translators block is present it takes that role instead and this sits
  // beside it (ProjectFrontmatter passes alignEnd=false).
  const align = alignEnd ? "ms-auto" : "";
  // Relative times depend on the clock; render absolute dates on the server
  // and only switch after mount so statically exported HTML hydrates cleanly.
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => setNow(Date.now()), []);
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const frontmatter = page?.frontmatter as any;
  const meta: GitMetadata | undefined =
    frontmatter?.site?.git_metadata ?? (page?.mdast as any)?.data?.git_metadata;
  const changelog = meta?.changelog ?? [];
  const lastModified = meta?.last_modified ?? changelog[0]?.date;
  if (!lastModified) return null;

  // Commit links target the source repository itself, so unlike
  // LaunchButton's notebook URLs the `.myst` suffix must be kept.
  const github: string | undefined = frontmatter?.github;
  const repoUrl = github?.startsWith("https://github.com/")
    ? github.replace(/\/$/, "")
    : undefined;
  // mystmd computes `source_url` as {repo}/blob/{branch}/{path}; only a URL of
  // that shape can be rewritten into a commits view.
  const sourceUrl = frontmatter?.source_url as string | undefined;
  const historyUrl = sourceUrl?.includes("/blob/")
    ? sourceUrl.replace("/blob/", "/commits/")
    : undefined;

  // Without changelog entries there is nothing to expand — render plain text,
  // not a non-functional interactive control.
  if (changelog.length === 0) {
    return (
      <div
        className={`${align} ${COPY} text-qetext-light/70 dark:text-qetext-dark-muted`}
      >
        Last changed: {formatDate(lastModified)}
      </div>
    );
  }

  return (
    <div
      className="contents"
      // Esc closes from anywhere inside, returning focus to the trigger —
      // the disclosure equivalent of the modal's Esc handling.
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`group ${align} flex items-center gap-1 ${COPY} cursor-pointer
          text-qetext-light/70 dark:text-qetext-dark-muted
          hover:text-qeborder-blue dark:hover:text-qeborder-blue`}
      >
        Last changed: {formatDate(lastModified)}
        <ChevronDown
          size={14}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={panelId}
          // Sentinel for ProjectFrontmatter's `has-[…]:pb-0`: the panel sits
          // flush on the blue divider, which serves as its bottom edge — hence
          // no bottom border and only the top corners rounded.
          data-qe-history-panel
          className="w-full mt-2 rounded-t border border-b-0 border-qetoolbar-border
            dark:border-qetoolbar-dark bg-qetoolbar-light/40 dark:bg-qetoolbar-dark/30
            px-3 py-2 text-qetext-light dark:text-qetext-dark"
        >
          <div
            className={`flex items-center justify-between gap-3 pb-1.5 mb-1
              border-b border-qetoolbar-border dark:border-qetoolbar-dark ${COPY}`}
          >
            <span className="font-medium">Changelog</span>
            {historyUrl && (
              <a
                href={historyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-qeborder-blue hover:underline"
              >
                full history
              </a>
            )}
          </div>
          {/* No scroll — the list grows to fit, so the panel never shows an
              inner scrollbar. Length is bounded at the source instead: the
              plugin caps entries per page (QE_GIT_METADATA_MAX, default 6). */}
          <ol className={`m-0 p-0 list-none ${COPY}`} aria-label="Recent changes">
            {changelog.map((entry) => (
              <li
                key={entry.hash}
                className="flex items-baseline gap-2 py-1
                  border-b border-qetoolbar-border/40 dark:border-qetoolbar-dark/40
                  last:border-b-0"
              >
                {repoUrl ? (
                  <a
                    href={`${repoUrl}/commit/${entry.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-qeborder-blue hover:underline shrink-0"
                  >
                    {entry.short_hash}
                  </a>
                ) : (
                  <span className="font-mono opacity-70 shrink-0">
                    {entry.short_hash}
                  </span>
                )}
                <span className="flex-1 truncate" title={entry.message}>
                  {entry.message}
                </span>
                <span className="shrink-0 opacity-70">
                  {entry.author}
                  <span aria-hidden> · </span>
                  {now ? relativeTime(entry.date, now) : formatDate(entry.date)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

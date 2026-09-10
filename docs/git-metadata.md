# Git history in page headers

The page header shows "Last changed: ⟨date⟩", expanding to an inline changelog
of the most recent commits touching the page, with commit links and a link to
the file's full history, as the Sphinx sites do. It opens in place above the
header's blue rule and renders nothing when no data is present.

The data is injected at build time by the git-metadata plugin, a MyST transform
that runs `git log --follow` per source file and attaches
`{ last_modified, changelog: [{hash, short_hash, author, date, message}] }` to
the page. Load it by URL pinned to the theme release the site builds with:

```yaml
project:
  github: https://github.com/QuantEcon/lecture-python.myst
  plugins:
    - https://raw.githubusercontent.com/QuantEcon/quantecon-theme.mystmd/vX.Y.Z/plugins/git-metadata.mjs
```

The plugin is moving to the shared `QuantEcon/quantecon-plugins.mystmd`
repository; the pinned URL form stays supported until that release exists.

Notes:

- Shallow CI clones (`fetch-depth: 1`) yield truncated history; build with
  `fetch-depth: 0`.
- `QE_GIT_METADATA_MAX` caps entries per page (default 6); the panel grows to
  fit rather than scrolling.
- A page can pin the control by hand with the same shape under `site:` in its
  frontmatter as a YAML block string (`git_metadata: |`), which takes precedence
  over the injected data.

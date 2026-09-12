import { test, expect, Page } from "@playwright/test";

/**
 * Full-page visual snapshots of the fixture, one per rendering surface.
 * `notebook` exercises the `@myst-theme` output-node AST (stream /
 * execute_result / error outputs).
 */
async function settle(page: Page) {
  // Not `networkidle` — the runtime theme can hold a persistent connection
  // open, so it never fires. Wait for load + a beat for math/webfonts.
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(1500);
}

// Route slugs are derived from the fixture filenames; `intro` is the home page.
const pages = [
  { name: "intro", path: "/" },
  { name: "features", path: "/features" },
  // Fancy ordered lists: markers stamped by the fixture's fancy-lists.mjs
  // plugin, so coverage is independent of the CLI's parser.
  { name: "lists", path: "/lists" },
  { name: "notebook", path: "/notebook" },
];

test.describe("QuantEcon theme — visual regression", () => {
  for (const p of pages) {
    test(p.name, async ({ page }) => {
      await page.goto(p.path, { waitUntil: "domcontentloaded" });
      await settle(page);
      await expect(page).toHaveScreenshot(`${p.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        animations: "disabled",
      });
    });
  }

  // The "Last changed" header control and its inline changelog. The fixture
  // pins git_metadata in features.md frontmatter and the clock is frozen, so
  // the relative times ("4 months ago") are deterministic.
  //
  // The control is a disclosure that expands *above* the header's blue
  // divider, pushing it down — keeping the changelog adjacent to its toggle
  // and out of the lecture content. The geometry assertions below pin that,
  // since a panel that rendered below the divider would still look plausible
  // in isolation.
  const BLUE_DIVIDER_BLOCK = '[class*="border-b-qeborder-blue"]';
  // Matches `border-b-[5px]` on that block.
  const BLUE_DIVIDER_PX = 5;
  const dividerBottom = (page: Page) =>
    page.evaluate(
      (sel) => document.querySelector(sel)!.getBoundingClientRect().bottom,
      BLUE_DIVIDER_BLOCK
    );

  test("history-open", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-06-12T00:00:00Z"));
    await page.goto("/features", { waitUntil: "domcontentloaded" });
    await settle(page);
    const trigger = page.getByRole("button", { name: /Last changed/ });
    await expect(trigger).toContainText("Last changed: Jan 15, 2026");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    const closedDivider = await dividerBottom(page);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // The panel is whatever the trigger says it controls — this also checks
    // the aria wiring rather than assuming a selector.
    const panelId = await trigger.getAttribute("aria-controls");
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Changelog", { exact: true })).toBeVisible();
    // Commit links point at the source repo (myst.yml `github`), full history
    // at the mystmd-computed source path.
    await expect(panel.getByRole("link", { name: "3f9d2c4" })).toHaveAttribute(
      "href",
      "https://github.com/QuantEcon/quantecon-theme.mystmd/commit/3f9d2c41b8a7e6f5d4c3b2a1908f7e6d5c4b3a29"
    );
    await expect(panel.getByRole("link", { name: "full history" })).toHaveAttribute(
      "href",
      /\/commits\/.*features\.md$/
    );
    await expect(panel.getByText("4 months ago")).toBeVisible();

    // Opening pushes the blue divider down, and the panel sits flush on it:
    // the divider is the panel's bottom edge, so the gap between the panel's
    // bottom and the top of the 5px border is ~0. `pb-4` returning (a broken
    // `has-[…]:pb-0`) would show up here as a ~16px gap.
    const openDivider = await dividerBottom(page);
    expect(openDivider).toBeGreaterThan(closedDivider);
    const box = (await panel.boundingBox())!;
    const gap = openDivider - BLUE_DIVIDER_PX - (box.y + box.height);
    expect(Math.abs(gap)).toBeLessThanOrEqual(1);

    // No inner scrollbar — the list grows to fit (entries are capped at the
    // source by the plugin instead).
    const scrolls = await page.evaluate((id) => {
      const ol = document.getElementById(id)!.querySelector("ol")!;
      return ol.scrollHeight > ol.clientHeight + 1;
    }, panelId!);
    expect(scrolls).toBe(false);

    // The toggle and the changelog copy are one type size (0.85rem), so the
    // block reads as a unit.
    const sizes = await page.evaluate(
      ({ id }) => {
        const p = document.getElementById(id)!;
        const btn = document.querySelector<HTMLElement>(
          `button[aria-controls="${CSS.escape(id)}"]`
        )!;
        return {
          trigger: getComputedStyle(btn).fontSize,
          entry: getComputedStyle(p.querySelector("li")!).fontSize,
        };
      },
      { id: panelId! }
    );
    expect(sizes.entry).toBe(sizes.trigger);

    await expect(page).toHaveScreenshot("history-open.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    });

    // Esc closes the disclosure and returns focus to the trigger.
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  // Marker-level assertions for the fancy-list page: a wrong marker case
  // ((A) where (a) is expected) moves far too few pixels for the full-page
  // snapshot's 1% diff budget, so pin the DOM/computed styles directly.
  // Ordering matches lists.md: alpha-parens, roman-parens, upper-alpha-paren,
  // roman-period, decimal control, and the same roman-parens list
  // wrapped in a `prf:theorem` directive.
  test("lists-markers", async ({ page }) => {
    await page.goto("/lists", { waitUntil: "domcontentloaded" });
    await settle(page);
    const lists = await page.evaluate(() =>
      Array.from(document.querySelectorAll("article ol, main ol")).map((ol) => ({
        type: ol.getAttribute("type"),
        start: ol.getAttribute("start"),
        className: ol.className,
        listStyleType: getComputedStyle(ol).listStyleType,
        // Specified `content` of the drawn marker, e.g. `"(" counter(list-item, lower-alpha) ")"`.
        // Case-sensitive check that the right rule matched — ol[type] selectors
        // are case-insensitive in HTML, which is exactly the regression this guards.
        liBefore: getComputedStyle(ol.querySelector("li")!, "::before").content,
        // Whether this list sits inside a `prf:*` body rather than the page body.
        insideProof: !!ol.closest(".myst-proof-body"),
      }))
    );
    expect(lists).toHaveLength(6);
    expect(lists[0]).toMatchObject({ type: "a", listStyleType: "none" });
    expect(lists[0].className).toContain("list-lower-alpha");
    expect(lists[0].className).toContain("delimiter-parens");
    expect(lists[0].liBefore).toBe('"(" counter(list-item, lower-alpha) ")"');
    expect(lists[1]).toMatchObject({ type: "i", listStyleType: "none" });
    expect(lists[1].liBefore).toBe('"(" counter(list-item, lower-roman) ")"');
    expect(lists[2]).toMatchObject({ type: "A", listStyleType: "none" });
    expect(lists[2].liBefore).toBe('counter(list-item, upper-alpha) ")"');
    expect(lists[3]).toMatchObject({ type: "i", listStyleType: "lower-roman" });
    expect(lists[3].liBefore).toBe("none");
    expect(lists[4]).toMatchObject({ type: null, listStyleType: "decimal" });
    expect(lists[4].liBefore).toBe("none");

    // The same stamped roman-parens list, wrapped in `prf:theorem`. It covers
    // two load-bearing behaviours a page-body list cannot: myst-to-react's
    // proof renderer passes its children through the same <MyST/> dispatcher
    // that consults LIST_RENDERERS, and nothing in styles/lists.css scopes a
    // selector to body-vs-proof. A regression in either would drop the ~330
    // list items across the dp books' prf:* blocks back to decimals — and moves
    // far too few pixels for the snapshot budget, so it is pinned here rather
    // than by screenshot.
    expect(lists[1].insideProof).toBe(false);
    expect(lists[5].insideProof).toBe(true);
    // Byte-identical treatment to the equivalent body list (lists[1]).
    expect(lists[5]).toMatchObject({ type: "i", start: "1", listStyleType: "none" });
    expect(lists[5].className).toContain("list-lower-roman");
    expect(lists[5].className).toContain("delimiter-parens");
    expect(lists[5].liBefore).toBe(lists[1].liBefore);
    expect(lists[5].className).toBe(lists[1].className);
    // Compared, not just pinned: asserting `start: "1"` on the proof list alone
    // would still pass if a regression dropped `start` from body lists only,
    // which is exactly the asymmetry this test exists to rule out.
    expect(lists[5].start).toBe(lists[1].start);
  });

  // The Contents sidebar is off-canvas by default, so the full-page snapshots
  // above never see it — #70 (unlinked sidebar entries) was invisible to them.
  // Open it and snapshot the viewport (not fullPage: stitching a scrolled page
  // with a fixed overlay produces artifacts).
  test("sidebar-open", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);
    // The icons are aria-hidden, so the button itself carries the only
    // accessible name to target.
    await page.getByRole("button", { name: "Table of contents" }).click();
    // The open state is a 300ms translate transition; wait for the drawer to
    // be fully on-screen (its "Contents" heading at ratio 1) rather than a
    // fixed delay.
    await expect(page.getByText("Contents", { exact: true })).toBeInViewport({ ratio: 1 });
    await expect(page).toHaveScreenshot("sidebar-open.png", {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    });
  });

  // Guards the reason the drawer is a popover: the browser owns the toggle, so
  // it works on the server-rendered HTML without hydration. Every other test
  // runs with JS on and would pass without that property, so this is the only
  // thing stopping an onClick or a client-only wrapper from silently taking it.
  test.describe("without JavaScript", () => {
    // The ordinary `page` fixture, with JS off — no hand-built context, so the
    // project's own baseURL applies rather than a positional lookup.
    test.use({ javaScriptEnabled: false });

    test("drawer-opens-without-javascript", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "desktop-chrome",
        "asserts a server-render property; one engine is enough"
      );
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const drawer = page.locator(".qe-toc");
      // Presence first: `toBeHidden` also passes on zero matches, so without
      // this a renamed or missing drawer would read as "correctly closed".
      await expect(drawer).toHaveCount(1);
      await expect(drawer).toBeHidden();
      await page.getByRole("button", { name: "Table of contents" }).click();
      await expect(drawer).toBeVisible();
      await expect(page.getByText("Contents", { exact: true })).toBeInViewport({ ratio: 1 });
    });
  });

  // A popover paints in the top layer, above the search dialog's backdrop and
  // panel. Light dismiss cannot cover the keyboard route to search, so the
  // drawer closes itself when a modal dialog mounts (see ContentsSidebar.tsx).
  test("drawer-closes-when-search-opens", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "keyboard-shortcut behaviour; one engine is enough"
    );
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);
    const drawer = page.locator(".qe-toc");
    await page.getByRole("button", { name: "Table of contents" }).click();
    await expect(drawer).toBeVisible();
    // Upstream binds Ctrl+K (Cmd+K only when it detects a Mac UA; the Desktop
    // Chrome device profile is not one).
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(drawer).toBeHidden();
  });

  // Launch is a direct link to Colab, the only launch target by design: Binder
  // and JupyterHub are not offered. Asserting the anchor's href rather than a
  // stubbed window.open keeps this offline and deterministic, and pins that the
  // control is a *link*, so a chooser in its place would fail here. The repo is
  // the fixture's own `launch_notebook_repo`: nothing is derived from `github`.
  test("launch-colab", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "the launch control lives in the desktop toolbar; mobile wraps it in MobileActionsMenu"
    );
    await page.goto("/notebook", { waitUntil: "domcontentloaded" });
    await settle(page);
    const launch = page.getByRole("link", { name: "Launch notebook" }).first();
    await expect(launch).toBeVisible();
    await expect(launch).toHaveAttribute("target", "_blank");
    await expect(launch).toHaveAttribute(
      "href",
      "https://colab.research.google.com/github/QuantEcon/quantecon-theme.notebooks/blob/main/notebook.ipynb"
    );
  });

  // The opt-in default. `fixture-no-thebe` sets `project.github` but neither
  // launch option, which is the shape of a lecture repo with no notebooks
  // repository: there must be no control and no gap where one would sit, on
  // the toolbar or in the mobile overflow menu.
  test("launch-absent-without-config", async ({ page }, testInfo) => {
    const noThebeBase = `http://localhost:${process.env.NO_THEBE_PORT || "3112"}`;
    await page.goto(`${noThebeBase}/notebook`, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page.getByRole("link", { name: "Launch notebook" })).toHaveCount(0);
    // No dead link to a repository the site never named, either.
    await expect(page.locator('a[href*="colab.research.google.com"]')).toHaveCount(0);

    // And no gap where the control would have been. Asserted on the computed
    // `display`, because both of the obvious signals are blind here: an empty
    // `<li>` is a zero-width flex item whether or not it is displayed, so
    // measuring its width proves nothing -- and Playwright calls a zero-size
    // element hidden, so `toBeHidden()` passes just the same. What an
    // un-collapsed slot actually costs is the row's own `gap-x`.
    const slot = page.locator(".qe-launch-slot");
    expect(await slot.count()).toBeGreaterThan(0);
    await expect(slot.first()).toHaveCSS("display", "none");

    if (testInfo.project.name === "mobile-chrome") {
      // Below `md` the toolbar slot is display:none regardless, so the mobile
      // case is only really tested inside the overflow menu.
      await page.getByRole("button", { name: "More actions" }).click();
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("link", { name: "Launch notebook" })).toHaveCount(0);
      await expect(menu.locator(".qe-launch-slot")).toHaveCSS("display", "none");
    }
  });

  // Live compute: the fixture sets `project.thebe: { lite: true }`, which
  // surfaces the @myst-theme/jupyter NotebookToolbar. It's portaled into the
  // desktop header toolbar (next to Launch), so assert the Power toggle
  // ("start compute environment") renders there. Actually booting the Pyodide
  // kernel is a heavy in-browser download, so that end-to-end check is done
  // manually rather than in CI.
  test("live-compute-toggle", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "the live-compute toggle is desktop-only (the slot <li> is hidden below md; MobileActionsMenu does not include it)"
    );
    await page.goto("/notebook", { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(
      // Scoped to the header slot: a toggle existing *somewhere* on the page
      // wouldn't prove it was portaled into the header rather than rendered in
      // the article. Substring regex: resilient to upstream label
      // wording/casing changes.
      page.locator("#qe-compute-slot").getByRole("button", { name: /start compute/i })
    ).toBeVisible();
  });

  // Disabled path: a second fixture project WITHOUT `project.thebe` (served on
  // NO_THEBE_PORT). On a real notebook page there the live-compute toggle must
  // NOT appear, proving it's gated on the project opting into Thebe — not just
  // on the page being a notebook.
  test("live-compute-toggle-absent-without-thebe", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chrome",
      "the live-compute toggle lives in the desktop header toolbar"
    );
    // Single source of truth: playwright.config.ts resolves the port (with its
    // default) and writes it back into process.env for the workers.
    const noThebeBase = `http://localhost:${process.env.NO_THEBE_PORT}`;
    await page.goto(`${noThebeBase}/notebook`, { waitUntil: "domcontentloaded" });
    await settle(page);
    // Sanity-check we actually loaded the notebook page (so the count-0 below
    // isn't a false pass from a 404 / wrong page). Match the heading, not bare
    // text — the drawer links to this page by the same name.
    await expect(page.getByRole("heading", { name: "Notebook outputs" })).toBeVisible();
    await expect(page.getByRole("button", { name: /start compute/i })).toHaveCount(0);
  });
});

test.describe("On this page outline", () => {
  // The full-page snapshots cannot see this (they stitch a scrolled page, and
  // the file records above why a fixed element breaks that), so it is
  // asserted behaviourally. The no-thebe fixture carries the numbered,
  // nested page; the main fixture's /features has unnumbered h2/h3.
  const noThebeBase = `http://localhost:${process.env.NO_THEBE_PORT || "3112"}`;
  const nav = (page: Page) => page.getByRole("navigation", { name: "On this page" });
  const current = (page: Page) => nav(page).locator('a[aria-current="location"]');

  test("outline-pinned-and-nested", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "the margin column is desktop-only");
    await page.goto(`${noThebeBase}/outline`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const entries = nav(page).locator("ul a");
    // Two h2 + two h3 + one h2 = five entries, with the heading's own
    // enumerator, never a list-index number.
    await expect(entries).toHaveCount(5);
    // (`titles: true` numbers nothing on this fixture's pages, so the
    // enumerators are section-only; the lecture repos get "3.1." from the
    // same span.)
    await expect(entries.nth(0)).toHaveText(/^1\. First section$/);
    await expect(entries.nth(1)).toHaveText(/^1\.1\. First subsection$/);
    await expect(entries.nth(4)).toHaveText(/^3\. Last section$/);
    // Autoexpand: at the top of the page only the sections show.
    const subs = nav(page).locator("li.qe-outline__sub a");
    await expect(subs).toHaveCount(2);
    await expect(subs.first()).toBeHidden();
    // Scrolling into the first section expands its subsections, indented:
    // the anchors are block-level, so compare their start padding.
    await page.evaluate(() => {
      const el = document.getElementById("first-section")!;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100);
    });
    await expect(subs.first()).toBeVisible();
    const pad = async (i: number) =>
      parseFloat(await entries.nth(i).evaluate((a) => getComputedStyle(a).paddingInlineStart));
    expect(await pad(1)).toBeGreaterThan(await pad(0));
    expect(await pad(3)).toBe(await pad(0));
    // Pinned: the panel's top is the same before and after a long scroll.
    const top = async () => Math.round((await nav(page).boundingBox())!.y);
    const before = await top();
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(300);
    expect(await top()).toBe(before);
    // And it never outgrows the viewport: capped, scrolling internally.
    const box = (await nav(page).boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(800);
  });

  test("outline-tracks-scroll", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "the margin column is desktop-only");
    await page.goto(`${noThebeBase}/outline`, { waitUntil: "domcontentloaded" });
    await settle(page);
    // Nothing is current above the first heading.
    await expect(current(page)).toHaveCount(0);
    // A section is current once its heading has passed 120px from the top, and
    // stays current until the next one does.
    const scrollTo = (id: string, y: number) =>
      page.evaluate(([i, yy]) => {
        const el = document.getElementById(i)!;
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - yy);
      }, [id, y] as [string, number]);
    await scrollTo("second-section", 100);
    await expect(current(page)).toHaveAttribute("href", /#second-section$/);
    await expect(current(page)).toHaveCSS("font-weight", "600");
    // ...and the first section's sub-list has collapsed again.
    await expect(nav(page).locator("li.qe-outline__sub a").first()).toBeHidden();
    // 20px short of the line: the previous section (a subsection) still holds.
    await scrollTo("second-section", 140);
    await expect(current(page)).toHaveAttribute("href", /#second-subsection$/);
    await scrollTo("first-subsection", 100);
    // A current subsection is marked itself; its parent is expanded, not marked.
    await expect(current(page)).toHaveAttribute("href", /#first-subsection$/);
    const parent = nav(page).locator("li.qe-outline__expanded > a");
    await expect(parent).toHaveAttribute("href", /#first-section$/);
    await expect(parent).not.toHaveAttribute("aria-current", "location");
    // The last section is too short to reach the activation window; the
    // bottom-of-page rule marks it.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(current(page)).toHaveAttribute("href", /#last-section$/);
    // Exactly one entry is current at a time.
    await expect(current(page)).toHaveCount(1);
  });

  test("outline-unnumbered", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "the margin column is desktop-only");
    await page.goto("/features", { waitUntil: "domcontentloaded" });
    await settle(page);
    const entries = nav(page).locator("ul a");
    // No numbering configured: bare titles, no invented "1." prefixes.
    await expect(entries.first()).toHaveText(/^Mathematics$/);
    await expect(entries.filter({ hasText: /^\d/ })).toHaveCount(0);
    // The two h3s nest under "Admonitions" and are hidden until it is current.
    await expect(nav(page).locator("li.qe-outline__sub")).toHaveCount(2);
    await expect(nav(page).locator("li.qe-outline__sub a").first()).toBeHidden();
  });

  test("outline-within-viewport", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "the margin column is desktop-only");
    // From the 1280px breakpoint to 1328px the fixed grid tracks plus their
    // column gaps outgrew the content box: LTR pages scrolled sideways with
    // the panel's end clipped, and in RTL the panel started 28px off-screen.
    // In both directions the page must fit and the panel sit inside it.
    const rtlBase = `http://localhost:${process.env.RTL_PORT || "3113"}`;
    for (const url of ["/features", `${rtlBase}/`]) {
      for (const width of [1280, 1300, 1328]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await settle(page);
        const where = `${url} at ${width}px`;
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollWidth, where).toBeLessThanOrEqual(width);
        // By class, not role name: the RTL edition translates the label.
        const box = (await page.locator(".qe-outline").boundingBox())!;
        expect(box.x, where).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, where).toBeLessThanOrEqual(width);
      }
    }
  });
});

test.describe("Meta/SEO and notebook output", () => {
  const noThebeBase = `http://localhost:${process.env.NO_THEBE_PORT || "3112"}`;
  const meta = (page: Page, sel: string) => page.locator(`head meta[${sel}]`);

  // The OpenGraph / Twitter tags app/seo.ts adds to upstream's article set
  // (and upstream's `twitter:creator`), on a lecture page. The no-thebe fixture
  // declares `site_url`, `twitter`, both logo URLs and `current_language`;
  // nothing here depends on the page having a thumbnail.
  test("social-meta", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "not viewport-dependent");
    await page.goto(`${noThebeBase}/notebook`, { waitUntil: "domcontentloaded" });
    const expectTag = async (sel: string, content: string | RegExp) =>
      expect(meta(page, sel)).toHaveAttribute("content", content);
    await expectTag('property="og:type"', "website");
    await expectTag('property="og:site_name"', "QE Theme No-Thebe Fixture");
    await expectTag('property="og:url"', "https://example.org/notebook");
    await expectTag('property="og:image"', "https://assets.example.org/qe-og-logo.png");
    await expectTag('property="og:locale"', "en_US");
    await expectTag('name="twitter:site"', "@quantecon");
    await expectTag('name="twitter:creator"', "@quantecon");
    await expectTag('name="twitter:card"', "summary");
    await expectTag('name="twitter:image"', "https://assets.example.org/qe-twitter-logo.png");
    // Replaced, not duplicated: one og:image, one twitter:card.
    await expect(meta(page, 'property="og:image"')).toHaveCount(1);
    await expect(meta(page, 'name="twitter:card"')).toHaveCount(1);
  });

  // A cell's stderr stream is folded behind a "Code warnings" disclosure,
  // closed by default; stdout in the same cell stays visible. A native
  // <details>, so it holds in the server-rendered HTML too.
  test("stderr-collapsed", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "not viewport-dependent");
    await page.goto(`${noThebeBase}/notebook`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const fold = page.locator("details.qe-stderr");
    await expect(fold).toHaveCount(1);
    await expect(fold).not.toHaveAttribute("open", "");
    await expect(fold.locator("summary")).toContainText("Code warnings");
    await expect(fold.locator("pre.jupyter-error")).toBeHidden();
    // The output, not the source cell that also carries the string.
    await expect(
      page.locator("pre.jupyter-output", { hasText: "and a normal line on stdout, left visible" })
    ).toBeVisible();
    await fold.locator("summary").click();
    await expect(fold.locator("pre.jupyter-error")).toBeVisible();
    await expect(fold.locator("pre.jupyter-error")).toContainText("a deliberate warning on stderr");
  });
});

test.describe("Site options reach the theme", () => {
  // The CLI validates `site.options` against template.yml and DROPS every key
  // the template does not declare, so a theme that reads an undeclared option
  // silently runs on its default. These assert, end to end, that a declared
  // site-wide option arrives: the fixture sets `twitter` and `favicon` in
  // myst.yml.in. The page-level path (`site:` in a page's frontmatter) is
  // covered by the `history-open` snapshot above, whose "Last changed" control
  // exists only because features.md's `git_metadata` block survives
  // validation.
  test("site-options", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "not viewport-dependent");
    await page.goto("/features", { waitUntil: "domcontentloaded" });
    // `twitter:creator`, which upstream's article meta emits from the option.
    // What is asserted here is only that the declared option reached the theme
    // at all; the rest of the social set, `twitter:site` included, is asserted
    // in "social-meta".
    await expect(page.locator('head meta[name="twitter:creator"]')).toHaveAttribute(
      "content",
      "@quantecon"
    );
    // `favicon` is a `file` option: the CLI copies the fixture's PNG into the
    // build and the theme serves it at /favicon.ico. Match on the bytes, not
    // just the status -- the mystmd default favicon is also a 200.
    const served = await request.get("/favicon.ico");
    expect(served.status()).toBe(200);
    expect(served.headers()["content-type"]).toContain("image/png");
    const fs = await import("node:fs");
    const fixture = fs.readFileSync("tests/visual/fixture/cc-by-sa-4.0-80x15.png");
    expect(Buffer.from(await served.body()).equals(fixture)).toBe(true);
    // And the default when the option is unset (the no-thebe fixture): the
    // QuantEcon lectures favicon. It lives under public/logos/, not at
    // public/favicon.ico, where a static file would shadow the route and the
    // option with it.
    const noThebe = `http://localhost:${process.env.NO_THEBE_PORT || "3112"}`;
    const fallback = await request.get(`${noThebe}/favicon.ico`);
    expect(fallback.status()).toBe(200);
    expect(fallback.headers()["content-type"]).toContain("image/png");
    const lectures = fs.readFileSync("public/logos/lectures-favicon.png");
    expect(Buffer.from(await fallback.body()).equals(lectures)).toBe(true);
  });
});

/**
 * The site footer. The lecture builds print the licence notice and the theme
 * credit on every page with no condition around them, so the theme renders
 * them as a default; `site.parts.footer` replaces that default outright, which
 * is how a site states different terms.
 *
 * The main fixture declares the part (its footer.md carries the badge as an
 * image); `fixture-no-thebe` declares none, so it exercises the default.
 */
test.describe("Site footer", () => {
  const noThebeBase = `http://localhost:${process.env.NO_THEBE_PORT || "3112"}`;
  const LICENSE_HREF = "https://creativecommons.org/licenses/by-sa/4.0/";
  // The default's inline badge, by its own viewBox.
  const BADGE = 'svg[viewBox="0 0 80 15"]';

  test("default-footer-without-part", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "not viewport-dependent");
    await page.goto(`${noThebeBase}/`, { waitUntil: "domcontentloaded" });
    const footer = page.locator(".qe-site-footer");
    await expect(footer).toHaveCount(1);
    await expect(footer).toContainText(
      "This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International."
    );
    await expect(footer.locator('a[href="https://quantecon.org"]')).toHaveText("QuantEcon");
    // The badge is drawn inline: nothing is fetched from licensebuttons.net,
    // and there is no root-absolute asset path to 404 under a sub-path.
    const badge = footer.locator(`a[href="${LICENSE_HREF}"] ${BADGE}`);
    await expect(badge).toHaveCount(1);
    await expect(badge.locator("title")).toHaveText("Creative Commons License");
    await expect(footer.locator("img")).toHaveCount(0);
  });

  test("declared-part-replaces-default", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chrome", "not viewport-dependent");
    await page.goto("/features", { waitUntil: "domcontentloaded" });
    const footer = page.locator(".qe-site-footer");
    await expect(footer).toHaveCount(1);
    await expect(footer.locator('img[alt="Creative Commons License"]')).toHaveCount(1);
    // The default renders none of its own markup beside the part's content --
    // the site's footer.md is the whole footer, credit included. Matched on
    // the badge itself, not on `svg`: myst-to-react hangs its own external-link
    // icon off the part's link.
    await expect(footer.locator(BADGE)).toHaveCount(0);
    await expect(footer.locator('a[href="https://quantecon.org"]')).toHaveCount(0);
  });
});

/**
 * Multilingual editions: the language switcher and hreflang alternates,
 * right-to-left layout and translator credit. The main fixture configures
 * two editions (en current) and a project-level translator with a
 * page-level override on `/` and a suppression on `/lists`; `fixture-rtl` is
 * the Persian edition with `enable_rtl`.
 */
test.describe("Multilingual editions", () => {
  const rtlBase = `http://localhost:${process.env.RTL_PORT || "3113"}`;

  test("hreflang-alternates", async ({ page }) => {
    await page.goto("/features", { waitUntil: "domcontentloaded" });
    const alternate = (lang: string) =>
      page.locator(`head link[rel="alternate"][hreflang="${lang}"]`);
    await expect(alternate("en")).toHaveAttribute("href", "https://example.org/en/features");
    // The trailing slash on the configured URL is dropped before the path is joined.
    await expect(alternate("fa")).toHaveAttribute("href", "https://example.org/fa/features");
    await expect(alternate("x-default")).toHaveAttribute("href", "https://example.org/en/features");
    // The landing page maps to each edition's root.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(alternate("fa")).toHaveAttribute("href", "https://example.org/fa/");
  });

  test("language-switcher", async ({ page }) => {
    await page.goto("/features", { waitUntil: "domcontentloaded" });
    await settle(page);
    const trigger = page.getByRole("button", { name: "Switch language" });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const items = page.getByRole("menuitem");
    await expect(items).toHaveCount(2);
    const english = items.filter({ hasText: "English" });
    await expect(english).toHaveAttribute("aria-current", "true");
    await expect(english).toHaveAttribute("href", "https://example.org/en/features");
    const persian = items.filter({ hasText: "فارسی" });
    await expect(persian).not.toHaveAttribute("aria-current", "true");
    await expect(persian).toHaveAttribute("href", "https://example.org/fa/features");
    await expect(persian).toHaveAttribute("hreflang", "fa");
    // Escape closes the menu and returns focus to the trigger.
    await page.keyboard.press("Escape");
    await expect(items).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  // A site with fewer than two editions (the no-thebe fixture configures
  // none) renders no switcher, no hreflang tags, and -- the regression this
  // guards -- no empty toolbar slot taking a gap. The <li> stays in the DOM;
  // `empty:hidden` must take it out of the flow.
  test("language-switcher-absent-with-one-edition", async ({ page }) => {
    const noThebeBase = `http://localhost:${process.env.NO_THEBE_PORT}`;
    await page.goto(`${noThebeBase}/notebook`, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page.getByRole("heading", { name: "Notebook outputs" })).toBeVisible();
    await expect(page.locator(".qe-language-switcher")).toHaveCount(0);
    await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);
    const slot = page.locator(".qe-language-slot");
    await expect(slot).toHaveCount(1);
    await expect(slot).toBeHidden();
  });

  test("translators", async ({ page }) => {
    const block = page.locator(".qe-page__header-translators");
    // Project-level credit, default English label.
    await page.goto("/features", { waitUntil: "domcontentloaded" });
    await expect(block).toHaveText(/Translated by\s+Jane Translator/);
    await expect(block.locator("a")).toHaveAttribute("href", "https://example.org/jane");
    await expect(block.locator("a[rel~='author']")).toHaveCount(0);
    // Page-level override replaces it on that page only (the landing page here).
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(block).toHaveText(/Page-level Translator/);
    await expect(block).not.toHaveText(/Jane/);
    // An explicitly empty page value suppresses the block.
    await page.goto("/lists", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    await expect(block).toHaveCount(0);
  });

  test("rtl-document", async ({ page }) => {
    await page.goto(`${rtlBase}/`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "fa");
    // Persian label and the current edition marked in the switcher.
    await expect(page.locator(".qe-page__header-translators")).toHaveText(/ترجمهٔ\s+مترجم نمونه/);
    await page.getByRole("button", { name: "تغییر زبان" }).click();
    await expect(page.getByRole("menuitem").filter({ hasText: "فارسی" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await page.keyboard.press("Escape");
    // Code stays left-to-right inside the right-to-left document.
    const code = page.locator(".myst-code").first();
    await expect(code).toHaveCSS("direction", "ltr");
    // The toolbar's spacing is direction-neutral (`gap-x`, not a physical
    // `space-x` margin): the first two items -- now at the right edge -- keep
    // their gap instead of touching.
    const toolbar = page.locator("ul:has(> .qe-language-slot)");
    const first = await toolbar.locator("> li").nth(0).boundingBox();
    const second = await toolbar.locator("> li").nth(1).boundingBox();
    expect(first && second).toBeTruthy();
    // In RTL the first item is the rightmost, so the gap is first.x - second's right edge.
    expect(first!.x - (second!.x + second!.width)).toBeGreaterThanOrEqual(10);
  });

  test("rtl", async ({ page }) => {
    await page.goto(`${rtlBase}/`, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page).toHaveScreenshot("rtl.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    });
  });
});

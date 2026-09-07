import { test, expect, Page } from "@playwright/test";

/**
 * Full-page visual snapshots of the fixture, one per rendering surface.
 * `notebook` is the one that matters most for the 2.0.0 move — it exercises
 * the `@myst-theme` v1.0.0 output-node AST change (stream / execute_result /
 * error outputs).
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
  // Fancy ordered lists (#100/#101): markers stamped by the fixture's
  // fancy-lists.mjs plugin, so coverage is independent of the CLI's parser.
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
  // The agreed design (#83) is a disclosure that expands *above* the header's
  // blue divider, pushing it down — keeping the changelog adjacent to its
  // toggle and out of the lecture content. The geometry assertions below pin
  // that, since a panel that rendered below the divider would still look
  // plausible in isolation.
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

    // DrDrij's "keep font sizes consistent": the toggle and the changelog copy
    // are one type size (0.85rem), so the block reads as a unit.
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
  // roman-period, decimal control, and (#121) the same roman-parens list
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

    // #121: the same stamped roman-parens list, wrapped in `prf:theorem`.
    // Two load-bearing behaviours were untested while every fixture list sat
    // in the page body: myst-to-react's proof renderer passes its children
    // through the same <MyST/> dispatcher that consults LIST_RENDERERS, and
    // nothing in styles/lists.css scopes a selector to body-vs-proof. A
    // regression in either would drop the ~330 list items across the dp books'
    // prf:* blocks back to decimals — and moves far too few pixels for the
    // snapshot budget, so it is pinned here rather than by screenshot.
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

  // Launch is a direct link to Colab — the only launch target (BinderHub was
  // deliberately not offered, #26; the private JupyterHub option was removed in
  // #87). Asserting the anchor's href rather than a stubbed window.open keeps
  // this offline and deterministic, and pins that the control is a *link*, so a
  // regression back to a chooser would fail here. The repo part comes from the
  // fixture's `github` field, so only the stable pieces (host, .notebooks
  // convention, branch, path) are matched.
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
      /^https:\/\/colab\.research\.google\.com\/github\/QuantEcon\/[\w.-]+\.notebooks\/blob\/main\/notebook\.ipynb$/
    );
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
      // wouldn't distinguish the final portaled placement from the earlier
      // in-article iterations. Substring regex: resilient to upstream label
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

/**
 * Multilingual editions: the language switcher and hreflang alternates
 * (#90), right-to-left layout (#91) and translator credit (#143). The main
 * fixture configures two editions (en current) and a project-level
 * translator with a page-level override on `/` and a suppression on
 * `/lists`; `fixture-rtl` is the Persian edition with `enable_rtl`.
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

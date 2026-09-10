import { test, expect, type Page } from "@playwright/test";

/**
 * Static-build guard (#186) -- runs in the `static-chrome` project only,
 * against a `myst build --html` of the fixture served by a plain file server
 * (tests/visual/serve-static.sh). That is the shape every lecture site
 * deploys in, and the one the `myst start` harness structurally cannot see:
 * in MODE=app every loader is live, so `?_data=` fetches return JSON and the
 * defects below do not exist.
 *
 * The bug: a static build still hydrates a loader-bearing data router.
 * Pressing Back after an in-page anchor removes the hash, which React Router
 * does not treat as a hash-only navigation, so the loaders re-run, the host
 * answers `?_data=` with the page's HTML, and the next `data.page` read throws
 * -- a bare "Application Error" screen. Guarded by the `shouldRevalidate`
 * exports in app/revalidate.ts.
 */

/** Same-document fragment navigations must leave the JS context intact. */
const MARKER = "__qeStaticGuardMarker";

function watch(page: Page) {
  const dataRequests: string[] = [];
  const pageErrors: string[] = [];
  page.on("request", (req) => {
    if (/[?&]_data=/.test(req.url())) dataRequests.push(req.url());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  return { dataRequests, pageErrors };
}

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "load" });
  await page.evaluate((key) => {
    (window as unknown as Record<string, unknown>)[key] = true;
  }, MARKER);
  return page.title();
}

const markerSurvives = (page: Page) =>
  page.evaluate((key) => (window as unknown as Record<string, unknown>)[key] === true, MARKER);

/**
 * The failure mode is total, so the assertions can be blunt -- but the error
 * screen only lands once the stray loader fetches have *returned*, so give the
 * router a beat to process them before reading the DOM. The mechanism (any
 * `?_data=` fetch at all) is asserted first, so a regression names itself.
 */
async function expectIntact(page: Page, title: string, watched: ReturnType<typeof watch>) {
  await page.waitForTimeout(1500);
  expect(watched.dataRequests, "a static host cannot answer loader fetches").toEqual([]);
  await expect(page).not.toHaveTitle("Application Error!");
  await expect(page).toHaveTitle(title);
  // The page title lives in the header block, outside `main`, so check the
  // article body itself.
  await expect(page.locator("article main").first()).toBeVisible();
  await expect(page.locator("article main h2").first()).toBeVisible();
  expect(watched.pageErrors).toEqual([]);
}

test.describe("Static build -- in-page anchors (#186)", () => {
  test("back after an outline entry keeps the page", async ({ page }) => {
    const watched = watch(page);
    const title = await open(page, "/features/");

    // The outline is built from the DOM after mount, so its presence also
    // proves the client has hydrated before we navigate.
    const entry = page.locator('nav:has-text("On this page") ul a').first();
    await expect(entry).toBeVisible();
    await entry.click();
    await expect(page).toHaveURL(/#./);
    expect(await markerSurvives(page), "outline click must be a same-document navigation").toBe(true);

    await page.goBack();
    await expect(page).toHaveURL(/\/features\/$/);
    await expectIntact(page, title, watched);
  });

  for (const path of ["/", "/features/"]) {
    test(`back after "Top" keeps the page (${path})`, async ({ page }) => {
      const watched = watch(page);
      const title = await open(page, path);

      // A bare fragment, as the Sphinx build renders it: the provider `Link`
      // resolved against the un-slashed SSR pathname and turned "Top" into a
      // full reload through a 301 on every lecture page.
      const top = page.locator(".qe-back-to-top a");
      await expect(top).toHaveAttribute("href", "#top");

      await page.evaluate(() => window.scrollTo(0, 600));
      await expect(top).toHaveCSS("opacity", "1");
      await top.click();
      await expect(page).toHaveURL(/#top$/);
      expect(await markerSurvives(page), '"Top" must not reload the document').toBe(true);
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(600);

      await page.goBack();
      await expect(page).not.toHaveURL(/#/);
      await expectIntact(page, title, watched);
    });
  }
});

import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * FOUC guard (WebKit) — QuantEcon/quantecon-theme-src#66.
 *
 * The flash this guards against is NOT a pre-stylesheet first paint — WebKit
 * holds first paint until the `<head>` stylesheets apply. It is the window
 * where those stylesheets stop applying after load: when server and client
 * markup diverge in the head, React's hydration-recovery re-render re-creates
 * head nodes, which re-applies a `<link>` asynchronously but an inline
 * `<style>` synchronously (see the CRITICAL_CSS comment in `app/root.tsx`, and
 * #126 for the measurements). In that window the page shows the default serif
 * font and the content grid collapsed to `display: block` unless the inlined
 * critical CSS covers it.
 *
 * The contents drawer is checked here too: any panel that relies on author CSS
 * to stay hidden paints open in that same frame. It is a popover, so the UA
 * stylesheet hides it and the assertions below expect that. The toggle's close
 * icon and the "back to top" button are the other two things that would paint
 * without author CSS; each has a rule in the critical block and is asserted on.
 *
 * This test makes the failure mode deterministic by **aborting all external
 * stylesheets**, so the only styling that can reach the page is the inline
 * `<style>`. If the inline critical CSS regresses, the "styled first paint"
 * assertion below fails. The control case strips the inline block to prove the
 * abort genuinely removes external styling (otherwise the guard would be moot).
 *
 * Runs in the `webkit-fouc` Playwright project only — the flash was only ever
 * observed in Safari/WebKit (quantecon-theme-src#66), and this suite's
 * abort-the-stylesheets simulation exercises the guard there.
 */

const PAGE = "/";

/**
 * Aborts external stylesheets, optionally stripping the inline critical block.
 *
 * Returns a `strippedCritical` probe rather than trusting the regex to have
 * matched. If `CRITICAL_CSS` is ever reshaped so the pattern stops matching,
 * the control would otherwise run against a fully-styled page and fail on its
 * *assertions* — reporting "expected block, received grid", which points at the
 * critical CSS rather than at the stale pattern that is actually at fault.
 * Asserting this probe turns that into a failure that names itself.
 */
async function isolateInlineCss(page: Page, { stripCritical = false } = {}) {
  const probe = { strippedCritical: false };
  await page.route("**/*", async (route: Route) => {
    const req = route.request();

    // External stylesheets never apply -> isolates the inline critical CSS.
    if (req.resourceType() === "stylesheet" || /\.css(\?|$)/i.test(req.url())) {
      return route.abort();
    }

    // Control: serve the document with the inlined critical <style> removed.
    if (req.resourceType() === "document" && stripCritical) {
      const response = await route.fetch();
      const served = await response.text();
      const body = served.replace(
        /<style>[^<]*:where\(\.simple-center-grid\)[^<]*<\/style>/g,
        "<!-- critical CSS removed for control -->",
      );
      if (body !== served) probe.strippedCritical = true;
      return route.fulfill({ response, body });
    }

    return route.continue();
  });
  return probe;
}

/**
 * Key under which the in-page sampler parks its measurement on `window`.
 */
const SAMPLE_KEY = "__qeFirstPaint";

type FirstPaint = {
  gridDisplay: string;
  bodyFont: string;
  sidebarRendered: boolean | null;
  toggleCloseRendered: boolean | null;
  backToTopOpacity: string | null;
  appliedExternal: boolean;
  criticalInline: boolean;
};

/**
 * Measure at first paint, from inside the page, before React hydrates.
 *
 * Measuring from the test after `domcontentloaded` would leave roughly a
 * 150ms budget before hydration, and that is not enough: when hydration fails
 * (React #418/#423; timings in #126) the recovery re-render puts the critical
 * `<style>` back — measured at 150–240ms after `DOMContentLoaded`. The control
 * strips that block from the served HTML precisely to prove the guard is
 * meaningful, so if React restores it before the sample, the control's
 * assertions all flip at once and `fouc-guard` goes red for reasons that have
 * nothing to do with the critical CSS.
 *
 * Sampling from an init script closes that window: it runs on
 * `DOMContentLoaded`, in-page and synchronously, and it reads only the DOM. The
 * ordering is empirical rather than guaranteed — Remix v1 emits its entry as an
 * inline `type="module" async` script whose imports must resolve before
 * `entry.client.tsx` even schedules `requestIdleCallback`/`setTimeout` for
 * `hydrateRoot`, and WebKit dispatches DOMContentLoaded at end of parse — but
 * that ordering is what the #126 timings show, with the earliest observed
 * restoration an order of magnitude later than the sample.
 *
 * Note this holds even when ordinary loads hydrate cleanly: a control that
 * strips the inline block guarantees a hydration mismatch by construction, so
 * no repair to hydration itself could make a post-hydration sample safe here.
 */
async function firstPaintState(page: Page): Promise<FirstPaint> {
  await page.addInitScript((key) => {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        const grid = document.querySelector(".simple-center-grid");
        const sidebar = document.querySelector(".qe-toc");
        const closeIcon = document.querySelector(".qe-toc-toggle__close");
        const backToTop = document.querySelector(".qe-back-to-top");
        const applied = Array.from(document.styleSheets).filter((sheet) => {
          try {
            return !!sheet.cssRules && sheet.cssRules.length > 0; // applied, not pending
          } catch {
            return false; // cross-origin / not yet loaded
          }
        });
        const sample: FirstPaint = {
          gridDisplay: grid ? getComputedStyle(grid).display : "(absent)",
          bodyFont: getComputedStyle(document.body).fontFamily,
          // A closed popover is `display: none` per the UA stylesheet, so it
          // paints nothing even with no author CSS at all — hence both tests
          // below expect it hidden.
          //
          // `null` when the element is missing, so a renamed hook fails the
          // explicit presence guard instead of silently satisfying "not
          // rendered".
          sidebarRendered: sidebar ? sidebar.getClientRects().length > 0 : null,
          // The toggle's close icon is hidden by a critical-CSS rule; without
          // it both icons paint side by side on the first frame. `null` when
          // missing, for the same reason as above.
          toggleCloseRendered: closeIcon ? closeIcon.getClientRects().length > 0 : null,
          // "Back to top" is hidden by opacity rather than display, and
          // carries a transition — so if it paints visible here it will *fade*
          // out once the stylesheet lands. The critical block pins it to 0.
          // `null` when missing, as above.
          backToTopOpacity: backToTop ? getComputedStyle(backToTop).opacity : null,
          // null href == an inline <style>; any string == an external sheet
          // that applied
          appliedExternal: applied.some((sheet) => !!sheet.href),
          // Whether the inline block is present in the document as sampled —
          // the state the assertions below are actually about.
          criticalInline: Array.from(document.querySelectorAll("style")).some((el) =>
            (el.textContent ?? "").includes(":where(.simple-center-grid)"),
          ),
        };
        (window as unknown as Record<string, unknown>)[key] = sample;
      },
      { once: true },
    );
  }, SAMPLE_KEY);

  await page.goto(PAGE, { waitUntil: "domcontentloaded" });
  await page.waitForFunction((key) => !!(window as any)[key], SAMPLE_KEY, { timeout: 5000 });
  return page.evaluate<FirstPaint, string>((key) => (window as any)[key], SAMPLE_KEY);
}

test.describe("FOUC guard (WebKit) — inline critical CSS styles the first paint", () => {
  test("page-as-served is styled even with external CSS unavailable", async ({ page }) => {
    await isolateInlineCss(page);
    const state = await firstPaintState(page);

    // No external sheet applied, so anything styled below comes from inline CSS.
    expect(state.appliedExternal).toBe(false);
    expect(
      state.criticalInline,
      "the inline critical <style> is missing from the page as served — app/root.tsx no longer inlines CRITICAL_CSS"
    ).toBe(true);
    // The reported FOUC symptoms must be absent on first paint:
    expect(state.gridDisplay).toBe("grid"); // grid not collapsed to block
    // Head of the stack, not just a substring: "Source Sans 3 Variable" (the
    // family name of the self-hosted webfont) contains "Source Sans 3", so the
    // looser regex would keep passing if CRITICAL_CSS and tailwind.config.js
    // drifted apart. This reads the *declared* stack — the @font-face rules
    // live in a <link>, which this test aborts, so what actually paints is the
    // `sans-serif` tail. That is the point: the guard is about sans-vs-serif,
    // not about the webfont having arrived.
    expect(state.bodyFont).toMatch(/^["']?Source Sans 3 Variable["']?\s*,/);
    expect(
      state.sidebarRendered,
      "`.qe-toc` not found — the contents drawer was renamed or removed"
    ).not.toBeNull();
    expect(state.sidebarRendered).toBe(false); // closed popover paints nothing
    expect(
      state.toggleCloseRendered,
      "`.qe-toc-toggle__close` not found — the toggle's close icon was renamed or removed"
    ).not.toBeNull();
    expect(state.toggleCloseRendered).toBe(false); // hidden by the inline rule
    expect(
      state.backToTopOpacity,
      "`.qe-back-to-top` not found — the back-to-top button was renamed or removed"
    ).not.toBeNull();
    expect(state.backToTopOpacity).toBe("0"); // pinned by the inline rule
  });

  test("control: removing the inline critical CSS reproduces the FOUC", async ({ page }) => {
    const probe = await isolateInlineCss(page, { stripCritical: true });
    const state = await firstPaintState(page);

    // Preconditions first, so a stale strip pattern reports as itself rather
    // than as a run of confusing assertion failures about the critical CSS.
    expect(
      probe.strippedCritical,
      "the strip pattern matched nothing in the served HTML — CRITICAL_CSS was reshaped and the regex in isolateInlineCss needs updating"
    ).toBe(true);
    expect(
      state.criticalInline,
      "the inline critical <style> is present despite the strip — it was restored before the sample (see #126)"
    ).toBe(false);

    // With no CSS at all, the page is unstyled — this proves the guard above is
    // meaningful (the external abort really does strip styling).
    expect(state.appliedExternal).toBe(false);
    expect(state.gridDisplay).toBe("block");
    expect(state.bodyFont).not.toMatch(/Source Sans 3/);
    // Hidden even with every stylesheet stripped — that is the UA stylesheet's
    // doing, not ours, so this control expects it hidden rather than flashing.
    expect(
      state.sidebarRendered,
      "`.qe-toc` not found — the contents drawer was renamed or removed"
    ).not.toBeNull();
    expect(state.sidebarRendered).toBe(false);
    // Unlike the drawer, the close icon relies on the critical CSS: with it
    // stripped, both icons paint — which proves the inline rule is doing work.
    expect(
      state.toggleCloseRendered,
      "`.qe-toc-toggle__close` not found — the toggle's close icon was renamed or removed"
    ).not.toBeNull();
    expect(state.toggleCloseRendered).toBe(true);
    // Same for "back to top": with the inline rule gone it paints at full
    // opacity, which is the state the transition would then animate away from.
    expect(
      state.backToTopOpacity,
      "`.qe-back-to-top` not found — the back-to-top button was renamed or removed"
    ).not.toBeNull();
    expect(state.backToTopOpacity).toBe("1");
  });
});

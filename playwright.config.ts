import { defineConfig, devices } from "@playwright/test";

/**
 * Visual-regression config for the QuantEcon MyST theme.
 *
 * Unlike the Sphinx book-theme (static HTML), this theme is a runtime Remix
 * server, so tests run against a live `myst start` of the fixture in
 * `tests/visual/fixture`, with the theme under test selected via the
 * `THEME_TEMPLATE` env var (see `tests/visual/serve.sh` and the README).
 *
 * Before/after the 2.0.0 upgrade:
 *   1. baseline (v1.1.1): THEME_TEMPLATE=<deployed main zip>  npm run test:visual:update
 *   2. candidate (2.0.0): THEME_TEMPLATE=<local build dir>    npm run test:visual
 * Diffs in step 2 are exactly what the upgrade changed.
 */
const PORT = process.env.PORT || "3111";
const baseURL = `http://localhost:${PORT}`;
// Second fixture project WITHOUT `project.thebe`, used to assert the
// live-compute toggle is absent when a project hasn't opted into Thebe.
const NO_THEBE_PORT = process.env.NO_THEBE_PORT || "3112";
const noThebeURL = `http://localhost:${NO_THEBE_PORT}`;
// The two fixtures must not share a port: with reuseExistingServer, the second
// webServer entry would silently "reuse" the first (thebe-enabled) server and
// the absent-toggle test would assert against the wrong fixture.
if (NO_THEBE_PORT === PORT) {
  throw new Error(`NO_THEBE_PORT (${NO_THEBE_PORT}) must differ from PORT (${PORT})`);
}
// Write the resolved value back so test workers read one source of truth
// (tests/visual/theme.spec.ts builds the no-thebe URL from this).
process.env.NO_THEBE_PORT = NO_THEBE_PORT;
// Third fixture: a right-to-left Persian edition (`enable_rtl`, `fa` current
// in the language switcher, translator credit) for the multilingual tests.
const RTL_PORT = process.env.RTL_PORT || "3113";
const rtlURL = `http://localhost:${RTL_PORT}`;
if (RTL_PORT === PORT || RTL_PORT === NO_THEBE_PORT) {
  throw new Error(`RTL_PORT (${RTL_PORT}) must differ from PORT and NO_THEBE_PORT`);
}
process.env.RTL_PORT = RTL_PORT;

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    // results.json feeds the PR summary comment in the `visual` CI job.
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  // Baselines are platform-suffixed (…-darwin, …-linux): font antialiasing
  // differs across OSes, so local macOS runs and ubuntu CI each diff against
  // pixels rendered on their own platform. CI baselines are refreshed by
  // commenting /update-snapshots on a PR (.github/workflows/update-snapshots.yml).
  snapshotPathTemplate: "{testDir}/__snapshots__/{projectName}-{platform}/{arg}{ext}",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    // Visual snapshots run on Chromium (theme.spec.ts).
    {
      name: "desktop-chrome",
      testMatch: /theme\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile-chrome",
      testMatch: /theme\.spec\.ts/,
      use: { ...devices["Pixel 5"] },
    },
    // FOUC guard runs on WebKit only — Chromium paint-holds and can't show the
    // flash (fouc.spec.ts, see QuantEcon/quantecon-theme-src#66).
    {
      name: "webkit-fouc",
      testMatch: /fouc\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: [
    {
      command: "bash tests/visual/serve.sh",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
    {
      // Thebe-disabled fixture (no `project.thebe`) on a second port, for the
      // `live-compute-toggle-absent-without-thebe` test in theme.spec.ts.
      command: `FIXTURE_DIR=fixture-no-thebe PORT=${NO_THEBE_PORT} bash tests/visual/serve.sh`,
      url: noThebeURL,
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
    {
      // Right-to-left fixture (tests/visual/fixture-rtl) for the `rtl`
      // snapshot and the multilingual assertions in theme.spec.ts.
      command: `FIXTURE_DIR=fixture-rtl PORT=${RTL_PORT} bash tests/visual/serve.sh`,
      url: rtlURL,
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
  ],
});

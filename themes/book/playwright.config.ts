import { defineConfig, devices } from '@playwright/test';

/**
 * Behavioural tests for the book theme: a static build of the fixture book
 * (tests/fixture) served by tests/serve.sh, with the theme under test chosen
 * by THEME_TEMPLATE. Assertions only, no pixel snapshots: the page types, the
 * navigation, the environments, the code cards, the colour-scheme default and
 * a clean hydration.
 */
const PORT = process.env.PORT || '3121';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1360, height: 900 } } }],
  webServer: {
    command: `PORT=${PORT} bash tests/serve.sh`,
    // A built page, not the bare port: the server is up only once the build is done.
    url: `http://localhost:${PORT}/contents/`,
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
  },
});

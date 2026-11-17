import { test, expect, type Page } from '@playwright/test';

/** Fails the test on any uncaught error, including React hydration errors (#418/#423). */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test.describe('cover', () => {
  test('title, authors, actions and citation meta', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page.locator('.qb-hero h1')).toContainText('A Fixture Book');
    await expect(page.locator('.qb-hero__vol')).toHaveText('Theory and Practice');
    await expect(page.locator('.qb-hero__author')).toContainText('Example University');
    await expect(page.getByRole('link', { name: 'Read online' })).toHaveAttribute('href', /\/contents\/?$/);
    await expect(page.getByRole('link', { name: 'Source' })).toBeVisible();
    // No PDF in the fixture's downloads: no button.
    await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveCount(0);
    await expect(page.locator('meta[name="citation_title"]')).toHaveAttribute('content', /A Fixture Book/);
    await expect(page.locator('meta[name="citation_doi"]')).toHaveAttribute('content', '10.0000/fixture');
    expect(errors).toEqual([]);
  });
});

test.describe('contents', () => {
  test('front matter in roman numerals, parts, glosses, and not itself', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/contents/');
    const items = page.locator('.qb-toc__item');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('i');
    await expect(items.nth(0)).toContainText('Preface');
    await expect(page.locator('.qb-toc__part-label')).toContainText(['Front Matter', 'Foundations', 'Applications']);
    await expect(page.locator('.qb-toc__desc')).toHaveText('Metric spaces and contractions.');
    await expect(page.locator('.qb-toc')).not.toContainText('Contents');
    expect(errors).toEqual([]);
  });
});

test.describe('chapter', () => {
  test('opener, breadcrumb and its menus', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    await expect(page.locator('.qb-chapter-head h1')).toContainText('Operators');
    await expect(page.locator('.qb-chapter-head .qb-eyebrow')).toHaveText('Part I · Foundations');
    await expect(page.locator('.qb-lede')).toHaveText('Metric spaces and contractions.');
    const chap = page.locator('.qb-crumb--chap .qb-crumb__btn');
    await expect(chap).toContainText('Operators');
    await page.locator('.qb-crumb--part .qb-crumb__btn').click();
    const partMenu = page.locator('#qb-crumb-part');
    await expect(partMenu).toBeVisible();
    await expect(partMenu).toContainText('Applications');
    await page.keyboard.press('Escape');
    await expect(partMenu).toBeHidden();
    await page.locator('.qb-crumb--sec .qb-crumb__btn').click();
    await expect(page.locator('#qb-crumb-sec')).toContainText('Lists');
    expect(errors).toEqual([]);
  });

  test('theorem environments take the numbering template', async ({ page }) => {
    await page.goto('/ch-one/');
    const theorem = page.locator('.qb-env[data-kind="theorem"]');
    await expect(theorem.locator('.qb-env__tag')).toContainText('Theorem');
    await expect(theorem.locator('.qb-env__name')).toContainText('Banach');
    // `numbering: {proof:property: {template: 'Fact %s'}}` heads it "Fact".
    await expect(page.locator('.qb-env[data-kind="property"] .qb-env__tag')).toContainText('Fact');
    await expect(page.locator('.qb-env[data-kind="proof"] .qb-env__tag')).toContainText('Proof');
  });

  test('code cards name the language and copy', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/ch-two/');
    const cards = page.locator('.qb-codecard');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).locator('.qb-codecard__lang')).toHaveText('Python');
    await expect(cards.nth(1).locator('.qb-codecard__lang')).toHaveText('Julia');
    await expect(cards.nth(0).locator('.hljs-keyword').first()).toHaveText('def');
    await cards.nth(0).locator('.qb-codecard__copy').click();
    await expect(cards.nth(0).locator('.qb-codecard__copy')).toHaveText('copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('return 2 * x');
  });

  test('drawer, and previous / next', async ({ page }) => {
    await page.goto('/ch-one/');
    const drawer = page.locator('#qb-drawer');
    await expect(drawer).not.toHaveAttribute('data-open', '');
    await page.locator('.qb-burger').click();
    await expect(drawer).toHaveAttribute('data-open', '');
    await expect(drawer.locator('[aria-current="page"]')).toContainText('Operators');
    await page.keyboard.press('Escape');
    await expect(drawer).not.toHaveAttribute('data-open', '');
    await expect(page.locator('.qb-chap-nav__prev')).toContainText('Preface');
    await expect(page.locator('.qb-chap-nav__next')).toContainText('Computation');
  });
});

test.describe('colour scheme', () => {
  test('light by default, even when the OS prefers dark', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('/ch-one/');
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await ctx.close();
  });

  test("the reader's choice wins, and hydrates cleanly", async ({ browser }) => {
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => localStorage.setItem('myst:theme', 'dark'));
    const page = await ctx.newPage();
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    await page.getByRole('button', { name: 'Toggle dark mode' }).click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    expect(await page.evaluate(() => localStorage.getItem('myst:theme'))).toBe('light');
    expect(errors).toEqual([]);
    await ctx.close();
  });
});

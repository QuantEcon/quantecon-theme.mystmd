/**
 * Browser check for the long-cell tags PROTOTYPE (QuantEcon/quantecon-theme.mystmd#242).
 *
 * Not part of `npm run test:visual`: the visual fixture has no executed long
 * cells, and the prototype's pages are the theme-parity corpus's
 * (QuantEcon/test-lecture-theme-mystmd, `long_cells.md` and `code_cells.md`).
 * Build that corpus against this theme with `site.options.long_cell_tags: true`
 * and cells executed, serve the result, then:
 *
 *   node tests/visual/static-server.mjs <corpus>/_build/html 3177 &
 *   node scripts/prototype-long-cell-check.mjs http://localhost:3177 <dir for screenshots>
 *
 * It checks the caps, the Expand / Collapse bar by keyboard and by pointer, the
 * scroll back into view, the scroll regions' focusability, that a short tagged
 * cell shows no bar, and that the console is clean (no hydration mismatch); then
 * it crops the four regions at desktop 1280, tablet 820 and phone 390, light
 * and dark. Exit 1 on any failed check. Goes when the prototype does.
 */
import { chromium } from '@playwright/test';
const [base, out] = process.argv.slice(2);
const VIEWPORTS = { desktop: { width: 1280, height: 900 }, tablet: { width: 820, height: 1100 }, phone: { width: 390, height: 844 } };
const browser = await chromium.launch();
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'} - ${name}${detail ? ' -- ' + detail : ''}`); };

// ---- behaviour, once, at desktop ----
{
  const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`${m.type()}: ${m.text().slice(0, 160)}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${String(e).slice(0, 160)}`));
  await page.goto(`${base}/long-cells/`, { waitUntil: 'load' });
  await page.waitForTimeout(1500); // hydration

  const input = page.locator('.qe-collapse--input');
  const bar = input.locator('.qe-collapse__bar');
  const body = input.locator('.qe-collapse__body');
  const h0 = (await body.boundingBox()).height;
  const fontPx = parseFloat(await input.evaluate((el) => getComputedStyle(el).fontSize));
  ok('collapse-20 input is capped at 20.5em of the code font', Math.abs(h0 - 20.5 * fontPx) < 2, `${h0.toFixed(1)}px at ${fontPx}px`);
  ok('bar reads "Expand", aria-expanded=false', (await bar.innerText()).startsWith('Expand') && (await bar.getAttribute('aria-expanded')) === 'false');
  ok('aria-controls names the body', (await bar.getAttribute('aria-controls')) === (await body.getAttribute('id')));

  await bar.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  const h1 = (await body.boundingBox()).height;
  ok('Enter on the bar expands the input', h1 > h0 * 1.5 && (await bar.getAttribute('aria-expanded')) === 'true', `${h0.toFixed(0)}px -> ${h1.toFixed(0)}px`);
  ok('bar now reads "Collapse"', (await bar.innerText()).startsWith('Collapse'));
  await page.keyboard.press('Space'); await page.waitForTimeout(900);
  const h2 = (await body.boundingBox()).height;
  ok('Space collapses it again', Math.abs(h2 - h0) < 2);
  const inView = await input.evaluate((el) => { const r = el.getBoundingClientRect(); return r.bottom <= window.innerHeight + 1 && r.bottom > 0; });
  ok('after collapsing, the end of the region is in view', inView);

  const out = page.locator('.qe-collapse--output');
  const obar = out.locator('.qe-collapse__bar');
  const oh0 = (await out.locator('.qe-collapse__body').boundingBox()).height;
  await obar.click(); await page.waitForTimeout(300);
  const oh1 = (await out.locator('.qe-collapse__body').boundingBox()).height;
  ok('collapse-output-20: click expands the output', oh1 > oh0 * 1.5, `${oh0.toFixed(0)}px -> ${oh1.toFixed(0)}px`);
  await obar.click(); await page.waitForTimeout(600);

  for (const side of ['input', 'output']) {
    const s = page.locator(`.qe-scroll--${side}`);
    const m = await s.evaluate((el) => ({ h: el.clientHeight, sh: el.scrollHeight, oy: getComputedStyle(el).overflowY, f: parseFloat(getComputedStyle(el).fontSize), tab: el.tabIndex }));
    ok(`scroll-${side}: capped at 24em, scrolls, focusable`, Math.abs(m.h - 24 * m.f) < 2 && m.sh > m.h && m.oy === 'auto' && m.tab === 0, `${m.h}px of ${m.sh}px`);
  }
  await page.locator('.qe-scroll--output').focus(); await page.keyboard.press('End'); await page.waitForTimeout(300);
  ok('keyboard scrolls the focused output region', (await page.locator('.qe-scroll--output').evaluate((el) => el.scrollTop)) > 0);

  // a short cell tagged collapse-20 (code_cells.md): no bar once measured
  await page.goto(`${base}/code-cells/`, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const short = page.locator('.qe-collapse--input');
  ok('a short collapse-20 cell shows no bar after hydration', (await short.locator('.qe-collapse__bar').count()) === 0 && (await short.getAttribute('data-overflows')) === 'false');
  ok('no console errors, warnings or hydration mismatches', problems.length === 0, problems.slice(0, 3).join(' | '));
  await ctx.close();
}

// ---- screenshots: three viewports, light and dark ----
for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`${base}/long-cells/`, { waitUntil: 'load' }); await page.waitForTimeout(1200);
    if (scheme === 'dark') await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(200);
    for (const [label, sel] of [['1-collapse-input', '.qe-collapse--input'], ['2-scroll-input', '.qe-scroll--input'], ['3-scroll-output', '.qe-scroll--output'], ['4-collapse-output', '.qe-collapse--output']]) {
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.locator(sel).screenshot({ path: `${out}/${name}-${scheme}-${label}.png` });
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`${results.filter(Boolean).length} of ${results.length} checks passed`);
process.exit(results.every(Boolean) ? 0 : 1);

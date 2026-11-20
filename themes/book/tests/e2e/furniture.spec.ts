import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * The reading furniture on the fixture book: admonitions, citations and the
 * references, cross-reference previews, footnotes, margin notes and the
 * search dialog. Each test checks the element is there, that the book's
 * rules (not upstream's) style it, that its hover card opens, and that the
 * page raises no errors.
 */

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

/** A computed style of the first match. */
function css(loc: Locator, prop: string) {
  return loc.first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
}

/** A theme token's computed value, as a colour the browser reports. */
function token(page: Page, name: string) {
  return page.evaluate((n) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${n})`;
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);
}

/** Hovers a trigger and returns the hover card that opens. */
async function openCard(page: Page, trigger: Locator) {
  await trigger.scrollIntoViewIfNeeded();
  await trigger.hover();
  const card = page.locator('.hover-card-content .hover-document');
  await expect(card).toBeVisible();
  return card;
}

test.describe('furniture', () => {
  test('admonitions: a hairline and an italic label in the kind’s hue, no fill', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-two/');
    const kinds = ['note', 'tip', 'hint', 'important', 'seealso', 'attention', 'caution', 'warning', 'danger', 'error'];
    for (const kind of kinds) {
      await expect(page.locator(`.qb-article .myst-admonition-${kind}`).first()).toBeVisible();
    }
    const hues: Record<string, string> = {
      note: '--qb-c-theorem',
      tip: '--qb-c-example',
      important: '--qb-c-definition',
      warning: '--qb-c-remark',
      danger: '--qb-c-danger',
    };
    for (const [kind, hue] of Object.entries(hues)) {
      const box = page.locator(`.qb-article aside.myst-admonition-${kind}`);
      const colour = await token(page, hue);
      expect(await css(box, 'border-left-color')).toBe(colour);
      // 1.5px, which Chromium draws as a whole device pixel at 1x.
      expect(parseFloat(await css(box, 'border-left-width'))).toBeGreaterThanOrEqual(1);
      expect(await css(box, 'background-color')).toBe('rgba(0, 0, 0, 0)');
      expect(await css(box, 'box-shadow')).toBe('none');
      const label = box.locator('.myst-admonition-header-text');
      expect(await css(label, 'color')).toBe(colour);
      expect(await css(label, 'font-style')).toBe('italic');
      await expect(box.locator('.myst-admonition-header svg').first()).toBeHidden();
    }
    // A generic admonition keeps its own title, and takes the neutral grey
    // rather than note-blue.
    await expect(page.locator('.qb-article .myst-admonition-header-text', { hasText: 'Problem' })).toBeVisible();
    const generic = page.locator('.qb-article aside.qb-admonition-generic');
    await expect(generic).toHaveCount(1);
    await expect(generic).toContainText('Problem');
    const grey = await token(page, '--qb-c-proof');
    expect(await css(generic, 'border-left-color')).toBe(grey);
    expect(await css(generic.locator('.myst-admonition-header-text'), 'color')).toBe(grey);
    // A real note is not tagged.
    await expect(page.locator('.qb-article aside.myst-admonition-note.qb-admonition-generic')).toHaveCount(1);
    await expect(page.locator('.qb-article aside.myst-admonition-note:not(.qb-admonition-generic)')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('collapsible admonitions and dropdowns open and close', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-two/');
    const folded = page.locator('.qb-article details.myst-admonition');
    await expect(folded).toHaveCount(1);
    await expect(folded.locator('.myst-admonition-body')).toBeHidden();
    await folded.locator('summary').click();
    await expect(folded.locator('.myst-admonition-body')).toBeVisible();
    expect(await css(folded, 'background-color')).toBe('rgba(0, 0, 0, 0)');

    const dropdown = page.locator('.qb-article details.myst-dropdown');
    await expect(dropdown).toHaveCount(1);
    expect(await css(dropdown.locator('.myst-dropdown-header-title'), 'font-style')).toBe('italic');
    await dropdown.locator('summary').click();
    await expect(dropdown.locator('.myst-dropdown-body')).toContainText('Its body.');
    await dropdown.locator('summary').click();
    await expect(dropdown.locator('.myst-dropdown-body')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('exercises and solutions keep their mono clay label', async ({ page }) => {
    await page.goto('/ch-two/');
    const header = page.locator('#ex-double .myst-exercise-header');
    expect(await css(header, 'text-transform')).toBe('uppercase');
    expect(await css(header, 'color')).toBe(await token(page, '--qb-clay'));
    expect(await css(page.locator('#ex-double'), 'border-left-color')).toBe(await token(page, '--qb-rule'));
  });

  test('citations in each form, their cards and the references', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    const text = page.locator('.qb-article p:has(cite)');
    await expect(text).toContainText('Banach (1922)'); // {cite}
    await expect(text.locator('.cite-group.parenthetical')).toContainText('Ljungqvist & Sargent, 2018'); // {cite:p}
    await expect(text.locator('.cite-group.narrative').first()).toContainText('Stokey'); // {cite:t}
    await expect(text).toContainText('Ljungqvist & Sargent'); // {cite:author}
    await expect(text).toContainText('2018'); // {cite:year}
    const cite = text.locator('cite').first();
    expect(await css(cite, 'font-style')).toBe('normal');
    expect(await css(cite.locator('.hover-link'), 'text-decoration-style')).toBe('dotted');

    const card = await openCard(page, text.locator('.cite-group.parenthetical cite').first());
    await expect(card).toContainText('Recursive Methods in Economic Dynamics');
    expect(await css(card, 'background-color')).toBe(await token(page, '--qb-paper'));
    expect(await css(card, 'border-left-color')).toBe(await token(page, '--qb-blue'));

    const refs = page.locator('#references.qb-notes');
    await expect(refs.locator('.myst-bibliography-header')).toHaveText(/References/);
    expect(await css(refs.locator('.myst-bibliography-header'), 'text-transform')).toBe('uppercase');
    await expect(refs.locator('.myst-bibliography-item')).toHaveCount(3);
    expect(await css(refs.locator('.myst-bibliography-item'), 'text-indent')).not.toBe('0px');
    expect(errors).toEqual([]);
  });

  test('cross-references preview equations, figures, tables, theorems and sections', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    const xref = (id: string) => page.locator(`.qb-article p a.hover-link[href$="#${id}"]`).first();
    const expected: Array<[string, string]> = [
      ['eq-contraction', '.katex'],
      ['fig-orbit', 'figure img'],
      ['tbl-rates', 'table'],
      ['thm-banach', '.qb-env[data-kind="theorem"]'],
      ['sec-metric', 'h2, h3'],
    ];
    for (const [id, inside] of expected) {
      const link = xref(id);
      expect(await css(link, 'text-decoration-style')).toBe('dotted');
      const card = await openCard(page, link);
      await expect(card.locator(inside).first()).toBeVisible();
      // Move away so the next card is the only one open.
      await page.mouse.move(5, 5);
      await expect(page.locator('.hover-card-content')).toHaveCount(0);
    }
    // From another page, the theorem's card fetches ch-one's data.
    await page.goto('/ch-two/');
    const card = await openCard(page, page.locator('.qb-article a.hover-link[href*="thm-banach"]').first());
    await expect(card.locator('.qb-env__tag')).toContainText('Theorem');
    expect(errors).toEqual([]);
  });

  test('footnotes: marks, their cards, and one ruled list', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    const mark = page.locator('.qb-article [id^="fnref-"] sup a').first();
    // A bare numeral, as the design's sup.fnref draws it: no brackets.
    await expect(mark).toHaveText(/^\d+$/);
    expect(await css(mark, 'font-family')).toContain('Plex Mono');
    expect(await css(mark, 'color')).toBe(await token(page, '--qb-blue'));
    const card = await openCard(page, page.locator('.qb-article [id^="fnref-"] sup').first());
    await expect(card).toContainText('The footnote.');
    await page.mouse.move(5, 5);

    const notes = page.locator('#footnotes.qb-notes');
    await expect(notes.locator('.myst-footnotes-item')).toHaveCount(4);
    // Headed "Notes" in the faint colour; the notes in the muted colour.
    await expect(notes.locator('.myst-footnotes-header')).toHaveText(/^Notes/);
    expect(await css(notes.locator('.myst-footnotes-header'), 'color')).toBe(await token(page, '--qb-faint'));
    expect(await css(notes.locator('.myst-footnotes-list'), 'color')).toBe(await token(page, '--qb-muted'));
    // The ↩ shown, running on after the note in its face and colour, as the
    // design's `.footnotes li` has it (`a.plain`).
    const item = notes.locator('.myst-footnotes-item').first();
    const back = item.locator('.myst-footnote-backlinks a');
    await expect(back).toBeVisible();
    expect(await css(back, 'opacity')).toBe('1');
    expect(await css(back, 'color')).toBe(await token(page, '--qb-muted'));
    expect(await css(back, 'font-family')).toContain('Newsreader');
    const [noteBox, backBox] = await Promise.all([
      item.locator('.myst-footnote-content').boundingBox(),
      back.boundingBox(),
    ]);
    expect(Math.abs(backBox!.y - noteBox!.y)).toBeLessThan(8);
    // One hairline over the list, not one over the header and another over the list.
    const ruled = await notes.locator(':scope > *').evaluateAll((els) =>
      els.filter((e) => parseFloat(getComputedStyle(e).borderTopWidth) > 0).length,
    );
    expect(ruled).toBe(1);
    // The notes stay within the page: no sideways scroll.
    expect(await page.evaluate(() => document.scrollingElement!.scrollWidth)).toBeLessThanOrEqual(1360);
    expect(errors).toEqual([]);
  });

  test('footnotes: block content in a note keeps its own formatting', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    const notes = page.locator('#footnotes.qb-notes');
    // The notes list itself is numbered.
    expect(await css(notes.locator('.myst-footnotes-list > ol'), 'list-style-type')).toBe('decimal');
    // A parenthesised list inside a note keeps lists.css: no native marker,
    // and its drawn (a), (b).
    const list = notes.locator('#fn-c .myst-footnote-content ol.delimiter-parens');
    await expect(list.locator(':scope > li')).toHaveCount(2);
    expect(await css(list, 'list-style-type')).toBe('none');
    const drawn = await list
      .locator(':scope > li')
      .first()
      .evaluate((el) => getComputedStyle(el, '::before').content);
    expect(drawn).toBe('"(" counter(list-item, lower-alpha) ")"');
    // A note ending in code keeps its code card a block, with its border,
    // and the ↩ follows the card.
    const card = notes.locator('#fn-d .myst-footnote-content > .qb-codecard');
    await expect(card).toBeVisible();
    expect(await css(card, 'display')).toBe('block');
    expect(await css(card, 'border-top-style')).toBe('solid');
    expect(await css(card, 'border-top-width')).toBe('1px');
    expect(await css(card, 'border-top-color')).toBe(await token(page, '--qb-rule'));
    const cardBack = notes.locator('#fn-d .myst-footnote-backlinks a');
    await expect(cardBack).toBeVisible();
    const [cardBox, cardBackBox] = await Promise.all([card.boundingBox(), cardBack.boundingBox()]);
    expect(cardBackBox!.y).toBeGreaterThanOrEqual(cardBox!.y + cardBox!.height - 1);
    // A note of one paragraph still runs its ↩ on after the text.
    const text = notes.locator('#fn-a .myst-footnote-content > p');
    expect(await css(text, 'display')).toBe('inline');
    const [textBox, backBox] = await Promise.all([
      text.boundingBox(),
      notes.locator('#fn-a .myst-footnote-backlinks a').boundingBox(),
    ]);
    expect(Math.abs(backBox!.y - textBox!.y)).toBeLessThan(8);
    expect(backBox!.x).toBeGreaterThanOrEqual(textBox!.x + textBox!.width - 1);
    expect(errors).toEqual([]);
  });

  test('margin notes and asides sit in the gutter', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    const notes = page.locator('.qb-article .myst-aside');
    await expect(notes).toHaveCount(2);
    const column = await page.locator('.qb-article h2').first().boundingBox();
    for (const note of await notes.all()) {
      const box = await note.boundingBox();
      expect(box!.x).toBeGreaterThan(column!.x + 500);
      expect(await css(note, 'background-color')).toBe('rgba(0, 0, 0, 0)');
      // The design's clay ▸ before the note.
      const marker = await note.evaluate((el) => {
        const cs = getComputedStyle(el.firstElementChild ?? el, '::before');
        return { content: cs.content, color: cs.color };
      });
      expect(marker.content).toContain('▸');
      expect(marker.color).toBe(await token(page, '--qb-clay'));
    }
    // Below 1080px they fall into the column.
    await page.setViewportSize({ width: 900, height: 900 });
    const narrow = await notes.first().boundingBox();
    const narrowColumn = await page.locator('.qb-article h2').first().boundingBox();
    expect(Math.abs(narrow!.x - narrowColumn!.x)).toBeLessThan(40);
    // A filled note, as the design draws it: paper-2 and a 3px clay rule.
    expect(await css(notes.first(), 'background-color')).toBe(await token(page, '--qb-paper-2'));
    expect(await css(notes.first(), 'border-left-width')).toBe('3px');
    expect(await css(notes.first(), 'border-left-color')).toBe(await token(page, '--qb-clay'));
    expect(errors).toEqual([]);
  });

  test('the search dialog in the Manuscript style', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/ch-one/');
    await page.locator('.qb-masthead__search .myst-search-bar').click();
    const dialog = page.locator('.myst-search-dialog');
    await expect(dialog).toBeVisible();
    expect(await css(dialog, 'background-color')).toBe(await token(page, '--qb-paper'));
    const input = dialog.locator('.myst-search-input');
    await expect(input).toBeFocused();
    expect(await css(input, 'background-color')).toBe(await token(page, '--qb-paper-2'));
    await input.fill('contraction');
    const result = dialog.locator('.myst-search-result-item').first();
    await expect(result).toBeVisible();
    expect(await css(result.locator('a'), 'box-shadow')).toBe('none');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(errors).toEqual([]);
  });
});

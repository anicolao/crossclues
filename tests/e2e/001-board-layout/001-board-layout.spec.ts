import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('US-001: Players configure a physically accurate board', async ({ page }, testInfo) => {
  const steps = new TestStepHelper(page, testInfo);
  steps.setMetadata('Board layout', 'Players can set up either supported board size with physically accurate card spaces and mirrored word headers.');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await steps.step('four-card-layout', {
    description: 'The table opens with the standard four by four layout',
    verifications: [
      { spec: 'There are sixteen grid cards', check: async () => expect(page.locator('.clue-card')).toHaveCount(16) },
      { spec: 'Coordinates cover A1 through D4', check: async () => { await expect(page.locator('[data-cell="A1"]')).toBeVisible(); await expect(page.locator('[data-cell="D4"]')).toBeVisible(); } },
      { spec: 'Each card is 60 mm wide at 109 pixels per inch', check: async () => expect((await page.locator('[data-cell="A1"]').boundingBox())?.width).toBeCloseTo(257.48, 1) },
      { spec: 'Each card is 60 mm tall at 110 pixels per inch', check: async () => expect((await page.locator('[data-cell="A1"]').boundingBox())?.height).toBeCloseTo(259.84, 1) },
      { spec: 'The word rail is one-third of a grid card deep', check: async () => expect((await page.locator('.headers-top .header-card').first().boundingBox())?.height).toBeCloseTo(86.61, 1) },
      { spec: 'Border cards contain words without duplicate coordinate labels', check: async () => expect(page.locator('.header-card strong')).toHaveCount(0) },
      { spec: 'Four distinct column words and four distinct row words are dealt', check: async () => expect(await page.locator('.headers-top .header-card, .headers-left .header-card').evaluateAll(cards => new Set(cards.map(card => card.getAttribute('data-word'))).size)).toBe(8) }
    ]
  });

  await page.locator('.corner-nw [data-size="5"]').click();
  await steps.step('five-card-layout', {
    description: 'A player expands the table to five by five',
    verifications: [
      { spec: 'There are twenty-five grid cards', check: async () => expect(page.locator('.clue-card')).toHaveCount(25) },
      { spec: 'Coordinates now cover A1 through E5', check: async () => { await expect(page.locator('[data-cell="A1"]')).toBeVisible(); await expect(page.locator('[data-cell="E5"]')).toBeVisible(); } },
      { spec: 'The card dimensions remain physically unchanged', check: async () => { const box = await page.locator('[data-cell="E5"]').boundingBox(); expect(box?.width).toBeCloseTo(257.48, 1); expect(box?.height).toBeCloseTo(259.84, 1); } },
      { spec: 'The five by five choice is active at both table edges', check: async () => expect(page.locator('[data-size="5"][aria-pressed="true"]')).toHaveCount(2) },
      { spec: 'E and 5 each have a visible word', check: async () => { await expect(page.locator('.headers-top [data-coordinate="E"] .header-content span')).not.toBeEmpty(); await expect(page.locator('.headers-left [data-coordinate="5"] .header-content span')).not.toBeEmpty(); } }
    ]
  });

  steps.generateDocs();
});

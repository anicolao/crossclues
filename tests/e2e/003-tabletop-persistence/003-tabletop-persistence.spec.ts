import { test, expect } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('US-003: Setup survives interruption and works from opposing seats', async ({ page }, testInfo) => {
  const steps = new TestStepHelper(page, testInfo);
  steps.setMetadata('Tabletop persistence', 'The current setup survives a reload and controls remain reachable from opposing seats.');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('.corner-se [data-size="5"]').click();
  await page.locator('.corner-se [data-shuffle]').click();

  await steps.step('opposite-seat-setup', {
    description: 'A player configures the board from the opposite seat',
    verifications: [
      { spec: 'The board changes to five by five', check: async () => expect(page.locator('.tabletop')).toHaveAttribute('data-board-size', '5') },
      { spec: 'The deal advances', check: async () => expect(page.locator('.tabletop')).toHaveAttribute('data-deal', '2') },
      { spec: 'Every round control exceeds the 60 pixel tabletop touch minimum', check: async () => expect(await page.locator('.round-button').evaluateAll(buttons => buttons.every(button => button.getBoundingClientRect().width >= 60 && button.getBoundingClientRect().height >= 60))).toBe(true) },
      { spec: 'Bottom and right header content faces the opposite seat', check: async () => { await expect(page.locator('.headers-bottom .header-content').first()).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)'); await expect(page.locator('.headers-right .header-content').first()).not.toHaveCSS('transform', 'none'); } }
    ]
  });

  const wordsBeforeReload = await page.locator('.headers-top .header-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-word')));
  await page.reload();
  await steps.step('setup-restored', {
    description: 'The tabletop restores the setup after a reload',
    verifications: [
      { spec: 'The five by five size is restored', check: async () => expect(page.locator('.clue-card')).toHaveCount(25) },
      { spec: 'The same word deal is restored', check: async () => expect(await page.locator('.headers-top .header-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-word')))).toEqual(wordsBeforeReload) },
      { spec: 'Both edge selectors reflect the restored size', check: async () => expect(page.locator('[data-size="5"][aria-pressed="true"]')).toHaveCount(2) },
      { spec: 'No page scrolling is introduced', check: async () => expect(await page.evaluate(() => ({ width: document.documentElement.scrollWidth === innerWidth, height: document.documentElement.scrollHeight === innerHeight }))).toEqual({ width: true, height: true }) }
    ]
  });

  steps.generateDocs();
});

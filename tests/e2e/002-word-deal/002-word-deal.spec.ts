import { test, expect } from '@playwright/test';
import { BASE_WORDS } from '../../../src/words';
import { TestStepHelper } from '../helpers/test-step-helper';

test('US-002: Players deal a fresh set of border words', async ({ page }, testInfo) => {
  const steps = new TestStepHelper(page, testInfo);
  steps.setMetadata('Word deal', 'Either side of the table can deal new distinct words from the reference game list.');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const topWords = () => page.locator('.headers-top .header-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-word')));
  const leftWords = () => page.locator('.headers-left .header-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-word')));
  const original = [...await topWords(), ...await leftWords()];

  await steps.step('initial-word-deal', {
    description: 'The initial border words come from the reference list',
    verifications: [
      { spec: 'Every dealt word belongs to BASE_WORDS', check: async () => expect(original.every(word => word !== null && (BASE_WORDS as readonly string[]).includes(word))).toBe(true) },
      { spec: 'No word is repeated in the deal', check: async () => expect(new Set(original).size).toBe(original.length) },
      { spec: 'Top words are mirrored along the bottom edge', check: async () => expect(await page.locator('.headers-bottom .header-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-word')))).toEqual(await topWords()) },
      { spec: 'Left words are mirrored along the right edge', check: async () => expect(await page.locator('.headers-right .header-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-word')))).toEqual(await leftWords()) }
    ]
  });

  await page.locator('.corner-nw [data-shuffle]').click();
  const replacement = [...await topWords(), ...await leftWords()];
  await steps.step('new-word-deal', {
    description: 'A player deals new words from the upper edge',
    verifications: [
      { spec: 'The complete word deal changes', check: async () => expect(replacement).not.toEqual(original) },
      { spec: 'The board coordinates do not change', check: async () => { await expect(page.locator('[data-cell="A1"]')).toBeVisible(); await expect(page.locator('[data-cell="D4"]')).toBeVisible(); } },
      { spec: 'The deal counter advances exactly once', check: async () => expect(page.locator('.tabletop')).toHaveAttribute('data-deal', '2') },
      { spec: 'The new deal remains distinct', check: async () => expect(new Set(replacement).size).toBe(replacement.length) }
    ]
  });

  await page.locator('.corner-se [data-shuffle]').click();
  await steps.step('opposite-edge-deal', {
    description: 'A player can also deal from the opposite table edge',
    verifications: [
      { spec: 'The opposite control advances the deal', check: async () => expect(page.locator('.tabletop')).toHaveAttribute('data-deal', '3') },
      { spec: 'Both shuffle controls remain available', check: async () => expect(page.locator('[data-shuffle]')).toHaveCount(2) },
      { spec: 'Mirrored headers still contain matching words', check: async () => expect(await page.locator('.headers-bottom .header-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-word')))).toEqual(await topWords()) }
    ]
  });

  steps.generateDocs();
});

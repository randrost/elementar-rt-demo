import { expect, Locator, Page } from '@playwright/test';

/**
 * Counts a locator only once it has rendered.
 *
 * Reading `.count()` straight after `goto` returns 0 while Angular is still
 * bootstrapping, which quietly turns "one more than before" into "exactly one".
 * Four tests were wrong in exactly that way before this existed.
 */
export async function countWhenReady(locator: Locator, atLeast = 1): Promise<number> {
  await expect.poll(() => locator.count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(atLeast);
  return locator.count();
}

/**
 * Drags one element onto another with enough intermediate movement for the CDK
 * to pass its drag threshold and register the drop target. A single
 * `mouse.move` is not enough — the CDK needs to see the pointer travel.
 */
export async function dragTo(page: Page, source: Locator, target: Locator): Promise<void> {
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error('drag source or target is not visible');

  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const end = { x: to.x + to.width / 2, y: to.y + Math.min(to.height / 2, 60) };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  // Nudge past the threshold before the long move.
  await page.mouse.move(start.x + 8, start.y + 8, { steps: 4 });
  await page.mouse.move(end.x, end.y, { steps: 20 });
  await page.mouse.move(end.x, end.y + 2, { steps: 4 });
  await page.mouse.up();
}

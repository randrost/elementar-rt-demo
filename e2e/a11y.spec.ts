import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { A11Y_ROUTES } from './routes';

/**
 * Accessibility regression net.
 *
 * The app was audited to zero violations by hand; this keeps it there. axe
 * catches structural and contrast problems, not whether the reading order makes
 * sense, so treat a pass as a floor rather than a guarantee.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

function summarise(violations: Awaited<ReturnType<typeof scan>>['violations']): string {
  return violations
    .map((v) => `${v.id} (${v.impact}) x${v.nodes.length}\n    ${v.nodes[0]?.target.join(' ')}`)
    .join('\n  ');
}

test.describe('accessibility', () => {
  for (const route of A11Y_ROUTES) {
    test(`${route} has no violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const { violations } = await scan(page);
      expect(violations, `\n  ${summarise(violations)}\n`).toEqual([]);
    });
  }

  test('dark mode has no violations either', async ({ page }) => {
    // Contrast is the rule most likely to differ between schemes.
    await page.goto('/dashboard/basic');
    await page.evaluate(() => localStorage.setItem('elementar-rt-color-scheme', 'dark'));

    for (const route of ['/dashboard/basic', '/applications/contacts', '/themes']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const { violations } = await scan(page);
      expect(violations, `${route}\n  ${summarise(violations)}`).toEqual([]);
    }
  });
});

test.describe('keyboard', () => {
  test('focus is visible when tabbing', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile', 'no keyboard on the mobile project');

    await page.goto('/dashboard/getting-started');
    await page.waitForLoadState('networkidle');

    // Start from a known element inside the document. Tabbing from a fresh page
    // can leave focus on the browser chrome, which reads back as <body>.
    await page.locator('body').click({ position: { x: 5, y: 5 } });

    const ring = await expect
      .poll(
        async () => {
          await page.keyboard.press('Tab');
          return page.evaluate(() => {
            const active = document.activeElement;
            if (!active || active === document.body) return null;
            if (!active.matches(':focus-visible')) return null;
            const style = getComputedStyle(active);
            return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
          });
        },
        { timeout: 15_000 }
      )
      .not.toBeNull()
      .then(() =>
        page.evaluate(() => {
          const style = getComputedStyle(document.activeElement as Element);
          return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
        })
      );

    expect(ring.style).not.toBe('none');
    expect(ring.width).toBeGreaterThan(0);
  });

  test('the widget picker closes on Escape', async ({ page }) => {
    await page.goto('/dashboard/dynamic');
    await page.getByRole('button', { name: 'Add widget' }).click();
    await expect(page.getByRole('dialog', { name: 'Add a widget' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Add a widget' })).toHaveCount(0);
  });
});

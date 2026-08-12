import { expect, test } from '@playwright/test';
import { ALL_ROUTES, STANDALONE_ROUTES } from './routes';

/**
 * The router runs `withViewTransitions()`. When a navigation interrupts a
 * transition the browser rejects with InvalidStateError — benign, and outside
 * our control. Everything else is a genuine failure and stays fatal.
 */
const IGNORABLE = [/Transition was aborted because of invalid state/];

function isIgnorable(message: string): boolean {
  return IGNORABLE.some((pattern) => pattern.test(message));
}

/**
 * Every route must render its own page with no console errors.
 *
 * The app has no backend, so a route that fails does so loudly — a blank
 * outlet, a thrown error, or the wildcard redirect to /error/not-found. All
 * three are caught here.
 */
test.describe('every route renders', () => {
  for (const route of ALL_ROUTES) {
    test(`renders ${route}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isIgnorable(msg.text())) errors.push(msg.text());
      });
      page.on('pageerror', (error) => {
        if (!isIgnorable(error.message)) errors.push(error.message);
      });

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Not bounced to the wildcard route (unless that is where we asked to go).
      if (!route.startsWith('/error/')) {
        expect(page.url()).not.toContain('/error/not-found');
      }

      // Title is set per route, so a missing one means the route never resolved.
      await expect(page).toHaveTitle(/Elementar RT/);

      // Something was actually painted. getByRole skips elements outside the
      // accessibility tree, which matters on mobile: the auth layout's brand
      // panel is display:none there, and a plain `h1, h2` locator would pick
      // that hidden heading first.
      await expect(page.getByRole('heading').first()).toBeVisible();

      expect(errors, `console errors on ${route}`).toEqual([]);
    });
  }
});

test.describe('shell', () => {
  test('sidebar navigates between areas', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile', 'sidebar is a drawer on mobile');

    await page.goto('/dashboard/getting-started');
    await page.getByRole('link', { name: 'Kanban', exact: true }).click();
    await expect(page).toHaveURL(/\/applications\/kanban/);
    await expect(page.getByRole('heading', { name: 'Kanban', level: 1 })).toBeVisible();
  });

  test('colour scheme survives a reload', async ({ page }) => {
    await page.goto('/dashboard/basic');

    const initial = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    await page.getByRole('button', { name: /colour scheme|color scheme/i }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .toBe(!initial);

    await page.reload();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .toBe(!initial);
  });

  test('unknown paths land on the 404', async ({ page }) => {
    await page.goto('/definitely/not/a/route');
    await expect(page).toHaveURL(/\/error\/not-found/);
  });
});

test.describe('pages outside the shell', () => {
  for (const route of STANDALONE_ROUTES) {
    test(`${route} has no app sidebar`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('app-sidebar')).toHaveCount(0);
    });
  }
});

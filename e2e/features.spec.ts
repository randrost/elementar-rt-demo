import { expect, test } from '@playwright/test';
import { countWhenReady, dragTo } from './helpers';

/**
 * Behaviour that a rendering check would not catch: the interactions each
 * feature area exists for. These are the paths verified by hand during the
 * build, written down so they stay verified.
 */

test.describe('kanban', () => {
  test('a card moves between columns', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile', 'drag-and-drop needs a pointer');

    await page.goto('/applications/kanban');
    const columns = page.locator('app-page section');
    await countWhenReady(columns, 3);

    const cardsIn = (index: number) => columns.nth(index).locator('article');
    const sourceBefore = await countWhenReady(cardsIn(0));
    const targetBefore = await cardsIn(2).count();

    await dragTo(page, cardsIn(0).first(), columns.nth(2).locator('[cdkdroplist]'));

    await expect.poll(() => cardsIn(0).count()).toBe(sourceBefore - 1);
    await expect.poll(() => cardsIn(2).count()).toBe(targetBefore + 1);
  });

  test('a card can be added and removed', async ({ page }) => {
    await page.goto('/applications/kanban');
    const cards = page.locator('app-page article');
    const before = await countWhenReady(cards);

    await page.getByRole('button', { name: 'Add a card' }).first().click();
    await page.getByRole('textbox', { name: 'New card title' }).fill('Written by a test');
    await page.getByRole('button', { name: 'Add card' }).click();

    await expect(cards).toHaveCount(before + 1);
    await expect(page.getByText('Written by a test')).toBeVisible();

    await page.getByRole('button', { name: 'Delete Written by a test' }).click();
    await expect(cards).toHaveCount(before);
  });
});

test.describe('invoice', () => {
  test('edit loads the real record and totals recompute', async ({ page }) => {
    await page.goto('/applications/invoice/edit/invoice-1');

    // The form is built in field initializers, so a regression here shows up as
    // a blank draft rather than the record.
    await expect(page.locator('input[formcontrolname="number"]')).toHaveValue(/INV-/);
    await expect(page.locator('input[formcontrolname="name"]')).not.toHaveValue('');

    const total = page.locator('dl div').last();
    const before = await total.textContent();

    await page.locator('input[formcontrolname="qty"]').first().fill('10');
    await expect.poll(() => total.textContent()).not.toBe(before);
  });

  test('line items can be added and removed', async ({ page }) => {
    await page.goto('/applications/invoice/edit/invoice-1');
    const rows = page.locator('tbody tr');
    const before = await countWhenReady(rows);

    await page.getByRole('button', { name: 'Add item' }).click();
    await expect(rows).toHaveCount(before + 1);

    await page.getByRole('button', { name: `Remove item ${before + 1}` }).click();
    await expect(rows).toHaveCount(before);
  });
});

test.describe('email', () => {
  test('opening a message marks it read', async ({ page }) => {
    await page.goto('/applications/email/inbox');
    const messages = page.locator('ul li button');
    await countWhenReady(messages);

    // The unread dot marks which rows still count; clicking an already-read
    // message would leave the tally unchanged and prove nothing.
    const unread = page.locator('ul li button .bg-primary');
    const before = await unread.count();
    test.skip(before === 0, 'nothing unread to open');

    await messages.filter({ has: page.locator('.bg-primary') }).first().click();
    await expect(page.locator('article')).toBeVisible();
    await expect.poll(() => unread.count()).toBeLessThan(before);
  });

  test('a sent message lands in Sent', async ({ page }) => {
    await page.goto('/applications/email/sent');
    const messages = page.locator('ul li button');
    const before = await countWhenReady(messages);

    await page.getByRole('button', { name: 'Compose' }).click();
    await page.getByRole('textbox', { name: 'Recipient' }).fill('ada@analytical.co');
    await page.getByRole('textbox', { name: 'Subject' }).fill('Sent from a test');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(messages).toHaveCount(before + 1);
    await expect(page.getByText('Sent from a test')).toBeVisible();
  });
});

test.describe('contacts', () => {
  test('search narrows the list', async ({ page }) => {
    await page.goto('/applications/contacts');
    const counter = page.getByText(/\d+ of \d+ contacts/);
    await expect(counter).toContainText('25 of 25');

    await page.getByRole('searchbox', { name: 'Search contacts' }).fill('curie');
    await expect(counter).toContainText('1 of 25');
  });
});

test.describe('dynamic dashboard', () => {
  test('a widget can be added and the layout persists', async ({ page }) => {
    await page.goto('/dashboard/dynamic');
    const tiles = page.locator('ktd-grid-item');
    const before = await countWhenReady(tiles);

    await page.getByRole('button', { name: 'Add widget' }).click();
    await page.getByRole('button', { name: /Visitors by country/ }).click();
    await expect(tiles).toHaveCount(before + 1);

    await page.reload();
    await expect(tiles).toHaveCount(before + 1);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(tiles).toHaveCount(before);
  });

  test('tiles fit their container', async ({ page }) => {
    test.skip(test.info().project.name === 'mobile', 'grid is single-column on mobile');

    // The grid measures its column width once, before the sidebar settles;
    // a missing ResizeObserver shows up as tiles wider than the grid.
    await page.goto('/dashboard/dynamic');
    await page.waitForLoadState('networkidle');
    await countWhenReady(page.locator('ktd-grid-item'));

    await expect
      .poll(() =>
        page.evaluate(() => {
          const grid = document.querySelector('ktd-grid');
          if (!grid) return null;
          const width = grid.getBoundingClientRect().width;
          const right = Math.max(
            ...[...document.querySelectorAll('ktd-grid-item')].map((item) => {
              const style = getComputedStyle(item);
              return parseFloat(style.left) + parseFloat(style.width);
            })
          );
          return right <= width + 1;
        })
      )
      .toBe(true);
  });
});

test.describe('courses', () => {
  test('completing a lesson moves the progress bar', async ({ page }) => {
    await page.goto('/applications/courses/details/course-1');
    const progress = page.getByText(/Your progress/).locator('..');
    await expect(progress).toBeVisible();
    const before = await progress.textContent();

    await page.getByRole('button', { name: /^Mark complete:/ }).first().click();
    await expect.poll(() => progress.textContent()).not.toBe(before);
  });
});

test.describe('getting started', () => {
  test('the checklist persists across a reload', async ({ page }) => {
    await page.goto('/dashboard/getting-started');

    const reset = page.getByRole('button', { name: 'Reset checklist' });
    if (await reset.isVisible().catch(() => false)) await reset.click();

    await page.getByRole('button', { name: /^Mark complete:/ }).first().click();
    await expect(page.getByText(/1 of 5 steps complete/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/1 of 5 steps complete/)).toBeVisible();
  });
});

test.describe('calendar', () => {
  test('renders a full week of columns', async ({ page }) => {
    await page.goto('/applications/calendar');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.fc-col-header-cell')).toHaveCount(7);

    // FullCalendar sizes its columns once, before the sidebar settles.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const grid = document.querySelector('.fc-scrollgrid');
          const host = document.querySelector('.fc');
          if (!grid || !host) return null;
          return grid.getBoundingClientRect().width <= host.getBoundingClientRect().width + 1;
        })
      )
      .toBe(true);
  });
});

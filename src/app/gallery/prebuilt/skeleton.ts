import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';

@Component({
  selector: 'app-gallery-skeleton',
  imports: [PageComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Skeletons" description="Loading placeholders that hold the shape of the content that follows.">
      <ng-container actions>
        <button matButton="outlined" type="button" (click)="loading.set(!loading())">
          {{ loading() ? 'Show loaded' : 'Show loading' }}
        </button>
      </ng-container>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <!-- Card -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-5">
          <p class="mb-4 text-xs uppercase tracking-wide text-on-surface-variant">Card</p>
          @if (loading()) {
            <div class="animate-pulse">
              <div class="h-28 rounded-xl bg-surface-container-highest"></div>
              <div class="mt-4 h-4 w-2/3 rounded bg-surface-container-highest"></div>
              <div class="mt-2 h-3 w-full rounded bg-surface-container-highest"></div>
              <div class="mt-1.5 h-3 w-4/5 rounded bg-surface-container-highest"></div>
            </div>
          } @else {
            <div>
              <div class="h-28 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400"></div>
              <h2 class="mt-4 text-base font-semibold text-on-surface">Design system 2.0</h2>
              <p class="mt-1.5 text-sm text-on-surface-variant">
                Token overhaul, dark mode parity, and a documented component API.
              </p>
            </div>
          }
        </section>

        <!-- List -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-5">
          <p class="mb-4 text-xs uppercase tracking-wide text-on-surface-variant">List</p>
          <ul class="flex flex-col gap-4">
            @for (row of rows; track row) {
              <li class="flex items-center gap-3">
                @if (loading()) {
                  <div class="size-10 shrink-0 animate-pulse rounded-full bg-surface-container-highest"></div>
                  <div class="min-w-0 flex-1 animate-pulse">
                    <div class="h-3.5 w-1/2 rounded bg-surface-container-highest"></div>
                    <div class="mt-2 h-3 w-3/4 rounded bg-surface-container-highest"></div>
                  </div>
                } @else {
                  <span class="grid size-10 shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container">
                    <iconify-icon icon="solar:user-bold-duotone" width="20" height="20"></iconify-icon>
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-on-surface">Person {{ row }}</p>
                    <p class="truncate text-xs text-on-surface-variant">person{{ row }}&#64;example.com</p>
                  </div>
                }
              </li>
            }
          </ul>
        </section>

        <!-- Stat -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-5">
          <p class="mb-4 text-xs uppercase tracking-wide text-on-surface-variant">Stat</p>
          @if (loading()) {
            <div class="animate-pulse">
              <div class="h-3 w-24 rounded bg-surface-container-highest"></div>
              <div class="mt-3 h-8 w-32 rounded bg-surface-container-highest"></div>
              <div class="mt-4 h-10 w-full rounded bg-surface-container-highest"></div>
            </div>
          } @else {
            <div>
              <p class="text-xs text-on-surface-variant">Monthly revenue</p>
              <p class="mt-1 text-3xl font-semibold tabular-nums text-on-surface">$112,480</p>
              <p class="mt-3 text-xs text-green-700 dark:text-green-400">+12.5% vs last month</p>
            </div>
          }
        </section>

        <!-- Table -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-5 md:col-span-2">
          <p class="mb-4 text-xs uppercase tracking-wide text-on-surface-variant">Table</p>
          <table class="w-full text-sm">
            <tbody>
              @for (row of rows; track row) {
                <tr class="border-b border-outline-variant last:border-0">
                  @for (col of columns; track col) {
                    <td class="py-3 pr-4">
                      @if (loading()) {
                        <div class="h-3.5 animate-pulse rounded bg-surface-container-highest" [style.width.%]="col * 18 + 30"></div>
                      } @else {
                        <span class="text-on-surface-variant">Cell {{ row }}.{{ col }}</span>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </section>

        <!-- Paragraph -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-5">
          <p class="mb-4 text-xs uppercase tracking-wide text-on-surface-variant">Text</p>
          @if (loading()) {
            <div class="animate-pulse space-y-2">
              @for (line of [1, 2, 3, 4, 5]; track line) {
                <div class="h-3 rounded bg-surface-container-highest" [style.width.%]="line === 5 ? 55 : 100"></div>
              }
            </div>
          } @else {
            <p class="text-sm leading-relaxed text-on-surface-variant">
              Skeletons work when they match the shape of what arrives. A block that is the wrong
              height causes a jump on load, which is worse than showing nothing at all.
            </p>
          }
        </section>
      </div>
    </app-page>
  `
})
export class GallerySkeletonComponent {
  protected readonly loading = signal(true);
  protected readonly rows = [1, 2, 3];
  protected readonly columns = [1, 2, 3];
}

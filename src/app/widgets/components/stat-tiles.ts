import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { SparklineComponent } from '../../shared/charts/sparkline';
import { chartColor } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

/**
 * KPI row. Unlike the other widgets this renders its own grid of cards rather
 * than one card, so dashboards can drop it in as a full-width header band.
 */
@Component({
  selector: 'app-stat-tiles-widget',
  imports: [SparklineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (tile of tiles; track tile.id) {
        <section class="rounded-2xl border border-outline-variant bg-surface p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-xs text-on-surface-variant">{{ tile.label }}</p>
              <p class="mt-1 text-2xl font-semibold tabular-nums text-on-surface">{{ tile.value }}</p>
            </div>
            <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary-container">
              <iconify-icon [icon]="tile.icon" width="20" height="20"></iconify-icon>
            </span>
          </div>

          <div class="mt-4 flex items-end justify-between gap-4">
            <p class="flex items-center gap-1 text-xs" [class]="deltaClass(tile.delta)">
              <iconify-icon
                [icon]="tile.delta >= 0 ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'"
                width="14"
                height="14"></iconify-icon>
              <span class="font-medium">{{ tile.delta >= 0 ? '+' : '' }}{{ tile.delta }}%</span>
            </p>
            <div class="h-8 w-24 shrink-0">
              <app-sparkline [values]="tile.series" [color]="sparkColor(tile.delta)" [height]="32" />
            </div>
          </div>
        </section>
      }
    </div>
  `
})
export class StatTilesWidget {
  protected readonly tiles = inject(WidgetDataService).statTiles();

  protected deltaClass(delta: number): string {
    return delta >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';
  }

  protected sparkColor(delta: number): string {
    return delta >= 0 ? chartColor(1) : chartColor(6);
  }
}

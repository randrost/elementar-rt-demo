import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { SparklineComponent } from '../../shared/charts/sparkline';
import { chartColor } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-card-balance-widget',
  imports: [WidgetCardComponent, SparklineComponent, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-widget-card>
      <div class="flex h-full flex-col justify-between gap-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs text-on-surface-variant">{{ card.label }}</p>
            <p class="mt-1 text-3xl font-semibold tabular-nums text-on-surface">
              {{ card.balance | currency: 'USD' : 'symbol' : '1.2-2' }}
            </p>
          </div>
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary-container">
            <iconify-icon icon="solar:card-bold-duotone" width="22" height="22"></iconify-icon>
          </span>
        </div>

        <div>
          <div class="h-14 w-full">
            <app-sparkline [values]="card.series" [color]="lineColor" [height]="48" />
          </div>
          <p class="mt-3 flex items-center gap-1.5 text-xs" [class]="deltaClass">
            <iconify-icon
              [icon]="card.delta >= 0 ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'"
              width="14"
              height="14"></iconify-icon>
            <span class="font-medium">{{ card.delta >= 0 ? '+' : '' }}{{ card.delta }}%</span>
            <span class="text-on-surface-variant">vs last month</span>
          </p>
        </div>
      </div>
    </app-widget-card>
  `
})
export class CardBalanceWidget {
  protected readonly card = inject(WidgetDataService).cardBalance();
  protected readonly lineColor = chartColor(0);

  protected readonly deltaClass =
    this.card.delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
}

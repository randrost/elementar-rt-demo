import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { SparklineComponent } from '../../shared/charts/sparkline';
import { chartColor } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-crypto-ticker-widget',
  imports: [WidgetCardComponent, SparklineComponent, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-widget-card title="Market watch" subtitle="24-hour movement">
      <ul class="flex flex-col divide-y divide-outline-variant">
        @for (coin of coins; track coin.symbol) {
          <li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-surface-container-highest">
              <iconify-icon [icon]="coin.icon" width="20" height="20"></iconify-icon>
            </span>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-on-surface">{{ coin.symbol }}</p>
              <p class="truncate text-xs text-on-surface-variant">{{ coin.name }}</p>
            </div>

            <div class="h-8 w-20 shrink-0">
              <app-sparkline [values]="coin.series" [color]="sparkColor(coin.change24h)" [height]="32" />
            </div>

            <div class="flex w-24 shrink-0 flex-col items-end">
              <span class="text-sm font-semibold tabular-nums text-on-surface">
                {{ coin.price | currency: 'USD' : 'symbol' : '1.2-2' }}
              </span>
              <span class="text-xs font-medium tabular-nums" [class]="deltaClass(coin.change24h)">
                {{ coin.change24h >= 0 ? '+' : '' }}{{ coin.change24h }}%
              </span>
            </div>
          </li>
        }
      </ul>
    </app-widget-card>
  `
})
export class CryptoTickerWidget {
  protected readonly coins = inject(WidgetDataService).cryptoTickers();

  protected deltaClass(change: number): string {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  protected sparkColor(change: number): string {
    return change >= 0 ? chartColor(1) : chartColor(6);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-top-products-widget',
  imports: [WidgetCardComponent, CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-widget-card title="Top products" subtitle="By revenue this quarter">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-outline-variant text-left text-xs text-on-surface-variant">
            <th class="pb-2 font-medium">Product</th>
            <th class="pb-2 text-right font-medium">Sold</th>
            <th class="pb-2 text-right font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.product) {
            <tr class="border-b border-outline-variant last:border-0">
              <td class="py-2.5 pr-3 text-on-surface">{{ row.product }}</td>
              <td class="py-2.5 text-right tabular-nums text-on-surface-variant">
                {{ row.sold | number }}
              </td>
              <td class="py-2.5 text-right font-medium tabular-nums text-on-surface">
                {{ row.revenue | currency: 'USD' : 'symbol' : '1.0-0' }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-widget-card>
  `
})
export class TopProductsWidget {
  protected readonly rows = inject(WidgetDataService).topProducts();
}

import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-visitors-by-country-widget',
  imports: [WidgetCardComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-widget-card title="Visitors by country" subtitle="Sessions in the last 30 days">
      <ul class="flex flex-col gap-3.5">
        @for (row of rows; track row.code) {
          <li>
            <div class="flex items-center gap-3">
              <iconify-icon
                [icon]="'circle-flags:' + row.code"
                width="20"
                height="20"
                class="shrink-0 rounded-full"></iconify-icon>
              <span class="min-w-0 flex-1 truncate text-sm text-on-surface">{{ row.country }}</span>
              <span class="shrink-0 text-sm tabular-nums text-on-surface-variant">
                {{ row.visitors | number }}
              </span>
              <span class="w-12 shrink-0 text-right text-sm font-medium tabular-nums text-on-surface">
                {{ row.pct }}%
              </span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
              <div class="h-full rounded-full bg-primary" [style.width.%]="row.pct"></div>
            </div>
          </li>
        }
      </ul>
    </app-widget-card>
  `
})
export class VisitorsByCountryWidget {
  protected readonly rows = inject(WidgetDataService).visitorsByCountry();
}

import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { TransactionStatus, WidgetDataService } from '../widget-data';

const STATUS_CLASSES: Record<TransactionStatus, string> = {
  completed: 'bg-green-container text-on-green-container',
  pending: 'bg-orange-container text-on-orange-container',
  failed: 'bg-red-container text-on-red-container'
};

@Component({
  selector: 'app-transactions-list-widget',
  imports: [WidgetCardComponent, DatePipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-widget-card title="Recent transactions" subtitle="Across all connected accounts">
      <ul class="flex flex-col divide-y divide-outline-variant">
        @for (row of rows; track row.id) {
          <li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-xl"
              [class]="row.amount > 0 ? 'bg-green-container text-on-green-container' : 'bg-surface-container-highest text-on-surface-variant'">
              <iconify-icon
                [icon]="row.amount > 0 ? 'solar:arrow-down-linear' : 'solar:arrow-up-linear'"
                width="18"
                height="18"></iconify-icon>
            </span>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-on-surface">{{ row.name }}</p>
              <p class="truncate text-xs text-on-surface-variant">
                {{ row.type }} · {{ row.date | date: 'MMM d' }}
              </p>
            </div>

            <div class="flex shrink-0 flex-col items-end gap-1">
              <span class="text-sm font-semibold tabular-nums" [class]="row.amount > 0 ? 'text-green-700 dark:text-green-400' : 'text-on-surface'">
                {{ row.amount > 0 ? '+' : '−' }}{{ abs(row.amount) | currency: 'USD' : 'symbol' : '1.0-0' }}
              </span>
              <span class="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" [class]="statusClass(row.status)">
                {{ row.status }}
              </span>
            </div>
          </li>
        }
      </ul>
    </app-widget-card>
  `
})
export class TransactionsListWidget {
  protected readonly rows = inject(WidgetDataService).transactions();

  protected abs(value: number): number {
    return Math.abs(value);
  }

  protected statusClass(status: TransactionStatus): string {
    return STATUS_CLASSES[status];
  }
}

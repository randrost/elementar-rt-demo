import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { ChartHostDirective } from '../../shared/charts/chart-host.directive';
import { chartColor } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-income-expense-widget',
  imports: [WidgetCardComponent, ChartHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-widget-card title="Income vs expense" subtitle="Monthly totals">
      <div [appChartHost]="option" class="h-64 w-full"></div>
    </app-widget-card>
  `
})
export class IncomeExpenseWidget {
  private readonly points = inject(WidgetDataService).incomeExpense();

  protected readonly option: EChartsOption = {
    grid: { top: 28, right: 12, bottom: 24, left: 56 },
    legend: { show: true, top: 0, right: 0, icon: 'circle', itemHeight: 8, itemWidth: 8 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: this.points.map((p) => p.month) },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => `$${Math.round(v / 1000)}k` }
    },
    series: [
      {
        name: 'Income',
        type: 'bar',
        data: this.points.map((p) => p.income),
        itemStyle: { color: chartColor(1), borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 18
      },
      {
        name: 'Expense',
        type: 'bar',
        data: this.points.map((p) => p.expense),
        itemStyle: { color: chartColor(6), borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 18
      }
    ]
  };
}

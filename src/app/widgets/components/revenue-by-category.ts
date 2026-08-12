import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { ChartHostDirective } from '../../shared/charts/chart-host.directive';
import { chartColor } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-revenue-by-category-widget',
  imports: [WidgetCardComponent, ChartHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-widget-card title="Revenue by category" subtitle="Share of total this quarter">
      <div [appChartHost]="option" class="h-64 w-full"></div>
    </app-widget-card>
  `
})
export class RevenueByCategoryWidget {
  private readonly slices = inject(WidgetDataService).revenueByCategory();

  protected readonly option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      valueFormatter: (value) => `$${Number(value).toLocaleString('en-US')}`
    },
    legend: { orient: 'vertical', right: 0, top: 'center', icon: 'circle', itemHeight: 8, itemWidth: 8 },
    series: [
      {
        type: 'pie',
        radius: ['58%', '82%'],
        center: ['32%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 2, borderColor: 'transparent' },
        data: this.slices.map((slice, i) => ({
          name: slice.name,
          value: slice.value,
          itemStyle: { color: chartColor(i) }
        }))
      }
    ]
  };
}

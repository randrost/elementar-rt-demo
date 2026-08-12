import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { ChartHostDirective } from '../../shared/charts/chart-host.directive';
import { chartColor, withAlpha } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-productive-time-widget',
  imports: [WidgetCardComponent, ChartHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-widget-card title="Productive time" subtitle="Focused hours logged per day">
      <div [appChartHost]="option" class="h-full min-h-[16rem] w-full"></div>
    </app-widget-card>
  `
})
export class ProductiveTimeWidget {
  private readonly days = inject(WidgetDataService).productiveTime();
  private readonly peak = Math.max(...this.days.map((d) => d.hours));

  protected readonly option: EChartsOption = {
    grid: { top: 8, right: 24, bottom: 8, left: 44 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => `${v} h` },
    xAxis: { type: 'value', splitLine: { show: true }, axisLabel: { formatter: '{value}h' } },
    yAxis: { type: 'category', data: this.days.map((d) => d.day).reverse(), axisTick: { show: false } },
    series: [
      {
        type: 'bar',
        data: this.days
          .map((d) => ({
            value: d.hours,
            // The best day stands out; the rest recede so the peak reads at a glance.
            itemStyle: {
              color: d.hours === this.peak ? chartColor(0) : withAlpha(chartColor(0), 0.35),
              borderRadius: [0, 4, 4, 0]
            }
          }))
          .reverse(),
        barMaxWidth: 14
      }
    ]
  };
}

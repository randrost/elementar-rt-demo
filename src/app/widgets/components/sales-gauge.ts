import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { ChartHostDirective } from '../../shared/charts/chart-host.directive';
import { chartColor } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-sales-gauge-widget',
  imports: [WidgetCardComponent, ChartHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-widget-card title="Sales target" subtitle="Progress toward this quarter's goal">
      <div [appChartHost]="option" class="h-full min-h-[14rem] w-full"></div>
    </app-widget-card>
  `
})
export class SalesGaugeWidget {
  private readonly gauge = inject(WidgetDataService).salesGauge();

  protected readonly option: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: this.gauge.target,
        radius: '92%',
        center: ['50%', '62%'],
        progress: { show: true, width: 14, roundCap: true, itemStyle: { color: chartColor(0) } },
        axisLine: { lineStyle: { width: 14 } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, 0],
          fontSize: 30,
          fontWeight: 600,
          formatter: '{value}%',
          color: 'inherit'
        },
        data: [{ value: this.gauge.value }]
      }
    ]
  };
}

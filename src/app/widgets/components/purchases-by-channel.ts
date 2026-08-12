import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { format, parseISO } from 'date-fns';
import type { EChartsOption } from 'echarts';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { ChartHostDirective } from '../../shared/charts/chart-host.directive';
import { chartColor } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-purchases-by-channel-widget',
  imports: [WidgetCardComponent, ChartHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-widget-card title="Purchases by channel" subtitle="Direct, referral, and social · last 14 days">
      <div [appChartHost]="option" class="h-full min-h-[16rem] w-full"></div>
    </app-widget-card>
  `
})
export class PurchasesByChannelWidget {
  private readonly points = inject(WidgetDataService).purchasesByChannel();

  private line(name: string, values: number[], color: string) {
    return {
      name,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      data: values,
      lineStyle: { width: 2, color },
      itemStyle: { color }
    };
  }

  protected readonly option: EChartsOption = {
    grid: { top: 28, right: 12, bottom: 24, left: 44 },
    legend: { show: true, top: 0, right: 0, icon: 'circle', itemHeight: 8, itemWidth: 8 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: this.points.map((p) => format(parseISO(p.date), 'MMM d'))
    },
    yAxis: { type: 'value' },
    series: [
      this.line('Direct', this.points.map((p) => p.direct), chartColor(0)),
      this.line('Referral', this.points.map((p) => p.referral), chartColor(2)),
      this.line('Social', this.points.map((p) => p.social), chartColor(4))
    ]
  };
}

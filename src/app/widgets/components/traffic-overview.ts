import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { format, parseISO } from 'date-fns';
import type { EChartsOption } from 'echarts';
import { WidgetCardComponent } from '../../shared/charts/widget-card';
import { ChartHostDirective } from '../../shared/charts/chart-host.directive';
import { chartColor, withAlpha } from '../../shared/charts/chart-palette';
import { WidgetDataService } from '../widget-data';

@Component({
  selector: 'app-traffic-overview-widget',
  imports: [WidgetCardComponent, ChartHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-widget-card title="Traffic overview" subtitle="Visitors and pageviews · last 30 days">
      <div [appChartHost]="option" class="h-full min-h-[16rem] w-full"></div>
    </app-widget-card>
  `
})
export class TrafficOverviewWidget {
  private readonly points = inject(WidgetDataService).traffic();

  protected readonly option: EChartsOption = {
    grid: { top: 24, right: 12, bottom: 24, left: 48 },
    legend: { show: true, top: 0, right: 0, icon: 'circle', itemHeight: 8, itemWidth: 8 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: this.points.map((p) => format(parseISO(p.date), 'MMM d'))
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Visitors',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: this.points.map((p) => p.visitors),
        lineStyle: { width: 2, color: chartColor(0) },
        itemStyle: { color: chartColor(0) },
        areaStyle: { color: withAlpha(chartColor(0), 0.18) }
      },
      {
        name: 'Pageviews',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: this.points.map((p) => p.pageviews),
        lineStyle: { width: 2, color: chartColor(3) },
        itemStyle: { color: chartColor(3) },
        areaStyle: { color: withAlpha(chartColor(3), 0.14) }
      }
    ]
  };
}

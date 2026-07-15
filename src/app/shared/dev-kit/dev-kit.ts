import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { PageComponent } from '../../shell/page/page';
import { WidgetCardComponent } from '../charts/widget-card';
import { ChartHostDirective } from '../charts/chart-host.directive';
import { DataTableComponent } from '../datatable/datatable';
import { DataColumn } from '../datatable/datatable.types';
import { chartColor, withAlpha } from '../charts/chart-palette';
import { series } from '../mock/mock';

interface DemoRow {
  user: { name: string; secondary: string; avatarSeed: string };
  status: { label: string; tone: 'success' | 'warning' | 'error' | 'info' | 'neutral' };
  amount: number;
  date: string;
  progress: number;
  tags: string[];
}

@Component({
  selector: 'app-dev-kit',
  imports: [PageComponent, WidgetCardComponent, ChartHostDirective, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page title="Dev Kit" description="Internal verification of the shared datatable + chart kits.">
      <div class="grid gap-6">
        <app-widget-card title="Revenue" subtitle="Themed ECharts line — resize + scheme aware">
          <div [appChartHost]="chartOption" class="h-64 w-full"></div>
        </app-widget-card>
        <app-widget-card title="Transactions" subtitle="Datatable with user/status/currency/date/progress/tags/actions cells">
          <app-datatable [data]="rows" [columns]="columns" enableSelection enableSearch [pageSize]="5" />
        </app-widget-card>
      </div>
    </app-page>
  `
})
export class DevKitComponent {
  protected readonly rows: DemoRow[] = [
    { user: { name: 'Aria Bennett', secondary: 'aria@example.com', avatarSeed: 'Aria' }, status: { label: 'Paid', tone: 'success' }, amount: 1299.5, date: '2026-06-12', progress: 100, tags: ['pro', 'annual'] },
    { user: { name: 'Marco Diaz', secondary: 'marco@example.com', avatarSeed: 'Marco' }, status: { label: 'Pending', tone: 'warning' }, amount: 480, date: '2026-06-20', progress: 60, tags: ['trial'] },
    { user: { name: 'Lena Fischer', secondary: 'lena@example.com', avatarSeed: 'Lena' }, status: { label: 'Failed', tone: 'error' }, amount: 90, date: '2026-06-22', progress: 20, tags: ['basic'] },
    { user: { name: 'Owen Park', secondary: 'owen@example.com', avatarSeed: 'Owen' }, status: { label: 'Processing', tone: 'info' }, amount: 2100, date: '2026-06-25', progress: 45, tags: ['enterprise', 'net30'] },
    { user: { name: 'Sana Rahman', secondary: 'sana@example.com', avatarSeed: 'Sana' }, status: { label: 'Paid', tone: 'success' }, amount: 760.25, date: '2026-07-01', progress: 100, tags: ['pro'] },
    { user: { name: 'Tom Weber', secondary: 'tom@example.com', avatarSeed: 'Tom' }, status: { label: 'Refunded', tone: 'neutral' }, amount: 0, date: '2026-07-03', progress: 0, tags: [] }
  ];

  protected readonly columns: DataColumn<DemoRow>[] = [
    { id: 'user', header: 'Customer', type: 'user', accessor: (r) => r.user, sortable: false },
    { id: 'status', header: 'Status', type: 'status', accessor: (r) => r.status },
    { id: 'amount', header: 'Amount', type: 'currency', accessor: (r) => r.amount, align: 'right' },
    { id: 'date', header: 'Date', type: 'date', accessor: (r) => r.date },
    { id: 'progress', header: 'Progress', type: 'progress', accessor: (r) => r.progress },
    { id: 'tags', header: 'Tags', type: 'tags', accessor: (r) => r.tags, sortable: false },
    {
      id: 'actions', header: '', type: 'actions', accessor: () => null, sortable: false,
      actions: [
        { label: 'View', icon: 'solar:eye-linear', run: (r) => console.log('view', r.user.name) },
        { label: 'Delete', icon: 'solar:trash-bin-trash-linear', tone: 'danger', run: (r) => console.log('delete', r.user.name) }
      ]
    }
  ];

  protected readonly chartOption: EChartsOption = {
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], boundaryGap: false },
    yAxis: { type: 'value' },
    series: [{
      type: 'line', smooth: true, showSymbol: false, data: series(7, 42, 40, 95),
      lineStyle: { width: 3, color: chartColor(0) },
      areaStyle: { color: withAlpha(chartColor(0), 0.15) },
      itemStyle: { color: chartColor(0) }
    }]
  };
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageComponent } from '../shell/page/page';
import { DashboardGridComponent, DashboardTile } from './dashboard-grid';

@Component({
  selector: 'app-analytics-dashboard',
  imports: [PageComponent, DashboardGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page title="Analytics" description="Where your audience comes from and what they do.">
      <app-dashboard-grid [tiles]="tiles" />
    </app-page>
  `
})
export class AnalyticsDashboardComponent {
  protected readonly tiles: DashboardTile[] = [
    { id: 'traffic-overview', span: 'full' },
    { id: 'purchases-by-channel', span: 'half' },
    { id: 'visitors-by-country', span: 'half' },
    { id: 'productive-time', span: 'half' },
    { id: 'top-products', span: 'half' }
  ];
}

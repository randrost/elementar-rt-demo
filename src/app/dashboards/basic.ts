import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageComponent } from '../shell/page/page';
import { DashboardGridComponent, DashboardTile } from './dashboard-grid';

@Component({
  selector: 'app-basic-dashboard',
  imports: [PageComponent, DashboardGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page title="Dashboard" description="The headline numbers and what moved them.">
      <app-dashboard-grid [tiles]="tiles" />
    </app-page>
  `
})
export class BasicDashboardComponent {
  protected readonly tiles: DashboardTile[] = [
    { id: 'stat-tiles', span: 'full' },
    { id: 'traffic-overview', span: 'two-thirds' },
    { id: 'sales-gauge', span: 'third' },
    { id: 'transactions-list', span: 'half' },
    { id: 'productive-time', span: 'half' }
  ];
}

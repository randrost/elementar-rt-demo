import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageComponent } from '../shell/page/page';
import { DashboardGridComponent, DashboardTile } from './dashboard-grid';

@Component({
  selector: 'app-ecommerce-dashboard',
  imports: [PageComponent, DashboardGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page title="eCommerce" description="Orders, revenue mix, and what's selling.">
      <app-dashboard-grid [tiles]="tiles" />
    </app-page>
  `
})
export class EcommerceDashboardComponent {
  protected readonly tiles: DashboardTile[] = [
    { id: 'stat-tiles', span: 'full' },
    { id: 'revenue-by-category', span: 'half' },
    { id: 'top-products', span: 'half' },
    { id: 'transactions-list', span: 'two-thirds' },
    { id: 'sales-gauge', span: 'third' }
  ];
}

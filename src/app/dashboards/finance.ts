import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageComponent } from '../shell/page/page';
import { DashboardGridComponent, DashboardTile } from './dashboard-grid';

@Component({
  selector: 'app-finance-dashboard',
  imports: [PageComponent, DashboardGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page title="Finance" description="Balances, cash flow, and where the money went.">
      <app-dashboard-grid [tiles]="tiles" />
    </app-page>
  `
})
export class FinanceDashboardComponent {
  protected readonly tiles: DashboardTile[] = [
    { id: 'card-balance', span: 'third' },
    { id: 'income-expense', span: 'two-thirds' },
    { id: 'revenue-by-category', span: 'half' },
    { id: 'transactions-list', span: 'half' },
    { id: 'crypto-ticker', span: 'full' }
  ];
}

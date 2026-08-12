import { Type } from '@angular/core';
import { TrafficOverviewWidget } from './components/traffic-overview';
import { SalesGaugeWidget } from './components/sales-gauge';
import { IncomeExpenseWidget } from './components/income-expense';
import { PurchasesByChannelWidget } from './components/purchases-by-channel';
import { RevenueByCategoryWidget } from './components/revenue-by-category';
import { TransactionsListWidget } from './components/transactions-list';
import { ProductiveTimeWidget } from './components/productive-time';
import { CardBalanceWidget } from './components/card-balance';
import { StatTilesWidget } from './components/stat-tiles';
import { CryptoTickerWidget } from './components/crypto-ticker';
import { TopProductsWidget } from './components/top-products';
import { VisitorsByCountryWidget } from './components/visitors-by-country';

export type WidgetGroup = 'general' | 'crypto' | 'finance' | 'analytics';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  component: Type<unknown>;
  /** Span on a 12-column grid, used by the dynamic dashboard and the galleries. */
  defaultCols: number;
  defaultRows: number;
  /** Galleries this widget appears in. Dashboards pick by id instead. */
  groups: readonly WidgetGroup[];
}

/**
 * Single source of truth for the widget catalog: the galleries, the dashboards,
 * and the dynamic dashboard's picker all render from these entries.
 */
export const WIDGET_REGISTRY: readonly WidgetDefinition[] = [
  {
    id: 'stat-tiles',
    name: 'KPI tiles',
    description: 'A row of headline numbers with deltas and micro-charts.',
    component: StatTilesWidget,
    defaultCols: 12,
    defaultRows: 3,
    groups: ['general']
  },
  {
    id: 'traffic-overview',
    name: 'Traffic overview',
    description: 'Visitors and pageviews as a smoothed multi-series area chart.',
    component: TrafficOverviewWidget,
    defaultCols: 8,
    defaultRows: 5,
    groups: ['general', 'analytics']
  },
  {
    id: 'sales-gauge',
    name: 'Sales gauge',
    description: 'Progress toward a target as a rounded gauge.',
    component: SalesGaugeWidget,
    defaultCols: 4,
    defaultRows: 5,
    groups: []
  },
  {
    id: 'income-expense',
    name: 'Income vs expense',
    description: 'Grouped monthly bars comparing money in against money out.',
    component: IncomeExpenseWidget,
    defaultCols: 6,
    defaultRows: 5,
    groups: ['finance']
  },
  {
    id: 'purchases-by-channel',
    name: 'Purchases by channel',
    description: 'Direct, referral, and social conversions over time.',
    component: PurchasesByChannelWidget,
    defaultCols: 6,
    defaultRows: 5,
    groups: ['analytics']
  },
  {
    id: 'revenue-by-category',
    name: 'Revenue by category',
    description: 'Donut breakdown of revenue share with a legend.',
    component: RevenueByCategoryWidget,
    defaultCols: 6,
    defaultRows: 5,
    groups: ['finance']
  },
  {
    id: 'transactions-list',
    name: 'Recent transactions',
    description: 'Latest movements with direction, amount, and status.',
    component: TransactionsListWidget,
    defaultCols: 6,
    defaultRows: 6,
    groups: ['general']
  },
  {
    id: 'productive-time',
    name: 'Productive time',
    description: 'Focused hours per weekday, with the peak day highlighted.',
    component: ProductiveTimeWidget,
    defaultCols: 6,
    defaultRows: 5,
    groups: ['general']
  },
  {
    id: 'card-balance',
    name: 'Card balance',
    description: 'Account balance with a trend sparkline and period delta.',
    component: CardBalanceWidget,
    defaultCols: 4,
    defaultRows: 4,
    groups: ['crypto', 'finance']
  },
  {
    id: 'crypto-ticker',
    name: 'Market watch',
    description: 'Crypto prices with 24-hour change and sparklines.',
    component: CryptoTickerWidget,
    defaultCols: 6,
    defaultRows: 5,
    groups: ['crypto']
  },
  {
    id: 'top-products',
    name: 'Top products',
    description: 'Best sellers ranked by revenue.',
    component: TopProductsWidget,
    defaultCols: 6,
    defaultRows: 5,
    groups: ['general']
  },
  {
    id: 'visitors-by-country',
    name: 'Visitors by country',
    description: 'Geographic split with flags and share bars.',
    component: VisitorsByCountryWidget,
    defaultCols: 6,
    defaultRows: 5,
    groups: ['analytics']
  }
];

export function widgetsInGroup(group: WidgetGroup): WidgetDefinition[] {
  return WIDGET_REGISTRY.filter((w) => w.groups.includes(group));
}

export function widgetById(id: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find((w) => w.id === id);
}

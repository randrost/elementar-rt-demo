import { Injectable } from '@angular/core';
import { daysAgo, pick, range, seededRandom, series } from '../shared/mock/mock';

/* ---------------------------------------------------------------- models -- */

export interface TrafficPoint {
  date: string;
  visitors: number;
  pageviews: number;
}

export interface GaugeValue {
  value: number;
  target: number;
}

export interface IncomeExpensePoint {
  month: string;
  income: number;
  expense: number;
}

export interface ChannelPoint {
  date: string;
  direct: number;
  referral: number;
  social: number;
}

export interface CategorySlice {
  name: string;
  value: number;
}

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface TransactionRow {
  id: string;
  name: string;
  type: string;
  amount: number;
  date: string;
  status: TransactionStatus;
}

export interface ProductiveDay {
  day: string;
  hours: number;
}

export interface CardBalance {
  label: string;
  balance: number;
  delta: number;
  series: number[];
}

export interface StatTile {
  id: string;
  label: string;
  value: string;
  delta: number;
  icon: string;
  series: number[];
}

export interface CryptoTicker {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  series: number[];
}

export interface TopProduct {
  product: string;
  sold: number;
  revenue: number;
}

export interface CountryVisitors {
  country: string;
  code: string;
  visitors: number;
  pct: number;
}

/* ------------------------------------------------------------- constants -- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MERCHANTS = [
  ['Figma', 'Subscription'],
  ['Vercel', 'Hosting'],
  ['Linear', 'Subscription'],
  ['Stripe payout', 'Transfer'],
  ['AWS', 'Infrastructure'],
  ['Notion', 'Subscription'],
  ['Adobe', 'Subscription'],
  ['Client retainer', 'Income']
] as const;

const STATUSES: readonly TransactionStatus[] = ['completed', 'completed', 'completed', 'pending', 'failed'];

/**
 * Deterministic mock data for every catalog widget. Seeded so a reload — or a
 * second instance of the same widget — renders the identical series.
 */
@Injectable({ providedIn: 'root' })
export class WidgetDataService {
  traffic(days = 30): TrafficPoint[] {
    const visitors = series(days, 11, 1200, 4200);
    const pageviews = series(days, 29, 2600, 8800);
    return range(days).map((i) => ({
      date: daysAgo(days - 1 - i),
      visitors: visitors[i],
      pageviews: pageviews[i]
    }));
  }

  salesGauge(): GaugeValue {
    return { value: 68, target: 100 };
  }

  incomeExpense(months = 8): IncomeExpensePoint[] {
    const income = series(months, 5, 32_000, 88_000);
    const expense = series(months, 17, 18_000, 54_000);
    return range(months).map((i) => ({
      month: MONTHS[i % MONTHS.length],
      income: income[i],
      expense: expense[i]
    }));
  }

  purchasesByChannel(days = 14): ChannelPoint[] {
    const direct = series(days, 7, 60, 220);
    const referral = series(days, 23, 30, 160);
    const social = series(days, 41, 20, 130);
    return range(days).map((i) => ({
      date: daysAgo(days - 1 - i),
      direct: direct[i],
      referral: referral[i],
      social: social[i]
    }));
  }

  revenueByCategory(): CategorySlice[] {
    return [
      { name: 'Subscriptions', value: 48_200 },
      { name: 'Services', value: 27_400 },
      { name: 'Licenses', value: 18_900 },
      { name: 'Support', value: 11_300 },
      { name: 'Training', value: 6_800 }
    ];
  }

  transactions(count = 6): TransactionRow[] {
    const rnd = seededRandom(91);
    return range(count).map((i) => {
      const [name, type] = MERCHANTS[i % MERCHANTS.length];
      const income = type === 'Income' || type === 'Transfer';
      return {
        id: `txn-${i}`,
        name,
        type,
        amount: income ? Math.round(rnd() * 6000 + 1800) : -Math.round(rnd() * 900 + 40),
        date: daysAgo(i),
        status: pick(STATUSES, rnd)
      };
    });
  }

  productiveTime(): ProductiveDay[] {
    const hours = series(7, 63, 2, 9);
    return WEEKDAYS.map((day, i) => ({ day, hours: hours[i] }));
  }

  cardBalance(): CardBalance {
    return { label: 'Available balance', balance: 84_920.5, delta: 8.4, series: series(24, 3, 60, 100) };
  }

  statTiles(): StatTile[] {
    return [
      { id: 'revenue', label: 'Revenue', value: '$112,480', delta: 12.5, icon: 'solar:dollar-minimalistic-bold-duotone', series: series(16, 13, 40, 100) },
      { id: 'orders', label: 'Orders', value: '3,942', delta: 6.1, icon: 'solar:cart-large-2-bold-duotone', series: series(16, 27, 30, 90) },
      { id: 'customers', label: 'Customers', value: '1,286', delta: -2.4, icon: 'solar:users-group-rounded-bold-duotone', series: series(16, 47, 35, 95) },
      { id: 'refunds', label: 'Refunds', value: '$2,140', delta: -18.2, icon: 'solar:undo-left-round-bold-duotone', series: series(16, 71, 20, 70) }
    ];
  }

  cryptoTickers(): CryptoTicker[] {
    return [
      { symbol: 'BTC', name: 'Bitcoin', icon: 'logos:bitcoin', price: 68_412.33, change24h: 2.8, series: series(20, 9, 60, 100) },
      { symbol: 'ETH', name: 'Ethereum', icon: 'logos:ethereum', price: 3_284.71, change24h: -1.4, series: series(20, 19, 50, 95) },
      { symbol: 'XMR', name: 'Monero', icon: 'logos:monero', price: 172.09, change24h: 5.6, series: series(20, 33, 40, 100) },
      { symbol: 'ADA', name: 'Cardano', icon: 'logos:cardano-icon', price: 0.62, change24h: -0.9, series: series(20, 57, 45, 85) }
    ];
  }

  topProducts(): TopProduct[] {
    return [
      { product: 'Pro annual plan', sold: 428, revenue: 89_760 },
      { product: 'Team seats add-on', sold: 312, revenue: 43_680 },
      { product: 'Onboarding package', sold: 96, revenue: 28_800 },
      { product: 'Priority support', sold: 184, revenue: 18_400 },
      { product: 'Template bundle', sold: 641, revenue: 12_820 }
    ];
  }

  visitorsByCountry(): CountryVisitors[] {
    const rows = [
      { country: 'United States', code: 'us', visitors: 18_420 },
      { country: 'Germany', code: 'de', visitors: 9_310 },
      { country: 'United Kingdom', code: 'gb', visitors: 7_640 },
      { country: 'Ukraine', code: 'ua', visitors: 5_180 },
      { country: 'Japan', code: 'jp', visitors: 4_020 },
      { country: 'Brazil', code: 'br', visitors: 3_150 }
    ];
    const total = rows.reduce((sum, r) => sum + r.visitors, 0);
    return rows.map((r) => ({ ...r, pct: Math.round((r.visitors / total) * 1000) / 10 }));
  }
}

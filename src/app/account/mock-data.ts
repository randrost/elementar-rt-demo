import { Injectable, signal } from '@angular/core';
import { daysAgo, hoursAgo } from '../shared/mock/mock';

/* ---------------------------------------------------------------- feed ---- */

export type NotificationKind = 'mention' | 'assignment' | 'comment' | 'system' | 'billing';

export interface AccountNotification {
  id: string;
  kind: NotificationKind;
  actorName: string;
  actorSeed: string;
  text: string;
  target: string;
  at: string;
  read: boolean;
}

export const NOTIFICATION_META: Record<NotificationKind, { icon: string; classes: string }> = {
  mention: { icon: 'solar:mention-circle-bold-duotone', classes: 'bg-blue-container text-on-blue-container' },
  assignment: { icon: 'solar:checklist-minimalistic-bold-duotone', classes: 'bg-green-container text-on-green-container' },
  comment: { icon: 'solar:chat-round-dots-bold-duotone', classes: 'bg-surface-container-highest text-on-surface-variant' },
  system: { icon: 'solar:shield-warning-bold-duotone', classes: 'bg-orange-container text-on-orange-container' },
  billing: { icon: 'solar:bill-list-bold-duotone', classes: 'bg-red-container text-on-red-container' }
};

/* ------------------------------------------------------------- sessions --- */

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

/* -------------------------------------------------------------- billing --- */

export interface PlanInvoice {
  id: string;
  reference: string;
  amount: number;
  status: 'paid' | 'due' | 'refunded';
  date: string;
}

export interface PaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  holder: string;
  primary: boolean;
}

/* ---------------------------------------------------- notification prefs -- */

export interface PrefRow {
  key: string;
  label: string;
  hint: string;
}

export const PREF_ROWS: readonly PrefRow[] = [
  { key: 'mentions', label: 'Mentions', hint: 'Someone names you in a comment or note.' },
  { key: 'assignments', label: 'Assignments', hint: 'A task or ticket is assigned to you.' },
  { key: 'comments', label: 'Comments', hint: 'Replies on things you follow.' },
  { key: 'invoices', label: 'Invoices', hint: 'New invoices and payment results.' },
  { key: 'security', label: 'Security', hint: 'Sign-ins, password, and 2FA changes.' },
  { key: 'product', label: 'Product updates', hint: 'What shipped this month.' }
];

export const PREF_CHANNELS = ['inApp', 'email', 'push'] as const;
export type PrefChannel = (typeof PREF_CHANNELS)[number];

export const CHANNEL_LABELS: Record<PrefChannel, string> = {
  inApp: 'In app',
  email: 'Email',
  push: 'Push'
};

/* --------------------------------------------------------------- cookies -- */

export interface CookieCategory {
  key: string;
  title: string;
  description: string;
  required: boolean;
}

export const COOKIE_CATEGORIES: readonly CookieCategory[] = [
  { key: 'essential', title: 'Strictly necessary', description: 'Sign-in, security, and load balancing. The product does not work without these.', required: true },
  { key: 'functional', title: 'Functional', description: 'Remembers your theme, density, sidebar state, and saved views.', required: false },
  { key: 'analytics', title: 'Analytics', description: 'Aggregate usage so we can see which features earn their place.', required: false },
  { key: 'marketing', title: 'Marketing', description: 'Attribution for campaigns. Off by default.', required: false }
];

/* --------------------------------------------------------------- service -- */

const NOTIFICATIONS: readonly Omit<AccountNotification, 'id' | 'at'>[] = [
  { kind: 'mention', actorName: 'Ada Lovelace', actorSeed: 'ada-lovelace', text: 'mentioned you in', target: 'Widget registry approach', read: false },
  { kind: 'assignment', actorName: 'Margaret Hamilton', actorSeed: 'margaret-hamilton', text: 'assigned you', target: 'Dynamic dashboard grid', read: false },
  { kind: 'billing', actorName: 'Billing', actorSeed: 'billing-bot', text: 'issued', target: 'INV-2451', read: false },
  { kind: 'comment', actorName: 'Hedy Lamarr', actorSeed: 'hedy-lamarr', text: 'commented on', target: 'Design review notes', read: true },
  { kind: 'system', actorName: 'Security', actorSeed: 'status-bot', text: 'blocked a sign-in from', target: 'an unrecognised device', read: true },
  { kind: 'mention', actorName: 'Grace Hopper', actorSeed: 'grace-hopper', text: 'mentioned you in', target: 'Perf budget check-in', read: true },
  { kind: 'assignment', actorName: 'Barbara Liskov', actorSeed: 'barbara-liskov', text: 'moved', target: 'Contacts detail pane to In review', read: true },
  { kind: 'comment', actorName: 'Anita Borg', actorSeed: 'anita-borg', text: 'replied to you on', target: 'Onboarding test results', read: true },
  { kind: 'system', actorName: 'Status', actorSeed: 'status-bot', text: 'scheduled maintenance for', target: 'Sunday 02:00 UTC', read: true },
  { kind: 'billing', actorName: 'Billing', actorSeed: 'billing-bot', text: 'received payment for', target: 'INV-2450', read: true }
];

const SESSIONS: readonly Omit<DeviceSession, 'id' | 'lastActive'>[] = [
  { device: 'MacBook Pro', browser: 'Chrome 141', location: 'London, UK', ip: '82.14.xxx.xxx', current: true },
  { device: 'iPhone 15', browser: 'Safari 18', location: 'London, UK', ip: '82.14.xxx.xxx', current: false },
  { device: 'Windows desktop', browser: 'Edge 141', location: 'Manchester, UK', ip: '31.24.xxx.xxx', current: false },
  { device: 'iPad Air', browser: 'Safari 18', location: 'Lisbon, PT', ip: '188.6.xxx.xxx', current: false }
];

const INVOICES: readonly Omit<PlanInvoice, 'id' | 'date'>[] = [
  { reference: 'RCP-1042', amount: 348, status: 'paid' },
  { reference: 'RCP-1041', amount: 348, status: 'paid' },
  { reference: 'RCP-1040', amount: 290, status: 'paid' },
  { reference: 'RCP-1039', amount: 290, status: 'refunded' },
  { reference: 'RCP-1038', amount: 290, status: 'paid' },
  { reference: 'RCP-1037', amount: 290, status: 'paid' }
];

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly feed = signal<AccountNotification[]>(
    NOTIFICATIONS.map((item, i) => ({ ...item, id: `note-${i + 1}`, at: hoursAgo(i * 5 + 1) }))
  );

  private readonly sessionList = signal<DeviceSession[]>(
    SESSIONS.map((item, i) => ({ ...item, id: `session-${i + 1}`, lastActive: hoursAgo(i * 9) }))
  );

  private readonly cards = signal<PaymentMethod[]>([
    { id: 'card-1', brand: 'visa', last4: '4242', expiry: '09/28', holder: 'R. Tulika', primary: true },
    { id: 'card-2', brand: 'mastercard', last4: '8123', expiry: '02/27', holder: 'R. Tulika', primary: false }
  ]);

  private readonly prefs = signal<Record<string, boolean>>({
    'mentions.inApp': true, 'mentions.email': true, 'mentions.push': false,
    'assignments.inApp': true, 'assignments.email': true, 'assignments.push': true,
    'comments.inApp': true, 'comments.email': false, 'comments.push': false,
    'invoices.inApp': true, 'invoices.email': true, 'invoices.push': false,
    'security.inApp': true, 'security.email': true, 'security.push': true,
    'product.inApp': false, 'product.email': true, 'product.push': false
  });

  private readonly cookies = signal<Record<string, boolean>>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false
  });

  readonly notifications = this.feed.asReadonly();
  readonly sessions = this.sessionList.asReadonly();
  readonly paymentMethods = this.cards.asReadonly();
  readonly preferences = this.prefs.asReadonly();
  readonly cookieConsent = this.cookies.asReadonly();

  readonly invoices: PlanInvoice[] = INVOICES.map((item, i) => ({
    ...item,
    id: `receipt-${i + 1}`,
    date: daysAgo(i * 30 + 3)
  }));

  markAllRead(): void {
    this.feed.update((list) => list.map((item) => ({ ...item, read: true })));
  }

  toggleRead(id: string): void {
    this.feed.update((list) =>
      list.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    );
  }

  revokeSession(id: string): void {
    this.sessionList.update((list) => list.filter((session) => session.id !== id));
  }

  setPreference(key: string, value: boolean): void {
    this.prefs.update((current) => ({ ...current, [key]: value }));
  }

  setCookie(key: string, value: boolean): void {
    this.cookies.update((current) => ({ ...current, [key]: value }));
  }

  addCard(card: Omit<PaymentMethod, 'id' | 'primary'>): void {
    this.cards.update((list) => [...list, { ...card, id: `card-${list.length + 1}`, primary: false }]);
  }

  makePrimary(id: string): void {
    this.cards.update((list) => list.map((card) => ({ ...card, primary: card.id === id })));
  }

  removeCard(id: string): void {
    this.cards.update((list) => list.filter((card) => card.id !== id));
  }
}

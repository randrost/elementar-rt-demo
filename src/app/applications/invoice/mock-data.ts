import { Injectable, signal } from '@angular/core';
import { daysAgo, randomId, seededRandom } from '../../shared/mock/mock';
import { StatusTone } from '../../shared/datatable/datatable.types';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceParty {
  name: string;
  email: string;
  avatarSeed: string;
  address: string[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: InvoiceParty;
  currency: string;
  status: InvoiceStatus;
  issued: string;
  due: string;
  taxRate: number;
  notes: string;
  items: InvoiceItem[];
}

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'info' },
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'error' },
  void: { label: 'Void', tone: 'neutral' }
};

export const ISSUER: InvoiceParty = {
  name: 'Elementar RT',
  email: 'billing@elementar-rt.dev',
  avatarSeed: 'elementar-rt',
  address: ['12 Token Street', 'London EC2A 4NE', 'United Kingdom']
};

const CLIENTS: readonly Omit<InvoiceParty, 'avatarSeed'>[] = [
  { name: 'Northwind Trading', email: 'ap@northwind.example', address: ['400 Harbour Way', 'Seattle, WA 98101', 'United States'] },
  { name: 'Analytical Engine Co.', email: 'accounts@analytical.example', address: ['3 Clerkenwell Green', 'London EC1R 0DP', 'United Kingdom'] },
  { name: 'Helix Biosciences', email: 'finance@helix.example', address: ['77 Innovation Park', 'Cambridge CB4 0WS', 'United Kingdom'] },
  { name: 'Orbital Dynamics', email: 'billing@orbital.example', address: ['1 Launch Loop', 'Hampton, VA 23666', 'United States'] },
  { name: 'Spectrum Radio', email: 'ap@spectrum.example', address: ['Ringstrasse 14', '1010 Vienna', 'Austria'] },
  { name: 'Compiler Works', email: 'invoices@compiler.example', address: ['990 Parser Lane', 'Arlington, VA 22201', 'United States'] },
  { name: 'Bletchley Labs', email: 'finance@bletchley.example', address: ['Park Road', 'Milton Keynes MK3 6EB', 'United Kingdom'] },
  { name: 'Radium Institute', email: 'compta@radium.example', address: ["1 Rue Pierre et Marie Curie", '75005 Paris', 'France'] }
];

const LINE_ITEMS: readonly { description: string; unitPrice: number }[] = [
  { description: 'Design system audit', unitPrice: 2400 },
  { description: 'Dashboard implementation', unitPrice: 4800 },
  { description: 'Component library licence (annual)', unitPrice: 1200 },
  { description: 'Onboarding workshop', unitPrice: 1800 },
  { description: 'Priority support retainer', unitPrice: 900 },
  { description: 'Accessibility review', unitPrice: 1500 },
  { description: 'Data migration', unitPrice: 3200 },
  { description: 'Custom widget development', unitPrice: 2750 }
];

const STATUSES: readonly InvoiceStatus[] = ['paid', 'paid', 'sent', 'overdue', 'draft', 'paid', 'sent', 'void'];

/** Line total for one row. */
export function lineTotal(item: Pick<InvoiceItem, 'qty' | 'unitPrice'>): number {
  return item.qty * item.unitPrice;
}

export function subtotal(items: readonly Pick<InvoiceItem, 'qty' | 'unitPrice'>[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function taxAmount(
  items: readonly Pick<InvoiceItem, 'qty' | 'unitPrice'>[],
  taxRate: number
): number {
  return Math.round(subtotal(items) * (taxRate / 100) * 100) / 100;
}

export function grandTotal(
  items: readonly Pick<InvoiceItem, 'qty' | 'unitPrice'>[],
  taxRate: number
): number {
  return subtotal(items) + taxAmount(items, taxRate);
}

function build(index: number): Invoice {
  const rnd = seededRandom(index * 17 + 3);
  const client = CLIENTS[index % CLIENTS.length];
  const itemCount = 1 + Math.floor(rnd() * 3);

  const items: InvoiceItem[] = Array.from({ length: itemCount }, (_, i) => {
    const source = LINE_ITEMS[(index + i * 3) % LINE_ITEMS.length];
    return {
      id: `item-${index}-${i}`,
      description: source.description,
      qty: 1 + Math.floor(rnd() * 4),
      unitPrice: source.unitPrice
    };
  });

  const issuedDaysAgo = index * 5 + 3;
  return {
    id: `invoice-${index + 1}`,
    number: `INV-${2451 - index}`,
    client: { ...client, avatarSeed: client.name.toLowerCase().replace(/[^a-z]+/g, '-') },
    currency: 'USD',
    status: STATUSES[index % STATUSES.length],
    issued: daysAgo(issuedDaysAgo),
    due: daysAgo(issuedDaysAgo - 30),
    taxRate: 20,
    notes: 'Payment due within 30 days. Late payments accrue 2% monthly interest.',
    items
  };
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly items = signal<Invoice[]>(Array.from({ length: 20 }, (_, i) => build(i)));

  readonly invoices = this.items.asReadonly();

  byId(id: string): Invoice | undefined {
    return this.items().find((invoice) => invoice.id === id);
  }

  /** A blank invoice for the "new" form — not added to the list until saved. */
  draft(): Invoice {
    const next = 2452;
    return {
      id: randomId('invoice-'),
      number: `INV-${next}`,
      client: { name: '', email: '', avatarSeed: 'new-client', address: [] },
      currency: 'USD',
      status: 'draft',
      issued: new Date().toISOString(),
      due: daysAgo(-30),
      taxRate: 20,
      notes: 'Payment due within 30 days.',
      items: [{ id: randomId('item-'), description: '', qty: 1, unitPrice: 0 }]
    };
  }

  save(invoice: Invoice): void {
    this.items.update((list) => {
      const index = list.findIndex((item) => item.id === invoice.id);
      if (index === -1) return [invoice, ...list];
      const copy = [...list];
      copy[index] = invoice;
      return copy;
    });
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((invoice) => invoice.id !== id));
  }
}

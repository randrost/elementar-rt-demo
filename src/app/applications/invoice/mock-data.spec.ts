import { TestBed } from '@angular/core/testing';
import { grandTotal, InvoiceService, lineTotal, subtotal, taxAmount } from './mock-data';

describe('invoice maths', () => {
  const items = [
    { qty: 3, unitPrice: 2400 },
    { qty: 1, unitPrice: 1800 }
  ];

  it('multiplies a line', () => {
    expect(lineTotal({ qty: 3, unitPrice: 2400 })).toBe(7200);
  });

  it('sums the lines', () => {
    expect(subtotal(items)).toBe(9000);
  });

  it('applies the tax rate to the subtotal', () => {
    expect(taxAmount(items, 20)).toBe(1800);
  });

  it('adds tax to reach the total', () => {
    expect(grandTotal(items, 20)).toBe(10800);
  });

  it('treats a zero rate as no tax', () => {
    expect(taxAmount(items, 0)).toBe(0);
    expect(grandTotal(items, 0)).toBe(subtotal(items));
  });

  it('handles an empty invoice', () => {
    expect(subtotal([])).toBe(0);
    expect(grandTotal([], 20)).toBe(0);
  });

  it('rounds tax to whole pence', () => {
    // 33.33 * 3 = 99.99; 7.5% of that must not carry floating-point noise.
    const odd = [{ qty: 3, unitPrice: 33.33 }];
    const tax = taxAmount(odd, 7.5);
    expect(tax).toBe(Math.round(tax * 100) / 100);
  });
});

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceService);
  });

  it('seeds a list of invoices', () => {
    expect(service.invoices().length).toBeGreaterThan(0);
  });

  it('finds an invoice by id', () => {
    const first = service.invoices()[0];
    expect(service.byId(first.id)).toBe(first);
  });

  it('returns undefined for an unknown id', () => {
    expect(service.byId('nope')).toBeUndefined();
  });

  it('gives every invoice a distinct number', () => {
    const numbers = service.invoices().map((invoice) => invoice.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('varies line-item counts across the seed', () => {
    // Regression: a cold-start bug in the seeded RNG made every invoice
    // exactly one line long.
    const counts = new Set(service.invoices().map((invoice) => invoice.items.length));
    expect(counts.size).toBeGreaterThan(1);
  });

  it('draft() produces an unsaved invoice', () => {
    const before = service.invoices().length;
    const draft = service.draft();
    expect(draft.items.length).toBe(1);
    expect(service.invoices().length).toBe(before);
  });

  it('save() adds a new invoice', () => {
    const before = service.invoices().length;
    service.save({ ...service.draft(), number: 'INV-TEST' });
    expect(service.invoices().length).toBe(before + 1);
  });

  it('save() updates an existing invoice in place', () => {
    const before = service.invoices().length;
    const existing = service.invoices()[0];
    service.save({ ...existing, number: 'INV-EDITED' });

    expect(service.invoices().length).toBe(before);
    expect(service.byId(existing.id)?.number).toBe('INV-EDITED');
  });

  it('remove() drops the invoice', () => {
    const target = service.invoices()[0];
    service.remove(target.id);
    expect(service.byId(target.id)).toBeUndefined();
  });
});

import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import {
  grandTotal,
  INVOICE_STATUS,
  InvoiceService,
  ISSUER,
  lineTotal,
  subtotal,
  taxAmount
} from './mock-data';

const TONE_CLASSES: Record<string, string> = {
  success: 'bg-green-container text-on-green-container',
  warning: 'bg-orange-container text-on-orange-container',
  error: 'bg-red-container text-on-red-container',
  info: 'bg-blue-container text-on-blue-container',
  neutral: 'bg-surface-container-highest text-on-surface-variant'
};

@Component({
  selector: 'app-invoice-details',
  imports: [PageComponent, RouterLink, MatButtonModule, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    @media print {
      :host {
        --print: 1;
      }
    }
  `,
  template: `
    @if (invoice(); as doc) {
      <app-page>
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <a
            routerLink="/applications/invoice/list"
            class="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface">
            <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
            All invoices
          </a>
          <div class="flex items-center gap-2">
            <a matButton="outlined" [routerLink]="['/applications/invoice/edit', doc.id]">Edit</a>
            <button matButton="filled" type="button" (click)="print()">
              <iconify-icon icon="solar:printer-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
              Print
            </button>
          </div>
        </div>

        <article class="rounded-2xl border border-outline-variant bg-surface p-8 sm:p-10">
          <!-- Header -->
          <header class="flex flex-wrap items-start justify-between gap-6 border-b border-outline-variant pb-8">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="grid size-10 place-items-center rounded-xl bg-primary text-on-primary">
                  <iconify-icon icon="solar:atom-bold-duotone" width="24" height="24"></iconify-icon>
                </span>
                <span class="text-lg font-semibold text-on-surface">{{ issuer.name }}</span>
              </div>
              <address class="mt-4 text-sm not-italic text-on-surface-variant">
                @for (line of issuer.address; track line) {
                  <span class="block">{{ line }}</span>
                }
                <span class="mt-1 block">{{ issuer.email }}</span>
              </address>
            </div>

            <div class="text-right">
              <h1 class="text-2xl font-semibold tracking-tight text-on-surface">{{ doc.number }}</h1>
              <span
                class="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                [class]="statusClasses()">
                {{ status().label }}
              </span>
              <dl class="mt-4 space-y-1 text-sm">
                <div class="flex justify-end gap-3">
                  <dt class="text-on-surface-variant">Issued</dt>
                  <dd class="w-28 text-on-surface">{{ doc.issued | date: 'mediumDate' }}</dd>
                </div>
                <div class="flex justify-end gap-3">
                  <dt class="text-on-surface-variant">Due</dt>
                  <dd class="w-28 text-on-surface">{{ doc.due | date: 'mediumDate' }}</dd>
                </div>
              </dl>
            </div>
          </header>

          <!-- Bill to -->
          <section class="py-8">
            <h2 class="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Bill to</h2>
            <div class="mt-3 flex items-start gap-3">
              <img [src]="avatar(doc.client.avatarSeed)" alt="" class="size-11 rounded-xl" />
              <address class="text-sm not-italic">
                <span class="block font-medium text-on-surface">{{ doc.client.name }}</span>
                <span class="block text-on-surface-variant">{{ doc.client.email }}</span>
                @for (line of doc.client.address; track line) {
                  <span class="block text-on-surface-variant">{{ line }}</span>
                }
              </address>
            </div>
          </section>

          <!-- Line items -->
          <table class="w-full text-sm">
            <thead>
              <tr class="border-y border-outline-variant text-left text-xs uppercase tracking-wide text-on-surface-variant">
                <th class="py-3 font-medium">Description</th>
                <th class="py-3 text-right font-medium">Qty</th>
                <th class="py-3 text-right font-medium">Unit price</th>
                <th class="py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              @for (item of doc.items; track item.id) {
                <tr class="border-b border-outline-variant">
                  <td class="py-3.5 pr-4 text-on-surface">{{ item.description }}</td>
                  <td class="py-3.5 text-right tabular-nums text-on-surface-variant">{{ item.qty }}</td>
                  <td class="py-3.5 text-right tabular-nums text-on-surface-variant">
                    {{ item.unitPrice | currency: doc.currency }}
                  </td>
                  <td class="py-3.5 text-right font-medium tabular-nums text-on-surface">
                    {{ total(item) | currency: doc.currency }}
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Totals -->
          <div class="mt-6 flex justify-end">
            <dl class="w-full max-w-xs space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-on-surface-variant">Subtotal</dt>
                <dd class="tabular-nums text-on-surface">{{ sub() | currency: doc.currency }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-on-surface-variant">Tax ({{ doc.taxRate }}%)</dt>
                <dd class="tabular-nums text-on-surface">{{ tax() | currency: doc.currency }}</dd>
              </div>
              <div class="flex justify-between border-t border-outline-variant pt-2 text-base font-semibold">
                <dt class="text-on-surface">Total due</dt>
                <dd class="tabular-nums text-on-surface">{{ total_() | currency: doc.currency }}</dd>
              </div>
            </dl>
          </div>

          @if (doc.notes) {
            <p class="mt-8 border-t border-outline-variant pt-6 text-xs text-on-surface-variant">{{ doc.notes }}</p>
          }
        </article>
      </app-page>
    } @else {
      <app-page title="Invoice not found">
        <div class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-outline-variant py-20 text-center">
          <iconify-icon icon="solar:bill-cross-bold-duotone" width="44" height="44" class="text-primary"></iconify-icon>
          <p class="text-sm text-on-surface-variant">That invoice no longer exists.</p>
          <a matButton="filled" routerLink="/applications/invoice/list">Back to invoices</a>
        </div>
      </app-page>
    }
  `
})
export class InvoiceDetailsComponent {
  private readonly store = inject(InvoiceService);
  private readonly avatars = inject(AvatarService);

  /** Bound from the route via `withComponentInputBinding()`. */
  readonly id = input<string>('');

  protected readonly issuer = ISSUER;
  protected readonly invoice = computed(() => this.store.byId(this.id()) ?? null);

  protected readonly status = computed(() => {
    const doc = this.invoice();
    return doc ? INVOICE_STATUS[doc.status] : INVOICE_STATUS.draft;
  });
  protected readonly statusClasses = computed(() => TONE_CLASSES[this.status().tone]);

  protected readonly sub = computed(() => subtotal(this.invoice()?.items ?? []));
  protected readonly tax = computed(() =>
    taxAmount(this.invoice()?.items ?? [], this.invoice()?.taxRate ?? 0)
  );
  protected readonly total_ = computed(() =>
    grandTotal(this.invoice()?.items ?? [], this.invoice()?.taxRate ?? 0)
  );

  protected avatar(seed: string): string {
    return this.avatars.brand(seed);
  }

  protected total(item: { qty: number; unitPrice: number }): number {
    return lineTotal(item);
  }

  protected print(): void {
    window.print();
  }
}

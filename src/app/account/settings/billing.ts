import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService, PlanInvoice } from '../mock-data';

interface Plan {
  id: string;
  name: string;
  price: number;
  blurb: string;
  features: string[];
}

const PLANS: readonly Plan[] = [
  { id: 'starter', name: 'Starter', price: 0, blurb: 'For trying things out.', features: ['1 workspace', '3 members', 'Community support'] },
  { id: 'team', name: 'Team', price: 29, blurb: 'For a working team.', features: ['Unlimited workspaces', '25 members', 'Priority support', 'Saved views'] },
  { id: 'business', name: 'Business', price: 79, blurb: 'For a company.', features: ['Everything in Team', 'SSO (SAML, OIDC)', 'Audit log export', 'Uptime SLA'] }
];

const STATUS_CLASSES: Record<PlanInvoice['status'], string> = {
  paid: 'bg-green-container text-on-green-container',
  due: 'bg-orange-container text-on-orange-container',
  refunded: 'bg-surface-container-highest text-on-surface-variant'
};

/**
 * `billing` renders the invoice history as a table; `billing-2` renders the
 * same data as receipt cards. Both share the plan selector above.
 */
@Component({
  selector: 'app-account-billing',
  imports: [MatButtonModule, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex flex-col gap-5">
      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-on-surface">Current plan</h2>
            <p class="mt-1 text-sm text-on-surface-variant">
              Billed monthly. Changing plan is prorated to the day.
            </p>
          </div>
          <span class="rounded-full bg-primary-container px-3 py-1 text-sm font-medium text-on-primary-container">
            {{ currentName() }}
          </span>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-3">
          @for (plan of plans; track plan.id) {
            <button
              type="button"
              class="flex flex-col rounded-2xl border p-5 text-left transition-colors"
              [class]="
                selected() === plan.id
                  ? 'border-primary ring-1 ring-primary bg-surface-container'
                  : 'border-outline-variant hover:bg-surface-container-low'
              "
              [attr.aria-pressed]="selected() === plan.id"
              (click)="selected.set(plan.id)">
              <span class="text-sm font-semibold text-on-surface">{{ plan.name }}</span>
              <span class="mt-1 text-2xl font-semibold tabular-nums text-on-surface">
                {{ plan.price | currency: 'USD' : 'symbol' : '1.0-0' }}
                <span class="text-sm font-normal text-on-surface-variant">/mo</span>
              </span>
              <span class="mt-1 text-xs text-on-surface-variant">{{ plan.blurb }}</span>

              <ul class="mt-4 flex flex-col gap-1.5">
                @for (feature of plan.features; track feature) {
                  <li class="flex items-start gap-1.5 text-xs text-on-surface-variant">
                    <iconify-icon icon="solar:check-circle-bold" width="14" height="14" class="mt-0.5 shrink-0 text-primary"></iconify-icon>
                    {{ feature }}
                  </li>
                }
              </ul>
            </button>
          }
        </div>

        <div class="mt-6 flex justify-end">
          <button matButton="filled" type="button" [disabled]="selected() === current()" (click)="changePlan()">
            {{ selected() === current() ? 'Current plan' : 'Switch plan' }}
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <h2 class="text-base font-semibold text-on-surface">Invoice history</h2>

        @if (variant() === 'table') {
          <div class="mt-5 overflow-x-auto">
            <table class="w-full min-w-[30rem] text-sm">
              <thead>
                <tr class="border-b border-outline-variant text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  <th class="pb-3 font-medium">Reference</th>
                  <th class="pb-3 font-medium">Date</th>
                  <th class="pb-3 text-right font-medium">Amount</th>
                  <th class="pb-3 text-center font-medium">Status</th>
                  <th class="w-20 pb-3"></th>
                </tr>
              </thead>
              <tbody>
                @for (invoice of store.invoices; track invoice.id) {
                  <tr class="border-b border-outline-variant last:border-0">
                    <td class="py-3.5 font-medium text-on-surface">{{ invoice.reference }}</td>
                    <td class="py-3.5 text-on-surface-variant">{{ invoice.date | date: 'mediumDate' }}</td>
                    <td class="py-3.5 text-right tabular-nums text-on-surface">
                      {{ invoice.amount | currency: 'USD' }}
                    </td>
                    <td class="py-3.5 text-center">
                      <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" [class]="statusClass(invoice)">
                        {{ invoice.status }}
                      </span>
                    </td>
                    <td class="py-3.5 text-right">
                      <button matButton type="button" (click)="download(invoice)">PDF</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            @for (invoice of store.invoices; track invoice.id) {
              <div class="flex items-center gap-3 rounded-xl border border-outline-variant p-4">
                <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-container-highest text-on-surface-variant">
                  <iconify-icon icon="solar:bill-list-bold-duotone" width="20" height="20"></iconify-icon>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-on-surface">{{ invoice.reference }}</p>
                  <p class="text-xs text-on-surface-variant">{{ invoice.date | date: 'mediumDate' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold tabular-nums text-on-surface">
                    {{ invoice.amount | currency: 'USD' }}
                  </p>
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" [class]="statusClass(invoice)">
                    {{ invoice.status }}
                  </span>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `
})
export class AccountBillingComponent {
  protected readonly store = inject(AccountService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly plans = PLANS;
  protected readonly current = signal('team');
  protected readonly selected = signal('team');

  protected readonly variant = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['variant'] as 'table' | 'cards') ?? 'table')),
    { initialValue: 'table' as const }
  );

  protected currentName(): string {
    return PLANS.find((plan) => plan.id === this.current())?.name ?? 'Team';
  }

  protected statusClass(invoice: PlanInvoice): string {
    return STATUS_CLASSES[invoice.status];
  }

  protected changePlan(): void {
    this.current.set(this.selected());
    this.snackBar.open(`Switched to ${this.currentName()}`, 'Dismiss', { duration: 3000 });
  }

  protected download(invoice: PlanInvoice): void {
    this.snackBar.open(`${invoice.reference} would download here`, 'Dismiss', { duration: 3000 });
  }
}

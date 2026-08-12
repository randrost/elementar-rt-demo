import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService, PaymentMethod } from '../mock-data';

const BRAND_ICONS: Record<PaymentMethod['brand'], string> = {
  visa: 'logos:visa',
  mastercard: 'logos:mastercard',
  amex: 'logos:amex'
};

@Component({
  selector: 'app-account-payment',
  imports: [FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="rounded-2xl border border-outline-variant bg-surface p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-on-surface">Payment methods</h2>
          <p class="mt-1 text-sm text-on-surface-variant">
            The primary card is charged on renewal. Cards are simulated here.
          </p>
        </div>
        <button matButton="filled" type="button" (click)="openDialog()">
          <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
          Add card
        </button>
      </div>

      <div class="mt-5 flex flex-col gap-3">
        @for (card of store.paymentMethods(); track card.id) {
          <div
            class="flex flex-wrap items-center gap-4 rounded-xl border p-4"
            [class]="card.primary ? 'border-primary bg-surface-container' : 'border-outline-variant'">
            <span class="grid h-9 w-14 shrink-0 place-items-center rounded-lg bg-white">
              <iconify-icon [icon]="brandIcon(card)" width="34" height="24"></iconify-icon>
            </span>

            <div class="min-w-0 flex-1">
              <p class="flex flex-wrap items-center gap-2 text-sm font-medium text-on-surface">
                <span class="tabular-nums">•••• •••• •••• {{ card.last4 }}</span>
                @if (card.primary) {
                  <span class="rounded-full bg-primary-container px-2 py-0.5 text-[11px] font-medium text-on-primary-container">
                    Primary
                  </span>
                }
              </p>
              <p class="text-xs text-on-surface-variant">{{ card.holder }} · expires {{ card.expiry }}</p>
            </div>

            <div class="flex items-center gap-2">
              @if (!card.primary) {
                <button matButton type="button" (click)="store.makePrimary(card.id)">Make primary</button>
              }
              <button
                matButton
                type="button"
                class="!text-error"
                [disabled]="store.paymentMethods().length === 1"
                (click)="remove(card)">
                Remove
              </button>
            </div>
          </div>
        }
      </div>
    </section>

    @if (dialogOpen()) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Add card">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="dialogOpen.set(false)" aria-label="Close"></button>

        <div class="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
          <h2 class="text-lg font-semibold text-on-surface">Add a card</h2>
          <p class="mt-1 text-sm text-on-surface-variant">Nothing is sent anywhere — this is a demo.</p>

          <label class="mt-5 block text-xs font-medium text-on-surface-variant" for="card-holder">Name on card</label>
          <input
            id="card-holder"
            [(ngModel)]="holder"
            placeholder="R. Tulika"
            class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />

          <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="card-number">Card number</label>
          <input
            id="card-number"
            [(ngModel)]="number"
            inputmode="numeric"
            placeholder="4242 4242 4242 4242"
            class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm tabular-nums outline-none focus:border-primary" />

          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-on-surface-variant" for="card-expiry">Expiry</label>
              <input
                id="card-expiry"
                [(ngModel)]="expiry"
                placeholder="09/28"
                class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm tabular-nums outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-xs font-medium text-on-surface-variant" for="card-cvc">CVC</label>
              <input
                id="card-cvc"
                [(ngModel)]="cvc"
                inputmode="numeric"
                placeholder="123"
                class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm tabular-nums outline-none focus:border-primary" />
            </div>
          </div>

          <span class="mt-4 block text-xs font-medium text-on-surface-variant">Brand</span>
          <div class="mt-1.5 flex gap-1.5">
            @for (option of brands; track option) {
              <button
                type="button"
                class="flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors"
                [class]="
                  brand() === option
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                "
                (click)="brand.set(option)">
                {{ option }}
              </button>
            }
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button matButton type="button" (click)="dialogOpen.set(false)">Cancel</button>
            <button matButton="filled" type="button" [disabled]="!canAdd()" (click)="add()">Add card</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AccountPaymentComponent {
  protected readonly store = inject(AccountService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly brands: PaymentMethod['brand'][] = ['visa', 'mastercard', 'amex'];

  protected readonly dialogOpen = signal(false);
  protected readonly holder = signal('');
  protected readonly number = signal('');
  protected readonly expiry = signal('');
  protected readonly cvc = signal('');
  protected readonly brand = signal<PaymentMethod['brand']>('visa');

  protected brandIcon(card: PaymentMethod): string {
    return BRAND_ICONS[card.brand];
  }

  protected openDialog(): void {
    this.holder.set('');
    this.number.set('');
    this.expiry.set('');
    this.cvc.set('');
    this.brand.set('visa');
    this.dialogOpen.set(true);
  }

  protected canAdd(): boolean {
    return this.holder().trim().length > 1 && this.number().replace(/\s/g, '').length >= 12 && !!this.expiry();
  }

  protected add(): void {
    if (!this.canAdd()) return;
    const digits = this.number().replace(/\D/g, '');
    this.store.addCard({
      brand: this.brand(),
      last4: digits.slice(-4),
      expiry: this.expiry(),
      holder: this.holder().trim()
    });
    this.dialogOpen.set(false);
    this.snackBar.open('Card added', 'Dismiss', { duration: 3000 });
  }

  protected remove(card: PaymentMethod): void {
    this.store.removeCard(card.id);
    this.snackBar.open(`Card ending ${card.last4} removed`, 'Dismiss', { duration: 3000 });
  }
}

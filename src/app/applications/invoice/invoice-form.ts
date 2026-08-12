import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PageComponent } from '../../shell/page/page';
import {
  grandTotal,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceService,
  lineTotal,
  subtotal,
  taxAmount
} from './mock-data';
import { randomId } from '../../shared/mock/mock';

type ItemGroup = FormGroup<{
  id: FormControl<string>;
  description: FormControl<string>;
  qty: FormControl<number>;
  unitPrice: FormControl<number>;
}>;

const STATUSES: readonly InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'void'];

/**
 * Serves both `/invoice/new` and `/invoice/edit/:id`. Line items are a form
 * array; totals recompute from its value stream rather than on every keystroke
 * handler, so the maths lives in one place.
 */
@Component({
  selector: 'app-invoice-form',
  imports: [
    PageComponent,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="heading()" [description]="subheading()">
      <ng-container actions>
        <a matButton routerLink="/applications/invoice/list">Cancel</a>
        <button matButton="filled" type="button" (click)="save()">Save invoice</button>
      </ng-container>

      <form [formGroup]="form" class="flex flex-col gap-6">
        <!-- Meta -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <h2 class="mb-4 text-sm font-semibold text-on-surface">Invoice details</h2>
          <div class="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
            <mat-form-field appearance="outline">
              <mat-label>Number</mat-label>
              <input matInput formControlName="number" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                @for (status of statuses; track status) {
                  <mat-option [value]="status" class="capitalize">{{ status }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Issued</mat-label>
              <input matInput type="date" formControlName="issued" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Due</mat-label>
              <input matInput type="date" formControlName="due" />
            </mat-form-field>
          </div>
        </section>

        <!-- Client -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6" formGroupName="client">
          <h2 class="mb-4 text-sm font-semibold text-on-surface">Bill to</h2>
          <div class="grid gap-x-4 gap-y-1 sm:grid-cols-2">
            <mat-form-field appearance="outline">
              <mat-label>Client name</mat-label>
              <input matInput formControlName="name" placeholder="Northwind Trading" />
              @if (clientName.touched && clientName.invalid) {
                <mat-error>Who is this invoice for?</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Billing email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="ap@client.example" />
              @if (clientEmail.touched && clientEmail.invalid) {
                <mat-error>Enter a valid email address.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="sm:col-span-2">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="2" placeholder="One line per row"></textarea>
            </mat-form-field>
          </div>
        </section>

        <!-- Line items -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-on-surface">Line items</h2>
            <button matButton="outlined" type="button" (click)="addItem()">
              <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
              Add item
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[40rem] text-sm">
              <thead>
                <tr class="border-b border-outline-variant text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  <th class="pb-2 font-medium">Description</th>
                  <th class="w-24 pb-2 text-right font-medium">Qty</th>
                  <th class="w-36 pb-2 text-right font-medium">Unit price</th>
                  <th class="w-32 pb-2 text-right font-medium">Amount</th>
                  <th class="w-12 pb-2"></th>
                </tr>
              </thead>
              <tbody formArrayName="items">
                @for (group of items.controls; track group; let i = $index) {
                  <tr [formGroupName]="i" class="border-b border-outline-variant last:border-0">
                    <td class="py-2 pr-3">
                      <input
                        formControlName="description"
                        placeholder="What are you billing for?"
                        aria-label="Item description"
                        class="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
                    </td>
                    <td class="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        formControlName="qty"
                        aria-label="Quantity"
                        class="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-primary" />
                    </td>
                    <td class="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        formControlName="unitPrice"
                        aria-label="Unit price"
                        class="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-primary" />
                    </td>
                    <td class="py-2 pr-3 text-right font-medium tabular-nums text-on-surface">
                      {{ rowTotal(i) | currency: 'USD' }}
                    </td>
                    <td class="py-2 text-right">
                      <button
                        matIconButton
                        type="button"
                        [disabled]="items.length === 1"
                        (click)="removeItem(i)"
                        [attr.aria-label]="'Remove item ' + (i + 1)">
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="18" height="18"></iconify-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="mt-6 flex flex-wrap justify-end gap-6">
            <div class="w-40">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Tax rate %</mat-label>
                <input matInput type="number" min="0" max="100" formControlName="taxRate" />
              </mat-form-field>
            </div>

            <dl class="w-full max-w-xs space-y-2 self-start text-sm">
              <div class="flex justify-between">
                <dt class="text-on-surface-variant">Subtotal</dt>
                <dd class="tabular-nums text-on-surface">{{ subtotal_() | currency: 'USD' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-on-surface-variant">Tax</dt>
                <dd class="tabular-nums text-on-surface">{{ tax_() | currency: 'USD' }}</dd>
              </div>
              <div class="flex justify-between border-t border-outline-variant pt-2 text-base font-semibold">
                <dt class="text-on-surface">Total</dt>
                <dd class="tabular-nums text-on-surface">{{ total_() | currency: 'USD' }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>
        </section>
      </form>
    </app-page>
  `
})
export class InvoiceFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(InvoiceService);
  private readonly router = inject(Router);

  protected readonly statuses = STATUSES;

  /**
   * Read from the route snapshot, not a signal input: the form is built in field
   * initializers, which run before input binding, so `id()` would still be empty
   * and every edit would open a blank draft.
   */
  private readonly routeId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly existing = this.store.byId(this.routeId);
  private readonly source: Invoice = this.existing ?? this.store.draft();
  private readonly isNew = !this.existing;

  protected readonly heading = computed(() => (this.isNew ? 'New invoice' : `Edit ${this.source.number}`));
  protected readonly subheading = computed(() =>
    this.isNew ? 'Totals update as you type.' : 'Changes are saved to this session only.'
  );

  protected readonly form = this.fb.nonNullable.group({
    number: [this.source.number, Validators.required],
    status: [this.source.status],
    issued: [this.source.issued.slice(0, 10)],
    due: [this.source.due.slice(0, 10)],
    taxRate: [this.source.taxRate],
    notes: [this.source.notes],
    client: this.fb.nonNullable.group({
      name: [this.source.client.name, Validators.required],
      email: [this.source.client.email, [Validators.required, Validators.email]],
      address: [this.source.client.address.join('\n')]
    }),
    items: this.fb.array(this.source.items.map((item) => this.itemGroup(item)))
  });

  protected get items(): FormArray<ItemGroup> {
    return this.form.controls.items as FormArray<ItemGroup>;
  }

  protected get clientName() {
    return this.form.controls.client.controls.name;
  }

  protected get clientEmail() {
    return this.form.controls.client.controls.email;
  }

  /** One value stream drives every total, so the maths cannot drift per field. */
  private readonly value = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)), {
    initialValue: this.form.value
  });

  private readonly lines = computed(() =>
    (this.value().items ?? []).map((item) => ({
      qty: Number(item?.qty) || 0,
      unitPrice: Number(item?.unitPrice) || 0
    }))
  );

  protected readonly subtotal_ = computed(() => subtotal(this.lines()));
  protected readonly tax_ = computed(() => taxAmount(this.lines(), Number(this.value().taxRate) || 0));
  protected readonly total_ = computed(() => grandTotal(this.lines(), Number(this.value().taxRate) || 0));

  protected rowTotal(index: number): number {
    return lineTotal(this.lines()[index] ?? { qty: 0, unitPrice: 0 });
  }

  protected addItem(): void {
    this.items.push(this.itemGroup({ id: randomId('item-'), description: '', qty: 1, unitPrice: 0 }));
  }

  protected removeItem(index: number): void {
    if (this.items.length > 1) this.items.removeAt(index);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.store.save({
      ...this.source,
      number: raw.number,
      status: raw.status,
      issued: new Date(raw.issued).toISOString(),
      due: new Date(raw.due).toISOString(),
      taxRate: Number(raw.taxRate) || 0,
      notes: raw.notes,
      client: {
        ...this.source.client,
        name: raw.client.name,
        email: raw.client.email,
        address: raw.client.address.split('\n').map((line) => line.trim()).filter(Boolean),
        avatarSeed: raw.client.name.toLowerCase().replace(/[^a-z]+/g, '-') || 'new-client'
      },
      items: raw.items.map((item) => ({
        id: item.id,
        description: item.description,
        qty: Number(item.qty) || 0,
        unitPrice: Number(item.unitPrice) || 0
      }))
    });

    this.router.navigate(['/applications/invoice/details', this.source.id]);
  }

  private itemGroup(item: InvoiceItem): ItemGroup {
    return this.fb.nonNullable.group({
      id: [item.id],
      description: [item.description],
      qty: [item.qty],
      unitPrice: [item.unitPrice]
    }) as ItemGroup;
  }
}

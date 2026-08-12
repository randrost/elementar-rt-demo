import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { DataTableComponent } from '../../shared/datatable/datatable';
import { DataColumn } from '../../shared/datatable/datatable.types';
import { grandTotal, Invoice, INVOICE_STATUS, InvoiceService } from './mock-data';

@Component({
  selector: 'app-invoice-list',
  imports: [PageComponent, DataTableComponent, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Invoices" description="Every billing document, and where each one stands.">
      <ng-container actions>
        <a matButton="filled" routerLink="/applications/invoice/new">
          <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
          New invoice
        </a>
      </ng-container>

      <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <div class="rounded-2xl border border-outline-variant bg-surface p-4">
            <p class="text-xs text-on-surface-variant">{{ stat.label }}</p>
            <p class="mt-1 text-2xl font-semibold tabular-nums text-on-surface">{{ stat.value }}</p>
            <p class="mt-0.5 text-xs text-on-surface-variant">{{ stat.hint }}</p>
          </div>
        }
      </div>

      <app-datatable
        [data]="invoices()"
        [columns]="columns"
        enableSearch
        enableSelection
        [pageSize]="10"
        emptyMessage="No invoices yet." />
    </app-page>
  `
})
export class InvoiceListComponent {
  private readonly store = inject(InvoiceService);
  private readonly router = inject(Router);

  protected readonly invoices = this.store.invoices;

  protected readonly stats = computed(() => {
    const all = this.invoices();
    const money = (value: number) =>
      value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const totalFor = (status: Invoice['status']) =>
      all.filter((i) => i.status === status).reduce((sum, i) => sum + grandTotal(i.items, i.taxRate), 0);

    return [
      { label: 'Outstanding', value: money(totalFor('sent') + totalFor('overdue')), hint: 'Sent and overdue' },
      { label: 'Overdue', value: money(totalFor('overdue')), hint: `${all.filter((i) => i.status === 'overdue').length} invoices` },
      { label: 'Paid', value: money(totalFor('paid')), hint: 'Collected to date' },
      { label: 'Drafts', value: String(all.filter((i) => i.status === 'draft').length), hint: 'Not yet sent' }
    ];
  });

  protected readonly columns: DataColumn<Invoice>[] = [
    { id: 'number', header: 'Number', accessor: (row) => row.number, width: '8rem' },
    {
      id: 'client',
      header: 'Client',
      type: 'user',
      accessor: (row) => ({
        name: row.client.name,
        secondary: row.client.email,
        avatarSeed: row.client.avatarSeed
      })
    },
    {
      id: 'amount',
      header: 'Amount',
      type: 'currency',
      align: 'right',
      accessor: (row) => grandTotal(row.items, row.taxRate)
    },
    {
      id: 'status',
      header: 'Status',
      type: 'status',
      accessor: (row) => INVOICE_STATUS[row.status]
    },
    { id: 'issued', header: 'Issued', type: 'date', accessor: (row) => row.issued },
    { id: 'due', header: 'Due', type: 'date', accessor: (row) => row.due },
    {
      id: 'actions',
      header: '',
      type: 'actions',
      sortable: false,
      width: '4rem',
      accessor: () => null,
      actions: [
        {
          label: 'View',
          icon: 'solar:eye-linear',
          run: (row) => this.router.navigate(['/applications/invoice/details', row.id])
        },
        {
          label: 'Edit',
          icon: 'solar:pen-linear',
          run: (row) => this.router.navigate(['/applications/invoice/edit', row.id])
        },
        {
          label: 'Delete',
          icon: 'solar:trash-bin-trash-linear',
          tone: 'danger',
          run: (row) => this.store.remove(row.id)
        }
      ]
    }
  ];
}

import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { DataTableComponent } from '../../shared/datatable/datatable';
import { DataColumn, StatusTone } from '../../shared/datatable/datatable.types';
import { HelpCenterService, Ticket, TicketPriority, TicketStatus } from './mock-data';

const STATUS_TONE: Record<TicketStatus, StatusTone> = {
  open: 'success',
  pending: 'warning',
  solved: 'neutral'
};

const PRIORITY_TONE: Record<TicketPriority, StatusTone> = {
  urgent: 'error',
  high: 'warning',
  normal: 'info',
  low: 'neutral'
};

const PRIORITIES: readonly TicketPriority[] = ['low', 'normal', 'high', 'urgent'];

@Component({
  selector: 'app-help-support',
  imports: [PageComponent, DataTableComponent, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Support" description="Your tickets and their current state.">
      <ng-container actions>
        <button matButton="filled" type="button" (click)="openDialog()">
          <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
          New ticket
        </button>
      </ng-container>

      <div class="mb-6 grid gap-4 sm:grid-cols-3">
        @for (stat of stats(); track stat.label) {
          <div class="rounded-2xl border border-outline-variant bg-surface p-4">
            <p class="text-xs text-on-surface-variant">{{ stat.label }}</p>
            <p class="mt-1 text-2xl font-semibold tabular-nums text-on-surface">{{ stat.value }}</p>
          </div>
        }
      </div>

      <app-datatable [data]="tickets()" [columns]="columns" enableSearch [pageSize]="8" emptyMessage="No tickets yet." />
    </app-page>

    @if (dialogOpen()) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="New ticket">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="dialogOpen.set(false)" aria-label="Close"></button>

        <div class="relative w-full max-w-lg rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
          <h2 class="text-lg font-semibold text-on-surface">Open a ticket</h2>
          <p class="mt-1 text-sm text-on-surface-variant">
            Tell us what happened and what you expected instead.
          </p>

          <label class="mt-6 block text-sm font-medium text-on-surface" for="ticket-subject">Subject</label>
          <input
            id="ticket-subject"
            [(ngModel)]="subject"
            placeholder="Export finishes but the link 404s"
            class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary" />

          <span class="mt-5 block text-sm font-medium text-on-surface">Priority</span>
          <div class="mt-1.5 flex flex-wrap gap-2">
            @for (level of priorities; track level) {
              <button
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors"
                [class]="
                  priority() === level
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                "
                [attr.aria-pressed]="priority() === level"
                (click)="priority.set(level)">
                {{ level }}
              </button>
            }
          </div>

          <div class="mt-8 flex justify-end gap-2">
            <button matButton type="button" (click)="dialogOpen.set(false)">Cancel</button>
            <button matButton="filled" type="button" [disabled]="!subject().trim()" (click)="submit()">
              Open ticket
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class HelpSupportComponent {
  private readonly store = inject(HelpCenterService);

  protected readonly tickets = this.store.tickets;
  protected readonly priorities = PRIORITIES;

  protected readonly dialogOpen = signal(false);
  protected readonly subject = signal('');
  protected readonly priority = signal<TicketPriority>('normal');

  protected readonly stats = computed(() => {
    const all = this.tickets();
    return [
      { label: 'Open', value: all.filter((t) => t.status === 'open').length },
      { label: 'Pending', value: all.filter((t) => t.status === 'pending').length },
      { label: 'Solved', value: all.filter((t) => t.status === 'solved').length }
    ];
  });

  protected readonly columns: DataColumn<Ticket>[] = [
    { id: 'reference', header: 'Ref', accessor: (row) => row.reference, width: '7rem' },
    { id: 'subject', header: 'Subject', accessor: (row) => row.subject },
    {
      id: 'requester',
      header: 'Requester',
      type: 'user',
      accessor: (row) => ({ name: row.requester, avatarSeed: row.requesterSeed })
    },
    {
      id: 'priority',
      header: 'Priority',
      type: 'status',
      accessor: (row) => ({ label: row.priority, tone: PRIORITY_TONE[row.priority] })
    },
    {
      id: 'status',
      header: 'Status',
      type: 'status',
      accessor: (row) => ({ label: row.status, tone: STATUS_TONE[row.status] })
    },
    { id: 'updated', header: 'Updated', type: 'date', accessor: (row) => row.updated }
  ];

  protected openDialog(): void {
    this.subject.set('');
    this.priority.set('normal');
    this.dialogOpen.set(true);
  }

  protected submit(): void {
    const subject = this.subject().trim();
    if (!subject) return;
    this.store.openTicket(subject, this.priority());
    this.dialogOpen.set(false);
  }
}

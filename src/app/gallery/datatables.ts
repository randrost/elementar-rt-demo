import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageComponent } from '../shell/page/page';
import { DataTableComponent } from '../shared/datatable/datatable';
import { DataColumn } from '../shared/datatable/datatable.types';
import { GalleryUser, GalleryUsersService, USER_STATUS } from './mock-data';

@Component({
  selector: 'app-gallery-datatables',
  imports: [PageComponent, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="meta().title" [description]="meta().description">
      @if (variant() === 'general') {
        <div class="flex flex-col gap-8">
          <section>
            <h2 class="mb-3 text-sm font-semibold text-on-surface">Every cell type</h2>
            <p class="mb-4 text-sm text-on-surface-variant">
              User, status, currency, date, progress, rating, tags, and a row-action menu.
            </p>
            <app-datatable [data]="users()" [columns]="allTypes" enableSearch enableSelection [pageSize]="6" />
          </section>

          <section>
            <h2 class="mb-3 text-sm font-semibold text-on-surface">Minimal</h2>
            <p class="mb-4 text-sm text-on-surface-variant">No toolbar, no selection — just sorted columns.</p>
            <app-datatable [data]="users()" [columns]="minimal" [pageSize]="5" />
          </section>

          <section>
            <h2 class="mb-3 text-sm font-semibold text-on-surface">Loading and empty</h2>
            <div class="grid gap-5 xl:grid-cols-2">
              <app-datatable [data]="[]" [columns]="minimal" loading />
              <app-datatable [data]="[]" [columns]="minimal" emptyMessage="Nothing matches those filters." />
            </div>
          </section>
        </div>
      } @else {
        <app-datatable
          [data]="users()"
          [columns]="usersTable"
          enableSearch
          enableSelection
          [pageSize]="10"
          emptyMessage="No people yet." />
      }
    </app-page>
  `
})
export class GalleryDatatablesComponent {
  private readonly store = inject(GalleryUsersService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly users = this.store.users;

  protected readonly variant = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['variant'] as 'general' | 'users') ?? 'general')),
    { initialValue: 'general' as const }
  );

  protected readonly meta = computed(() =>
    this.variant() === 'general'
      ? {
          title: 'Data tables',
          description: 'The shared datatable kit, showing each cell renderer and state.'
        }
      : {
          title: 'Users table',
          description: 'A realistic people table: search, sort, select, and row actions.'
        }
  );

  private readonly user: DataColumn<GalleryUser> = {
    id: 'user',
    header: 'Person',
    type: 'user',
    accessor: (row) => ({ name: row.name, secondary: row.email, avatarSeed: row.avatarSeed })
  };

  private readonly status: DataColumn<GalleryUser> = {
    id: 'status',
    header: 'Status',
    type: 'status',
    accessor: (row) => USER_STATUS[row.status]
  };

  protected readonly allTypes: DataColumn<GalleryUser>[] = [
    this.user,
    this.status,
    { id: 'spend', header: 'Spend', type: 'currency', align: 'right', accessor: (row) => row.projects * 1250 },
    { id: 'lastSeen', header: 'Last seen', type: 'date', accessor: (row) => row.lastSeen },
    { id: 'load', header: 'Load', type: 'progress', accessor: (row) => Math.min(100, row.projects * 9) },
    { id: 'rating', header: 'Rating', type: 'rating', accessor: (row) => row.rating },
    { id: 'tags', header: 'Tags', type: 'tags', accessor: (row) => [row.team, row.role] },
    {
      id: 'actions',
      header: '',
      type: 'actions',
      sortable: false,
      width: '4rem',
      accessor: () => null,
      actions: [
        { label: 'View', icon: 'solar:eye-linear', run: (row) => this.toast(`Viewing ${row.name}`) },
        { label: 'Edit', icon: 'solar:pen-linear', run: (row) => this.toast(`Editing ${row.name}`) },
        {
          label: 'Suspend',
          icon: 'solar:forbidden-circle-linear',
          tone: 'danger',
          run: (row) => this.toast(`${row.name} suspended`)
        }
      ]
    }
  ];

  protected readonly minimal: DataColumn<GalleryUser>[] = [
    { id: 'name', header: 'Name', accessor: (row) => row.name },
    { id: 'role', header: 'Role', accessor: (row) => row.role },
    { id: 'team', header: 'Team', accessor: (row) => row.team },
    { id: 'location', header: 'Location', accessor: (row) => row.location }
  ];

  protected readonly usersTable: DataColumn<GalleryUser>[] = [
    this.user,
    { id: 'role', header: 'Role', accessor: (row) => row.role },
    { id: 'team', header: 'Team', accessor: (row) => row.team },
    this.status,
    { id: 'location', header: 'Location', accessor: (row) => row.location },
    { id: 'lastSeen', header: 'Last seen', type: 'date', accessor: (row) => row.lastSeen },
    {
      id: 'actions',
      header: '',
      type: 'actions',
      sortable: false,
      width: '4rem',
      accessor: () => null,
      actions: [
        { label: 'Edit role', icon: 'solar:pen-linear', run: (row) => this.toast(`Editing ${row.name}`) },
        { label: 'Reset password', icon: 'solar:key-linear', run: (row) => this.toast(`Reset sent to ${row.email}`) },
        {
          label: 'Remove',
          icon: 'solar:trash-bin-trash-linear',
          tone: 'danger',
          run: (row) => this.toast(`${row.name} removed`)
        }
      ]
    }
  ];

  private toast(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 2500 });
  }
}

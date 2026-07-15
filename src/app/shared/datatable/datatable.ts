import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  contentChildren,
  inject,
  input,
  signal
} from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ColumnDef,
  PaginationState,
  SortingState,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/angular-table';
import { AvatarService } from '../../core/avatar.service';
import { CellTemplateDirective } from './cell-template.directive';
import { DataColumn, StatusCellValue, StatusTone, UserCellValue } from './datatable.types';

@Component({
  selector: 'app-datatable',
  imports: [
    DatePipe, NgTemplateOutlet, FormsModule,
    MatMenuModule, MatButtonModule, MatCheckboxModule, MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './datatable.html'
})
export class DataTableComponent<T> {
  private readonly avatars = inject(AvatarService);

  readonly data = input.required<T[]>();
  readonly columns = input.required<DataColumn<T>[]>();
  readonly enableSelection = input(false, { transform: booleanAttr });
  readonly enableSearch = input(true, { transform: booleanAttr });
  readonly pageSize = input(10);
  readonly loading = input(false, { transform: booleanAttr });
  readonly emptyMessage = input('No records found.');

  private readonly cellTemplates = contentChildren(CellTemplateDirective);

  protected readonly sorting = signal<SortingState>([]);
  protected readonly globalFilter = signal('');
  protected readonly rowSelection = signal<Record<string, boolean>>({});
  protected readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });

  private readonly tableColumns = computed<ColumnDef<T>[]>(() =>
    this.columns().map((c) => ({
      id: c.id,
      accessorFn: (row: T) => c.accessor(row),
      enableSorting: c.sortable ?? true
    }))
  );

  protected readonly table = createAngularTable(() => ({
    data: this.data(),
    columns: this.tableColumns(),
    state: {
      sorting: this.sorting(),
      globalFilter: this.globalFilter(),
      rowSelection: this.rowSelection(),
      pagination: { ...this.pagination(), pageSize: this.pageSize() }
    },
    enableRowSelection: this.enableSelection(),
    globalFilterFn: 'includesString',
    onSortingChange: (u) => this.sorting.set(typeof u === 'function' ? u(this.sorting()) : u),
    onGlobalFilterChange: (u) => this.globalFilter.set(typeof u === 'function' ? u(this.globalFilter()) : u),
    onRowSelectionChange: (u) => this.rowSelection.set(typeof u === 'function' ? u(this.rowSelection()) : u),
    onPaginationChange: (u) => this.pagination.set(typeof u === 'function' ? u(this.pagination()) : u),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  }));

  protected readonly selectedCount = computed(() => Object.values(this.rowSelection()).filter(Boolean).length);

  protected value(col: DataColumn<T>, row: T): unknown {
    return col.accessor(row);
  }

  protected asUser(v: unknown): UserCellValue {
    return v as UserCellValue;
  }

  protected asStatus(v: unknown): StatusCellValue {
    return v as StatusCellValue;
  }

  protected asTags(v: unknown): string[] {
    return (v as string[]) ?? [];
  }

  protected asDate(v: unknown): string | number | Date {
    return v as string | number | Date;
  }

  protected asNumber(v: unknown): number {
    return Number(v) || 0;
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected currency(v: unknown, code = 'USD'): string {
    const n = Number(v) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(n);
  }

  protected templateFor(name?: string) {
    if (!name) return null;
    return this.cellTemplates().find((t) => t.appCell() === name)?.template ?? null;
  }

  protected statusClasses(tone: StatusTone): string {
    switch (tone) {
      case 'success': return 'bg-green-container text-on-green-container';
      case 'warning': return 'bg-orange-container text-on-orange-container';
      case 'error': return 'bg-red-container text-on-red-container';
      case 'info': return 'bg-blue-container text-on-blue-container';
      default: return 'bg-surface-container-highest text-on-surface-variant';
    }
  }

  protected sortIcon(colId: string): string {
    const dir = this.table.getColumn(colId)?.getIsSorted();
    return dir === 'asc' ? 'solar:alt-arrow-up-linear' : dir === 'desc' ? 'solar:alt-arrow-down-linear' : 'solar:sort-vertical-linear';
  }
}

function booleanAttr(v: unknown): boolean {
  return v === '' || v === true || v === 'true';
}

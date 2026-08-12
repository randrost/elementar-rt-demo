import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { DataTableComponent } from '../../shared/datatable/datatable';
import { CellTemplateDirective } from '../../shared/datatable/cell-template.directive';
import { DataColumn } from '../../shared/datatable/datatable.types';
import { FileManagerService, FileNode, formatBytes, KIND_META } from './mock-data';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-file-manager',
  imports: [PageComponent, MatButtonModule, DataTableComponent, CellTemplateDirective, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="File manager" description="Browse, select, and organise your workspace files.">
      <ng-container actions>
        <div class="flex rounded-xl border border-outline-variant p-0.5" role="group" aria-label="View mode">
          @for (mode of modes; track mode.id) {
            <button
              type="button"
              class="grid size-8 place-items-center rounded-lg transition-colors"
              [class]="view() === mode.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
              [attr.aria-pressed]="view() === mode.id"
              [attr.aria-label]="mode.label"
              (click)="view.set(mode.id)">
              <iconify-icon [icon]="mode.icon" width="17" height="17"></iconify-icon>
            </button>
          }
        </div>
      </ng-container>

      <!-- Breadcrumb -->
      <nav class="mb-4 flex flex-wrap items-center gap-1 text-sm" aria-label="Folder path">
        <button
          type="button"
          class="rounded-lg px-2 py-1 font-medium transition-colors"
          [class]="folderId() === null ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'"
          (click)="open(null)">
          All files
        </button>
        @for (crumb of path(); track crumb.id) {
          <iconify-icon icon="solar:alt-arrow-right-linear" width="14" height="14" class="text-on-surface-variant"></iconify-icon>
          <button
            type="button"
            class="rounded-lg px-2 py-1 font-medium transition-colors"
            [class]="crumb.id === folderId() ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'"
            (click)="open(crumb.id)">
            {{ crumb.name }}
          </button>
        }
      </nav>

      <!-- Dropzone -->
      <div
        class="mb-6 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors"
        [class]="dragOver() ? 'border-primary bg-surface-container' : 'border-outline-variant'"
        (dragover)="onDragOver($event)"
        (dragleave)="dragOver.set(false)"
        (drop)="onDrop($event)">
        <iconify-icon icon="solar:cloud-upload-bold-duotone" width="34" height="34" class="text-primary"></iconify-icon>
        <p class="text-sm text-on-surface">
          Drop files here to upload
          <span class="text-on-surface-variant">— or</span>
          <button type="button" class="font-medium text-primary hover:underline" (click)="simulateUpload()">
            add a sample file
          </button>
        </p>
        <p class="text-xs text-on-surface-variant">Uploads are simulated and live in this session only.</p>
      </div>

      @if (selectedIds().size > 0) {
        <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-surface-container px-4 py-2.5">
          <span class="text-sm text-on-surface">{{ selectedIds().size }} selected</span>
          <button matButton type="button" (click)="clearSelection()">Clear</button>
          <button matButton type="button" class="!text-error" (click)="removeSelected()">Delete</button>
        </div>
      }

      @if (view() === 'grid') {
        @if (children().length === 0) {
          <p class="rounded-2xl border border-dashed border-outline-variant py-16 text-center text-sm text-on-surface-variant">
            This folder is empty.
          </p>
        } @else {
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            @for (node of children(); track node.id) {
              <div
                class="group relative flex flex-col rounded-2xl border p-4 transition-colors"
                [class]="
                  selectedIds().has(node.id)
                    ? 'border-primary bg-surface-container'
                    : 'border-outline-variant bg-surface hover:bg-surface-container-low'
                ">
                <div class="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    class="grid size-11 place-items-center rounded-xl bg-surface-container-highest"
                    (click)="activate(node)"
                    [attr.aria-label]="(node.kind === 'folder' ? 'Open ' : 'Select ') + node.name">
                    <iconify-icon [icon]="meta(node).icon" width="24" height="24" [class]="meta(node).classes"></iconify-icon>
                  </button>

                  <div class="flex items-center gap-0.5">
                    <button
                      type="button"
                      class="grid size-7 place-items-center rounded-lg transition-colors"
                      [class]="node.starred ? 'text-amber-500' : 'text-on-surface-variant opacity-0 group-hover:opacity-100 focus:opacity-100'"
                      (click)="store.toggleStar(node.id)"
                      [attr.aria-label]="(node.starred ? 'Unstar ' : 'Star ') + node.name">
                      <iconify-icon [icon]="node.starred ? 'solar:star-bold' : 'solar:star-linear'" width="15" height="15"></iconify-icon>
                    </button>
                    <button
                      type="button"
                      class="grid size-7 place-items-center rounded-lg text-on-surface-variant opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                      (click)="toggleSelected(node.id)"
                      [attr.aria-label]="'Select ' + node.name"
                      [attr.aria-pressed]="selectedIds().has(node.id)">
                      <iconify-icon
                        [icon]="selectedIds().has(node.id) ? 'solar:check-circle-bold' : 'solar:check-circle-linear'"
                        width="15"
                        height="15"></iconify-icon>
                    </button>
                  </div>
                </div>

                <button type="button" class="mt-3 text-left" (click)="activate(node)">
                  <span class="block truncate text-sm font-medium text-on-surface">{{ node.name }}</span>
                  <span class="mt-0.5 block text-xs text-on-surface-variant">
                    {{ node.kind === 'folder' ? childCount(node) + ' items' : size(node) }}
                    · {{ node.modified | date: 'MMM d' }}
                  </span>
                </button>
              </div>
            }
          </div>
        }
      } @else {
        <app-datatable
          [data]="children()"
          [columns]="columns"
          enableSearch
          [pageSize]="12"
          emptyMessage="This folder is empty.">
          <ng-template appCell="name" let-row>
            <button type="button" class="flex items-center gap-3 text-left" (click)="activate(row)">
              <iconify-icon [icon]="meta(row).icon" width="22" height="22" [class]="meta(row).classes"></iconify-icon>
              <span class="font-medium text-on-surface">{{ row.name }}</span>
            </button>
          </ng-template>

          <!-- Sorts on the raw byte count from the accessor, displays it formatted. -->
          <ng-template appCell="size" let-value="value">
            <span class="tabular-nums text-on-surface-variant">{{ bytes(value) }}</span>
          </ng-template>
        </app-datatable>
      }
    </app-page>
  `
})
export class FileManagerComponent {
  protected readonly store = inject(FileManagerService);
  private readonly avatars = inject(AvatarService);

  protected readonly modes: readonly { id: ViewMode; label: string; icon: string }[] = [
    { id: 'grid', label: 'Grid view', icon: 'solar:widget-4-linear' },
    { id: 'list', label: 'List view', icon: 'solar:list-linear' }
  ];

  protected readonly view = signal<ViewMode>('grid');
  protected readonly folderId = signal<string | null>(null);
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly dragOver = signal(false);

  protected readonly children = computed(() => {
    // Touch `all` so the list recomputes when nodes are added or removed.
    this.store.all();
    return this.store.childrenOf(this.folderId());
  });

  protected readonly path = computed(() => {
    this.store.all();
    return this.store.pathTo(this.folderId());
  });

  protected readonly columns: DataColumn<FileNode>[] = [
    { id: 'name', header: 'Name', type: 'custom', template: 'name', accessor: (row) => row.name },
    {
      id: 'owner',
      header: 'Owner',
      type: 'user',
      accessor: (row) => ({ name: this.ownerName(row.ownerSeed), avatarSeed: row.ownerSeed })
    },
    { id: 'kind', header: 'Type', accessor: (row) => row.kind },
    {
      id: 'size',
      header: 'Size',
      align: 'right',
      type: 'custom',
      template: 'size',
      accessor: (row) => this.store.sizeOf(row)
    },
    { id: 'modified', header: 'Modified', type: 'date', accessor: (row) => row.modified }
  ];

  protected meta(node: FileNode) {
    return KIND_META[node.kind];
  }

  protected size(node: FileNode): string {
    return formatBytes(this.store.sizeOf(node));
  }

  protected bytes(value: unknown): string {
    return formatBytes(Number(value) || 0);
  }

  protected childCount(node: FileNode): number {
    return this.store.childrenOf(node.id).length;
  }

  protected ownerName(seed: string): string {
    return seed
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected open(id: string | null): void {
    this.folderId.set(id);
    this.clearSelection();
  }

  protected activate(node: FileNode): void {
    if (node.kind === 'folder') this.open(node.id);
    else this.toggleSelected(node.id);
  }

  protected toggleSelected(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  protected removeSelected(): void {
    this.store.remove([...this.selectedIds()]);
    this.clearSelection();
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    for (const file of files) {
      this.store.upload(file.name, this.folderId(), file.size);
    }
  }

  /** Lets the dropzone be exercised without a real drag. */
  protected simulateUpload(): void {
    const stamp = new Date().toISOString().slice(11, 19).replace(/:/g, '');
    this.store.upload(`upload-${stamp}.pdf`, this.folderId(), 1_248_000);
  }
}

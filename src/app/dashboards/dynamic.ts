import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  KtdGridComponent,
  KtdGridDragHandle,
  KtdGridItemComponent,
  KtdGridLayout,
  KtdGridLayoutItem
} from '@katoid/angular-grid-layout';
import { PageComponent } from '../shell/page/page';
import { WIDGET_REGISTRY, widgetById } from '../widgets/registry';

const STORAGE_KEY = 'elementar-rt:dynamic-layout';
const COLS = 12;
const ROW_HEIGHT = 60;
const GAP = 16;

/**
 * Grid item ids carry their widget id: `traffic-overview#3`. Encoding it in the
 * id (rather than an extra field) means the mapping survives the grid library
 * rebuilding layout objects on drag, resize, and compaction.
 */
function widgetIdOf(itemId: string): string {
  return itemId.split('#')[0];
}

const DEFAULT_LAYOUT: readonly KtdGridLayoutItem[] = [
  { id: 'stat-tiles#1', x: 0, y: 0, w: 12, h: 3 },
  { id: 'traffic-overview#2', x: 0, y: 3, w: 8, h: 6 },
  { id: 'sales-gauge#3', x: 8, y: 3, w: 4, h: 6 },
  { id: 'transactions-list#4', x: 0, y: 9, w: 6, h: 7 },
  { id: 'top-products#5', x: 6, y: 9, w: 6, h: 7 }
];

function loadLayout(): KtdGridLayoutItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_LAYOUT];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_LAYOUT];
    // Drop tiles whose widget has since left the registry.
    const valid = parsed.filter(
      (item): item is KtdGridLayoutItem =>
        !!item && typeof item.id === 'string' && !!widgetById(widgetIdOf(item.id))
    );
    return valid.length ? valid : [...DEFAULT_LAYOUT];
  } catch {
    return [...DEFAULT_LAYOUT];
  }
}

@Component({
  selector: 'app-dynamic-dashboard',
  imports: [
    PageComponent,
    NgComponentOutlet,
    MatButtonModule,
    KtdGridComponent,
    KtdGridItemComponent,
    KtdGridDragHandle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { '(document:keydown.escape)': 'closePicker()' },
  styles: `
    /* Must be a block box: the ResizeObserver below measures this host, and an
       inline host reports a zero-width content rect. */
    :host {
      display: block;
    }

    /* The library positions items absolutely; let a tile's card fill it. */
    ktd-grid-item > .tile {
      height: 100%;
    }
  `,
  template: `
    <app-page
      title="Dynamic dashboard"
      description="Drag tiles by their handle, resize from the corner. Your layout is saved locally.">
      <ng-container actions>
        <button matButton type="button" (click)="reset()">Reset</button>
        <button matButton="filled" type="button" (click)="pickerOpen.set(true)">
          <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
          Add widget
        </button>
      </ng-container>

      @if (layout().length === 0) {
        <div class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-outline-variant py-20 text-center">
          <iconify-icon icon="solar:widget-add-bold-duotone" width="44" height="44" class="text-primary"></iconify-icon>
          <div>
            <p class="text-base font-medium text-on-surface">Your dashboard is empty</p>
            <p class="mt-1 text-sm text-on-surface-variant">Add a widget to start building a layout.</p>
          </div>
          <button matButton="filled" type="button" (click)="pickerOpen.set(true)">Add a widget</button>
        </div>
      } @else {
        <ktd-grid
          [cols]="cols"
          [rowHeight]="rowHeight"
          [gap]="gap"
          [layout]="layout()"
          [compactType]="'vertical'"
          (layoutUpdated)="onLayoutUpdated($event)">
          @for (item of layout(); track item.id) {
            <ktd-grid-item [id]="item.id" [minW]="3" [minH]="3">
              <div class="tile group relative">
                <div class="absolute right-3 top-3 z-20 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    ktdGridDragHandle
                    type="button"
                    class="grid size-8 cursor-move place-items-center rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                    aria-label="Drag to reposition">
                    <iconify-icon icon="solar:hamburger-menu-linear" width="16" height="16"></iconify-icon>
                  </button>
                  <button
                    type="button"
                    class="grid size-8 place-items-center rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-red-600 dark:hover:text-red-400"
                    (click)="remove(item.id)"
                    [attr.aria-label]="'Remove ' + nameOf(item.id)">
                    <iconify-icon icon="solar:close-circle-linear" width="16" height="16"></iconify-icon>
                  </button>
                </div>

                <ng-container *ngComponentOutlet="componentOf(item.id)" />
              </div>
            </ktd-grid-item>
          }
        </ktd-grid>
      }
    </app-page>

    <!-- Widget picker drawer -->
    @if (pickerOpen()) {
      <div class="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Add a widget">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="closePicker()" tabindex="-1" aria-hidden="true"></button>

        <aside class="relative flex h-full w-full max-w-md flex-col bg-surface shadow-2xl">
          <header class="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
            <div>
              <h2 class="text-base font-semibold text-on-surface">Add a widget</h2>
              <p class="mt-0.5 text-xs text-on-surface-variant">Everything registered in the catalog.</p>
            </div>
            <button
              type="button"
              class="grid size-9 place-items-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              (click)="closePicker()"
              aria-label="Close">
              <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto p-4">
            <ul class="flex flex-col gap-2">
              @for (widget of catalog; track widget.id) {
                <li>
                  <button
                    type="button"
                    class="flex w-full items-start gap-3 rounded-xl border border-outline-variant p-3 text-left transition-colors hover:bg-surface-container-low"
                    (click)="add(widget.id)">
                    <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-container text-on-primary-container">
                      <iconify-icon icon="solar:widget-4-bold-duotone" width="18" height="18"></iconify-icon>
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block text-sm font-medium text-on-surface">{{ widget.name }}</span>
                      <span class="mt-0.5 block text-xs text-on-surface-variant">{{ widget.description }}</span>
                    </span>
                    <span class="shrink-0 text-xs tabular-nums text-on-surface-variant">
                      {{ widget.defaultCols }}×{{ widget.defaultRows }}
                    </span>
                  </button>
                </li>
              }
            </ul>
          </div>
        </aside>
      </div>
    }
  `
})
export class DynamicDashboardComponent {
  protected readonly cols = COLS;
  protected readonly rowHeight = ROW_HEIGHT;
  protected readonly gap = GAP;
  protected readonly catalog = WIDGET_REGISTRY;

  protected readonly layout = signal<KtdGridLayoutItem[]>(loadLayout());
  protected readonly pickerOpen = signal(false);

  private readonly grid = viewChild(KtdGridComponent);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private lastWidth = 0;

  constructor() {
    // The grid measures its column width once. It renders before the shell
    // sidebar has settled, so without this the tiles are sized for a container
    // wider than they end up in — and stay that way until a window resize.
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width && width !== this.lastWidth) {
        this.lastWidth = width;
        this.grid()?.resize();
      }
    });

    afterNextRender(() => observer.observe(this.host.nativeElement));
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  /** Keeps generated tile ids unique against whatever was restored. */
  private counter = this.layout().reduce(
    (max, item) => Math.max(max, Number(item.id.split('#')[1]) || 0),
    0
  );

  protected componentOf(itemId: string) {
    return widgetById(widgetIdOf(itemId))?.component ?? null;
  }

  protected nameOf(itemId: string): string {
    return widgetById(widgetIdOf(itemId))?.name ?? 'widget';
  }

  protected onLayoutUpdated(layout: KtdGridLayout): void {
    this.layout.set(layout);
    this.persist();
  }

  protected add(widgetId: string): void {
    const definition = widgetById(widgetId);
    if (!definition) return;

    const bottom = this.layout().reduce((max, item) => Math.max(max, item.y + item.h), 0);
    this.counter += 1;

    this.layout.update((items) => [
      ...items,
      {
        id: `${widgetId}#${this.counter}`,
        x: 0,
        y: bottom,
        w: definition.defaultCols,
        h: definition.defaultRows
      }
    ]);
    this.persist();
    this.closePicker();
  }

  protected remove(itemId: string): void {
    this.layout.update((items) => items.filter((item) => item.id !== itemId));
    this.persist();
  }

  protected reset(): void {
    this.layout.set([...DEFAULT_LAYOUT]);
    this.persist();
  }

  protected closePicker(): void {
    this.pickerOpen.set(false);
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.layout()));
  }
}

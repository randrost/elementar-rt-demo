import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { widgetById } from '../widgets/registry';

export type TileSpan = 'full' | 'two-thirds' | 'half' | 'third';

export interface DashboardTile {
  /** Registry widget id. */
  id: string;
  span?: TileSpan;
}

/** Tailwind needs literal class names, so spans map to a fixed lookup. */
const SPAN_CLASSES: Record<TileSpan, string> = {
  full: 'lg:col-span-12',
  'two-thirds': 'lg:col-span-8',
  half: 'lg:col-span-6',
  third: 'lg:col-span-4'
};

/**
 * Lays out registry widgets on a responsive 12-column grid. Dashboards declare
 * *which* widgets and *how wide*; everything else — lookup, rendering, stacking
 * on small screens — happens here.
 */
@Component({
  selector: 'app-dashboard-grid',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      @for (tile of resolved(); track tile.key) {
        <div [class]="tile.spanClass">
          <ng-container *ngComponentOutlet="tile.component" />
        </div>
      }
    </div>
  `
})
export class DashboardGridComponent {
  readonly tiles = input.required<readonly DashboardTile[]>();

  protected readonly resolved = computed(() =>
    this.tiles()
      .map((tile, index) => {
        const definition = widgetById(tile.id);
        if (!definition) return null;
        return {
          // A dashboard may legitimately place the same widget twice.
          key: `${tile.id}-${index}`,
          component: definition.component,
          spanClass: SPAN_CLASSES[tile.span ?? 'half']
        };
      })
      .filter((tile) => tile !== null)
  );
}

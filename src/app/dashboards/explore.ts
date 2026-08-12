import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { PageComponent } from '../shell/page/page';
import { WIDGET_REGISTRY, WidgetGroup } from '../widgets/registry';

type Filter = 'all' | WidgetGroup;

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'finance', label: 'Finance' },
  { id: 'crypto', label: 'Crypto' }
];

/**
 * Browsable view of the whole catalog: every registered widget, filterable by
 * group, each labelled with its registry metadata. Doubles as the reference for
 * what the dynamic dashboard's picker can offer.
 */
@Component({
  selector: 'app-explore-dashboard',
  imports: [PageComponent, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Explore" description="Every widget in the catalog, with the metadata dashboards build from.">
      <div class="mb-6 flex flex-wrap gap-2">
        @for (option of filters; track option.id) {
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
            [class]="
              filter() === option.id
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            "
            [attr.aria-pressed]="filter() === option.id"
            (click)="filter.set(option.id)">
            {{ option.label }}
          </button>
        }
      </div>

      @if (visible().length === 0) {
        <p class="rounded-2xl border border-dashed border-outline-variant py-16 text-center text-sm text-on-surface-variant">
          No widgets are grouped under this filter yet.
        </p>
      } @else {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          @for (widget of visible(); track widget.id) {
            <div [class]="widget.defaultCols >= 12 ? 'lg:col-span-12' : 'lg:col-span-6'">
              <div class="mb-2 flex items-baseline gap-2">
                <h3 class="text-sm font-semibold text-on-surface">{{ widget.name }}</h3>
                <code class="rounded bg-surface-container-highest px-1.5 py-0.5 text-[11px] text-on-surface-variant">
                  {{ widget.id }}
                </code>
              </div>
              <p class="mb-3 text-xs text-on-surface-variant">{{ widget.description }}</p>
              <ng-container *ngComponentOutlet="widget.component" />
            </div>
          }
        </div>
      }
    </app-page>
  `
})
export class ExploreDashboardComponent {
  protected readonly filters = FILTERS;
  protected readonly filter = signal<Filter>('all');

  protected readonly visible = computed(() => {
    const active = this.filter();
    if (active === 'all') return [...WIDGET_REGISTRY];
    return WIDGET_REGISTRY.filter((w) => w.groups.includes(active));
  });
}

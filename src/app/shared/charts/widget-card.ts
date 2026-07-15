import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Titled surface card used to frame charts, stats, and lists on dashboards.
 * Projects an optional [actions] slot in the header and arbitrary body content.
 */
@Component({
  selector: 'app-widget-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex h-full flex-col rounded-2xl border border-outline-variant bg-surface p-5">
      @if (title() || subtitle()) {
        <header class="mb-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            @if (title()) {
              <h3 class="truncate text-sm font-semibold text-on-surface">{{ title() }}</h3>
            }
            @if (subtitle()) {
              <p class="mt-0.5 truncate text-xs text-on-surface-variant">{{ subtitle() }}</p>
            }
          </div>
          <div class="shrink-0"><ng-content select="[actions]" /></div>
        </header>
      }
      <div class="min-h-0 flex-1"><ng-content /></div>
    </section>
  `
})
export class WidgetCardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
}

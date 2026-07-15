import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Consistent page container: constrains width, applies standard padding, and
 * renders an optional title/description header with an actions slot.
 *
 * Usage:
 *   <app-page title="Invoices" description="Manage billing documents">
 *     <ng-container actions><button matButton="filled">New</button></ng-container>
 *     ...content...
 *   </app-page>
 */
@Component({
  selector: 'app-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      @if (title() || description()) {
        <header class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            @if (title()) {
              <h1 class="text-2xl font-semibold tracking-tight text-on-surface">{{ title() }}</h1>
            }
            @if (description()) {
              <p class="mt-1 text-sm text-on-surface-variant">{{ description() }}</p>
            }
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <ng-content select="[actions]" />
          </div>
        </header>
      }
      <ng-content />
    </div>
  `
})
export class PageComponent {
  readonly title = input<string>();
  readonly description = input<string>();
}

import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';

/**
 * Presentational step indicator for multi-step flows (create-account, onboarding).
 * Purely a header: the owning component keeps the step state and renders the body.
 */
@Component({
  selector: 'app-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ol class="flex items-center gap-2" [attr.aria-label]="ariaLabel()">
      @for (step of steps(); track step; let i = $index, last = $last) {
        <li class="flex items-center gap-2" [class.flex-1]="!last">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors"
            [class]="circleClass(i)"
            [attr.aria-current]="i === current() ? 'step' : null">
            @if (i < current()) {
              <iconify-icon icon="solar:check-read-linear" width="16" height="16"></iconify-icon>
            } @else {
              {{ i + 1 }}
            }
          </span>
          <span
            class="hidden whitespace-nowrap text-sm font-medium sm:block"
            [class]="i <= current() ? 'text-on-surface' : 'text-on-surface-variant'">
            {{ step }}
          </span>
          @if (!last) {
            <span class="h-px flex-1 rounded" [class]="i < current() ? 'bg-primary' : 'bg-outline-variant'"></span>
          }
        </li>
      }
    </ol>
  `
})
export class StepperComponent {
  readonly steps = input.required<readonly string[]>();
  /** Zero-based index of the active step. */
  readonly current = input.required<number>();
  readonly ariaLabel = input('Progress');

  protected circleClass(index: number): string {
    const current = this.current();
    if (index < current) return 'border-primary bg-primary text-on-primary';
    if (index === current) return 'border-primary text-primary';
    return 'border-outline-variant text-on-surface-variant';
  }
}

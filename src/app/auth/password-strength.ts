import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';

/** A single password requirement: shown in the checklist and used to score strength. */
export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Upper and lower case letters', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: 'At least one number', test: (v) => /\d/.test(v) },
  { label: 'At least one symbol', test: (v) => /[^A-Za-z0-9]/.test(v) }
];

/** How many rules the value satisfies, 0–4. */
export function passwordScore(value: string): number {
  return PASSWORD_RULES.filter((rule) => rule.test(value)).length;
}

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const BAR_CLASSES = ['bg-outline-variant', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500'];
const TEXT_CLASSES = [
  'text-on-surface-variant',
  'text-red-700 dark:text-red-400',
  'text-orange-600 dark:text-orange-400',
  'text-amber-600 dark:text-amber-400',
  'text-green-700 dark:text-green-400'
];

/** Four-segment strength bar plus an optional live requirement checklist. */
@Component({
  selector: 'app-password-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="mb-3">
      <div class="flex items-center gap-3">
        <div class="flex flex-1 gap-1">
          @for (i of segments; track i) {
            <span
              class="h-1 flex-1 rounded-full transition-colors"
              [class]="i <= score() ? barClass() : 'bg-outline-variant'"></span>
          }
        </div>
        <span class="shrink-0 text-xs font-medium" [class]="textClass()" aria-live="polite">{{ label() }}</span>
      </div>

      @if (showChecklist()) {
        <ul class="mt-2.5 grid gap-1">
          @for (rule of rules; track rule.label) {
            @let met = rule.test(value());
            <li
              class="flex items-center gap-1.5 text-xs"
              [class]="met ? 'text-green-700 dark:text-green-400' : 'text-on-surface-variant'">
              <iconify-icon
                [icon]="met ? 'solar:check-circle-bold' : 'solar:close-circle-linear'"
                width="14"
                height="14"></iconify-icon>
              {{ rule.label }}
            </li>
          }
        </ul>
      }
    </div>
  `
})
export class PasswordMeterComponent {
  readonly value = input.required<string>();
  readonly showChecklist = input(true);

  protected readonly rules = PASSWORD_RULES;
  protected readonly segments = [1, 2, 3, 4];

  protected readonly score = computed(() => passwordScore(this.value()));
  protected readonly label = computed(() => LABELS[this.score()]);
  protected readonly barClass = computed(() => BAR_CLASSES[this.score()]);
  protected readonly textClass = computed(() => TEXT_CLASSES[this.score()]);
}

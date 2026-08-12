import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { PageComponent } from '../../shell/page/page';
import { HelpCenterService } from './mock-data';

@Component({
  selector: 'app-help-faq',
  imports: [PageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Frequently asked" description="The questions support answers most often.">
      <div class="mb-6 flex flex-wrap gap-1.5">
        <button
          type="button"
          class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
          [class]="chipClass(category() === null)"
          (click)="category.set(null)">
          All
        </button>
        @for (name of categories(); track name) {
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
            [class]="chipClass(category() === name)"
            (click)="category.set(name)">
            {{ name }}
          </button>
        }
      </div>

      <div class="mx-auto max-w-3xl divide-y divide-outline-variant overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        @for (faq of visible(); track faq.id) {
          @let open = expanded() === faq.id;
          <div>
            <h3>
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-container-low"
                [attr.aria-expanded]="open"
                (click)="toggle(faq.id)">
                <span class="text-sm font-medium text-on-surface">{{ faq.question }}</span>
                <iconify-icon
                  icon="solar:alt-arrow-down-linear"
                  width="18"
                  height="18"
                  class="shrink-0 text-on-surface-variant transition-transform"
                  [class.rotate-180]="open"></iconify-icon>
              </button>
            </h3>
            @if (open) {
              <div class="px-5 pb-5">
                <p class="text-sm text-on-surface-variant">{{ faq.answer }}</p>
                <p class="mt-3 text-xs text-on-surface-variant">Filed under {{ faq.category }}</p>
              </div>
            }
          </div>
        } @empty {
          <p class="py-16 text-center text-sm text-on-surface-variant">Nothing in this category yet.</p>
        }
      </div>
    </app-page>
  `
})
export class HelpFaqComponent {
  private readonly store = inject(HelpCenterService);

  protected readonly category = signal<string | null>(null);
  protected readonly expanded = signal<string | null>('f1');

  protected readonly categories = computed(() =>
    [...new Set(this.store.faqs().map((faq) => faq.category))].sort()
  );

  protected readonly visible = computed(() => {
    const category = this.category();
    const all = this.store.faqs();
    return category ? all.filter((faq) => faq.category === category) : all;
  });

  protected chipClass(active: boolean): string {
    return active
      ? 'border-primary bg-primary text-on-primary'
      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low';
  }

  protected toggle(id: string): void {
    this.expanded.update((current) => (current === id ? null : id));
  }
}

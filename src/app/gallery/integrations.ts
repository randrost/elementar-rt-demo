import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../shell/page/page';
import { IntegrationsService } from './mock-data';

@Component({
  selector: 'app-gallery-integrations',
  imports: [PageComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Integrations" description="Connect the tools you already run on.">
      <div class="mb-6 flex flex-wrap items-center gap-1.5">
        @for (option of categories(); track option) {
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
            [class]="
              category() === option
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            "
            [attr.aria-pressed]="category() === option"
            (click)="category.set(option)">
            {{ option }}
          </button>
        }
        <span class="ml-auto text-sm text-on-surface-variant">{{ connectedCount() }} connected</span>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (item of visible(); track item.id) {
          <section
            class="flex flex-col rounded-2xl border p-5 transition-colors"
            [class]="item.connected ? 'border-primary bg-surface' : 'border-outline-variant bg-surface'">
            <div class="flex items-start gap-3">
              <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-container-highest">
                <iconify-icon [icon]="item.icon" width="24" height="24"></iconify-icon>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-on-surface">{{ item.name }}</p>
                <p class="text-xs text-on-surface-variant">{{ item.category }}</p>
              </div>
              @if (item.connected) {
                <span class="shrink-0 rounded-full bg-green-container px-2 py-0.5 text-[11px] font-medium text-on-green-container">
                  Connected
                </span>
              }
            </div>

            <p class="mt-3 flex-1 text-sm text-on-surface-variant">{{ item.blurb }}</p>

            <div class="mt-4 flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="item.connected"
                [attr.aria-label]="item.name"
                class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                [class]="item.connected ? 'bg-primary' : 'bg-surface-container-highest'"
                (click)="store.toggle(item.id)">
                <span
                  class="absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]"
                  [style.left.px]="item.connected ? 22 : 2"></span>
              </button>

              <button matButton type="button" [disabled]="!item.connected">Configure</button>
            </div>
          </section>
        }
      </div>
    </app-page>
  `
})
export class GalleryIntegrationsComponent {
  protected readonly store = inject(IntegrationsService);

  protected readonly category = signal('All');

  protected readonly categories = computed(() => [
    'All',
    ...new Set(this.store.integrations().map((item) => item.category))
  ]);

  protected readonly visible = computed(() => {
    const category = this.category();
    const all = this.store.integrations();
    return category === 'All' ? all : all.filter((item) => item.category === category);
  });

  protected readonly connectedCount = computed(
    () => this.store.integrations().filter((item) => item.connected).length
  );
}

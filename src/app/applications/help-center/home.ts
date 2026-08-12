import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageComponent } from '../../shell/page/page';
import { HelpCenterService } from './mock-data';

@Component({
  selector: 'app-help-home',
  imports: [PageComponent, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page>
      <!-- Search hero -->
      <section class="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-on-primary">
        <div class="relative z-10 mx-auto max-w-xl">
          <h1 class="text-3xl font-semibold">How can we help?</h1>
          <p class="mt-2 text-on-primary/80">Search the guides, or browse by topic below.</p>

          <div class="relative mt-8">
            <iconify-icon
              icon="solar:magnifer-linear"
              width="20"
              height="20"
              class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"></iconify-icon>
            <input
              type="search"
              [(ngModel)]="query"
              placeholder="Search for an answer…"
              aria-label="Search help articles"
              class="w-full rounded-2xl bg-surface py-3.5 pl-12 pr-4 text-on-surface outline-none" />
          </div>
        </div>

        <span class="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-on-primary/10 blur-2xl"></span>
        <span class="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-on-primary/10 blur-2xl"></span>
      </section>

      @if (query().trim()) {
        <section class="mt-8">
          <h2 class="mb-3 text-sm font-medium text-on-surface-variant">
            {{ results().length }} result{{ results().length === 1 ? '' : 's' }} for "{{ query() }}"
          </h2>
          <ul class="flex flex-col gap-2">
            @for (item of results(); track item.id) {
              <li class="rounded-2xl border border-outline-variant bg-surface p-4">
                <p class="text-sm font-medium text-on-surface">{{ item.question }}</p>
                <p class="mt-1 text-sm text-on-surface-variant">{{ item.answer }}</p>
              </li>
            } @empty {
              <li class="rounded-2xl border border-dashed border-outline-variant py-12 text-center text-sm text-on-surface-variant">
                Nothing matched. Try fewer words, or
                <a routerLink="/applications/help-center/support" class="font-medium text-primary hover:underline">open a ticket</a>.
              </li>
            }
          </ul>
        </section>
      } @else {
        <section class="mt-10">
          <h2 class="mb-4 text-lg font-semibold text-on-surface">Browse by topic</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (category of store.categories(); track category.id) {
              <a
                routerLink="/applications/help-center/guides"
                class="flex flex-col rounded-2xl border border-outline-variant bg-surface p-5 transition-colors hover:bg-surface-container-low">
                <span class="grid size-11 place-items-center rounded-xl bg-primary-container text-on-primary-container">
                  <iconify-icon [icon]="category.icon" width="24" height="24"></iconify-icon>
                </span>
                <span class="mt-4 text-sm font-semibold text-on-surface">{{ category.title }}</span>
                <span class="mt-1 text-sm text-on-surface-variant">{{ category.description }}</span>
                <span class="mt-3 text-xs text-on-surface-variant">{{ category.articles }} articles</span>
              </a>
            }
          </div>
        </section>

        <section class="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center">
          <span class="grid size-12 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
            <iconify-icon icon="solar:chat-round-dots-bold-duotone" width="26" height="26"></iconify-icon>
          </span>
          <div>
            <h2 class="text-base font-semibold text-on-surface">Still stuck?</h2>
            <p class="mt-1 text-sm text-on-surface-variant">
              Support replies within one business day, faster on paid plans.
            </p>
          </div>
          <a
            routerLink="/applications/help-center/support"
            class="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary hover:opacity-90">
            Contact support
          </a>
        </section>
      }
    </app-page>
  `
})
export class HelpHomeComponent {
  protected readonly store = inject(HelpCenterService);
  protected readonly query = signal('');

  protected readonly results = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) return [];
    return this.store
      .faqs()
      .filter(
        (faq) =>
          faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term)
      );
  });
}

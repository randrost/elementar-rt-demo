import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { PostsService } from './mock-data';

type Kind = 'categories' | 'topics';

/** Serves both `/posts/categories` and `/posts/topics` — the CRUD is identical. */
@Component({
  selector: 'app-taxonomy-page',
  imports: [PageComponent, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="heading()" [description]="subheading()">
      <div class="flex flex-col gap-6 lg:flex-row">
        <!-- Add form -->
        <aside class="w-full shrink-0 lg:w-80">
          <div class="rounded-2xl border border-outline-variant bg-surface p-5">
            <h2 class="text-sm font-semibold text-on-surface">Add {{ singular() }}</h2>

            <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="tax-name">Name</label>
            <input
              id="tax-name"
              [(ngModel)]="name"
              [placeholder]="kind() === 'categories' ? 'Engineering' : 'Performance'"
              class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />

            <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="tax-desc">Description</label>
            <textarea
              id="tax-desc"
              rows="3"
              [(ngModel)]="description"
              class="mt-1.5 w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"></textarea>

            <button matButton="filled" type="button" class="mt-4 w-full" [disabled]="!name().trim()" (click)="add()">
              Add {{ singular() }}
            </button>
          </div>
        </aside>

        <!-- List -->
        <div class="min-w-0 flex-1">
          <div class="overflow-hidden rounded-2xl border border-outline-variant bg-surface">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-outline-variant bg-surface-container-low text-left text-xs uppercase tracking-wide text-on-surface-variant">
                  <th class="px-5 py-3 font-medium">Name</th>
                  <th class="px-5 py-3 font-medium">Slug</th>
                  <th class="px-5 py-3 text-right font-medium">Posts</th>
                  <th class="w-14 px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.id) {
                  <tr class="border-b border-outline-variant last:border-0">
                    <td class="px-5 py-3.5">
                      <p class="font-medium text-on-surface">{{ item.name }}</p>
                      <p class="text-xs text-on-surface-variant">{{ item.description }}</p>
                    </td>
                    <td class="px-5 py-3.5 text-on-surface-variant">{{ item.slug }}</td>
                    <td class="px-5 py-3.5 text-right tabular-nums text-on-surface-variant">{{ item.count }}</td>
                    <td class="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        class="grid size-8 place-items-center rounded-lg text-on-surface-variant hover:text-red-600 dark:hover:text-red-400"
                        (click)="remove(item.id)"
                        [attr.aria-label]="'Delete ' + item.name">
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="16" height="16"></iconify-icon>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-5 py-16 text-center text-sm text-on-surface-variant">
                      Nothing here yet.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </app-page>
  `
})
export class TaxonomyPageComponent {
  private readonly store = inject(PostsService);

  protected readonly kind = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['kind'] as Kind) ?? 'categories')),
    { initialValue: 'categories' as Kind }
  );

  protected readonly name = signal('');
  protected readonly description = signal('');

  protected readonly items = computed(() =>
    this.kind() === 'categories' ? this.store.categories() : this.store.topics()
  );

  protected readonly heading = computed(() => (this.kind() === 'categories' ? 'Categories' : 'Topics'));
  protected readonly singular = computed(() => (this.kind() === 'categories' ? 'category' : 'topic'));
  protected readonly subheading = computed(() =>
    this.kind() === 'categories'
      ? 'One category per post. Counts come from the posts themselves.'
      : 'Posts can carry several topics. Counts come from the posts themselves.'
  );

  protected add(): void {
    const name = this.name().trim();
    if (!name) return;
    const description = this.description().trim();
    if (this.kind() === 'categories') this.store.addCategory(name, description);
    else this.store.addTopic(name, description);
    this.name.set('');
    this.description.set('');
  }

  protected remove(id: string): void {
    if (this.kind() === 'categories') this.store.removeCategory(id);
    else this.store.removeTopic(id);
  }
}

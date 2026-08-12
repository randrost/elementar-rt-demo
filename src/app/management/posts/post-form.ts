import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { MarkdownEditorComponent } from './markdown-editor';
import { Post, POST_STATUS, PostStatus, PostsService, slugify } from './mock-data';

const STATUSES = Object.keys(POST_STATUS) as PostStatus[];

@Component({
  selector: 'app-post-form',
  imports: [PageComponent, RouterLink, FormsModule, MatButtonModule, MarkdownEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="heading()" description="Write in markdown; the editor round-trips it.">
      <ng-container actions>
        <a matButton routerLink="/management/posts/list">Cancel</a>
        <button matButton="filled" type="button" [disabled]="!title().trim()" (click)="save()">Save post</button>
      </ng-container>

      <div class="flex flex-col gap-6 lg:flex-row">
        <div class="min-w-0 flex-1">
          <input
            [ngModel]="title()"
            (ngModelChange)="onTitle($event)"
            placeholder="Post title"
            aria-label="Post title"
            class="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-lg font-semibold text-on-surface outline-none focus:border-primary" />

          <div class="mt-4">
            <app-markdown-editor [value]="initialBody" (valueChange)="body.set($event)" />
          </div>
        </div>

        <aside class="w-full shrink-0 lg:w-80" aria-label="Post settings">
          <div class="sticky top-6 flex flex-col gap-4">
            <section class="rounded-2xl border border-outline-variant bg-surface p-5">
              <h2 class="text-sm font-semibold text-on-surface">Publishing</h2>

              <span class="mt-4 block text-xs font-medium text-on-surface-variant">Status</span>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                @for (option of statuses; track option) {
                  <button
                    type="button"
                    class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                    [class]="chip(status() === option)"
                    [attr.aria-pressed]="status() === option"
                    (click)="status.set(option)">
                    {{ statusLabel(option) }}
                  </button>
                }
              </div>

              <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="post-slug">Slug</label>
              <input
                id="post-slug"
                [ngModel]="slug()"
                (ngModelChange)="slug.set($event); slugEdited = true"
                class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />

              <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="post-excerpt">Excerpt</label>
              <textarea
                id="post-excerpt"
                rows="3"
                [ngModel]="excerpt()"
                (ngModelChange)="excerpt.set($event)"
                class="mt-1.5 w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"></textarea>
            </section>

            <section class="rounded-2xl border border-outline-variant bg-surface p-5">
              <h2 class="text-sm font-semibold text-on-surface">Taxonomy</h2>

              <span class="mt-4 block text-xs font-medium text-on-surface-variant">Category</span>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                @for (item of store.categories(); track item.id) {
                  <button
                    type="button"
                    class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                    [class]="chip(category() === item.name)"
                    (click)="category.set(item.name)">
                    {{ item.name }}
                  </button>
                }
              </div>

              <span class="mt-4 block text-xs font-medium text-on-surface-variant">Topics</span>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                @for (item of store.topics(); track item.id) {
                  <button
                    type="button"
                    class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                    [class]="chip(topics().includes(item.name))"
                    [attr.aria-pressed]="topics().includes(item.name)"
                    (click)="toggleTopic(item.name)">
                    {{ item.name }}
                  </button>
                }
              </div>
            </section>
          </div>
        </aside>
      </div>
    </app-page>
  `
})
export class PostFormComponent {
  protected readonly store = inject(PostsService);
  private readonly router = inject(Router);

  protected readonly statuses = STATUSES;

  /** Route snapshot, not a signal input: the draft is seeded in field initializers. */
  private readonly routeId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly existing = this.store.byId(this.routeId);
  private readonly source: Post = this.existing ?? this.store.draft();

  protected readonly initialBody = this.source.body;

  protected readonly title = signal(this.source.title);
  protected readonly slug = signal(this.source.slug);
  protected readonly excerpt = signal(this.source.excerpt);
  protected readonly body = signal(this.source.body);
  protected readonly status = signal<PostStatus>(this.source.status);
  protected readonly category = signal(this.source.category);
  protected readonly topics = signal<readonly string[]>(this.source.topics);

  protected slugEdited = !!this.existing;

  protected readonly heading = computed(() =>
    this.existing ? `Edit: ${this.source.title}` : 'New post'
  );

  protected chip(active: boolean): string {
    return active
      ? 'border-primary bg-primary text-on-primary'
      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low';
  }

  protected statusLabel(status: PostStatus): string {
    return POST_STATUS[status].label;
  }

  protected onTitle(value: string): void {
    this.title.set(value);
    if (!this.slugEdited) this.slug.set(slugify(value));
  }

  protected toggleTopic(name: string): void {
    this.topics.update((list) =>
      list.includes(name) ? list.filter((topic) => topic !== name) : [...list, name]
    );
  }

  protected save(): void {
    const title = this.title().trim();
    if (!title) return;

    const words = this.body().trim().split(/\s+/).length;
    this.store.save({
      ...this.source,
      title,
      slug: this.slug().trim() || slugify(title),
      excerpt: this.excerpt().trim(),
      body: this.body(),
      status: this.status(),
      category: this.category(),
      topics: [...this.topics()],
      readMins: Math.max(1, Math.round(words / 200))
    });

    this.router.navigate(['/management/posts/details', this.source.id]);
  }
}

import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageComponent } from '../shell/page/page';
import { AvatarService } from '../core/avatar.service';
import { PostsService } from '../management/posts/mock-data';

const COVERS = [
  'from-indigo-500 to-sky-400',
  'from-violet-500 to-pink-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-red-400',
  'from-cyan-500 to-blue-400'
];

/** The public-facing reading view of the posts the management area edits. */
@Component({
  selector: 'app-content-posts',
  imports: [PageComponent, RouterLink, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Posts" description="Published writing, as a reader sees it.">
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <div class="relative max-w-xs flex-1">
          <iconify-icon
            icon="solar:magnifer-linear"
            width="18"
            height="18"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"></iconify-icon>
          <input
            type="search"
            [(ngModel)]="query"
            placeholder="Search posts…"
            aria-label="Search posts"
            class="w-full rounded-xl border border-outline-variant bg-surface py-2 pl-10 pr-3 text-sm outline-none focus:border-primary" />
        </div>

        <div class="flex flex-wrap gap-1.5">
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
        </div>
      </div>

      @if (visible().length === 0) {
        <p class="rounded-2xl border border-dashed border-outline-variant py-16 text-center text-sm text-on-surface-variant">
          Nothing published matches that.
        </p>
      } @else {
        <!-- Lead -->
        @let lead = visible()[0];
        <a
          [routerLink]="['/management/posts/details', lead.id]"
          class="group grid gap-6 overflow-hidden rounded-2xl border border-outline-variant bg-surface transition-colors hover:bg-surface-container-low lg:grid-cols-2">
          <span class="h-56 bg-gradient-to-br lg:h-full" [class]="cover(0)"></span>
          <span class="flex flex-col justify-center p-6 lg:pr-10">
            <span class="flex items-center gap-2">
              <span class="rounded-full bg-primary-container px-2.5 py-1 text-xs font-medium text-on-primary-container">
                {{ lead.category }}
              </span>
              <span class="text-xs text-on-surface-variant">{{ lead.readMins }} min read</span>
            </span>
            <span class="mt-3 block text-2xl font-semibold tracking-tight text-on-surface">{{ lead.title }}</span>
            <span class="mt-2 block text-sm text-on-surface-variant">{{ lead.excerpt }}</span>
            <span class="mt-5 flex items-center gap-2.5">
              <img [src]="avatar(lead.authorSeed)" alt="" class="size-8 rounded-full" />
              <span class="text-xs text-on-surface-variant">
                {{ lead.authorName }} · {{ lead.date | date: 'mediumDate' }}
              </span>
            </span>
          </span>
        </a>

        <!-- Rest -->
        <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (post of rest(); track post.id; let i = $index) {
            <a
              [routerLink]="['/management/posts/details', post.id]"
              class="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface transition-colors hover:bg-surface-container-low">
              <span class="h-32 bg-gradient-to-br" [class]="cover(i + 1)"></span>
              <span class="flex flex-1 flex-col p-5">
                <span class="flex items-center gap-2">
                  <span class="rounded-full bg-surface-container-highest px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
                    {{ post.category }}
                  </span>
                  <span class="text-xs text-on-surface-variant">{{ post.readMins }} min</span>
                </span>
                <span class="mt-3 block text-base font-semibold text-on-surface">{{ post.title }}</span>
                <span class="mt-1.5 block flex-1 text-sm text-on-surface-variant">{{ post.excerpt }}</span>
                <span class="mt-4 flex items-center gap-2.5 border-t border-outline-variant pt-4">
                  <img [src]="avatar(post.authorSeed)" alt="" class="size-7 rounded-full" />
                  <span class="text-xs text-on-surface-variant">
                    {{ post.authorName }} · {{ post.date | date: 'MMM d' }}
                  </span>
                </span>
              </span>
            </a>
          }
        </div>
      }
    </app-page>
  `
})
export class ContentPostsComponent {
  private readonly store = inject(PostsService);
  private readonly avatars = inject(AvatarService);

  protected readonly query = signal('');
  protected readonly category = signal('All');

  /** Only published posts are public. */
  private readonly published = computed(() =>
    this.store.posts().filter((post) => post.status === 'published')
  );

  protected readonly categories = computed(() => [
    'All',
    ...new Set(this.published().map((post) => post.category))
  ]);

  protected readonly visible = computed(() => {
    const term = this.query().trim().toLowerCase();
    const category = this.category();
    return this.published().filter((post) => {
      if (category !== 'All' && post.category !== category) return false;
      if (!term) return true;
      return post.title.toLowerCase().includes(term) || post.excerpt.toLowerCase().includes(term);
    });
  });

  protected readonly rest = computed(() => this.visible().slice(1));

  protected cover(index: number): string {
    return COVERS[index % COVERS.length];
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }
}

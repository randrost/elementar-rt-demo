import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { marked } from 'marked';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { POST_STATUS, PostsService } from './mock-data';

@Component({
  selector: 'app-post-details',
  imports: [PageComponent, RouterLink, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (post(); as item) {
      <app-page>
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <a
            routerLink="/management/posts/list"
            class="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface">
            <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
            All posts
          </a>
          <a matButton="filled" [routerLink]="['/management/posts/edit', item.id]">Edit post</a>
        </div>

        <article class="mx-auto max-w-3xl">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-primary-container px-2.5 py-1 text-xs font-medium text-on-primary-container">
              {{ item.category }}
            </span>
            <span class="text-xs text-on-surface-variant">{{ statusLabel() }}</span>
          </div>

          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-on-surface">{{ item.title }}</h1>
          <p class="mt-3 text-base text-on-surface-variant">{{ item.excerpt }}</p>

          <div class="mt-6 flex items-center gap-3 border-y border-outline-variant py-4">
            <img [src]="avatar(item.authorSeed)" alt="" class="size-10 rounded-full" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-on-surface">{{ item.authorName }}</p>
              <p class="text-xs text-on-surface-variant">
                {{ item.date | date: 'mediumDate' }} · {{ item.readMins }} min read
              </p>
            </div>
          </div>

          <!-- Rendered from the post's markdown. -->
          <div class="prose prose-sm mt-8 max-w-none dark:prose-invert" [innerHTML]="rendered()"></div>

          @if (item.topics.length) {
            <div class="mt-10 flex flex-wrap items-center gap-2 border-t border-outline-variant pt-6">
              <span class="text-xs text-on-surface-variant">Topics</span>
              @for (topic of item.topics; track topic) {
                <span class="rounded-full bg-surface-container-highest px-2.5 py-1 text-xs text-on-surface-variant">
                  {{ topic }}
                </span>
              }
            </div>
          }
        </article>
      </app-page>
    } @else {
      <app-page title="Post not found">
        <div class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-outline-variant py-20 text-center">
          <p class="text-sm text-on-surface-variant">That post does not exist.</p>
          <a matButton="filled" routerLink="/management/posts/list">Back to posts</a>
        </div>
      </app-page>
    }
  `
})
export class PostDetailsComponent {
  private readonly store = inject(PostsService);
  private readonly avatars = inject(AvatarService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly id = input<string>('');

  protected readonly post = computed(() => this.store.byId(this.id()) ?? null);

  protected readonly statusLabel = computed(() => {
    const post = this.post();
    return post ? POST_STATUS[post.status].label : '';
  });

  /**
   * `marked` output is bypassed into innerHTML. That is safe here because the
   * markdown is authored in-app rather than fetched from anywhere untrusted; if
   * posts ever came from a remote source this would need sanitising first.
   */
  protected readonly rendered = computed(() => {
    const post = this.post();
    if (!post) return '';
    const html = marked.parse(post.body, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }
}

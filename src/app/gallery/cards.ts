import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../shell/page/page';
import { AvatarService } from '../core/avatar.service';
import { GalleryUser, GalleryUsersService, USER_STATUS } from './mock-data';

const TONE_CLASSES: Record<string, string> = {
  success: 'bg-green-container text-on-green-container',
  info: 'bg-blue-container text-on-blue-container',
  error: 'bg-red-container text-on-red-container',
  warning: 'bg-orange-container text-on-orange-container',
  neutral: 'bg-surface-container-highest text-on-surface-variant'
};

@Component({
  selector: 'app-gallery-cards',
  imports: [PageComponent, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (variant() === 'general') {
      <app-page title="Cards" description="Reference layouts for the card patterns used across the app.">
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <!-- Stat -->
          <section class="rounded-2xl border border-outline-variant bg-surface p-5">
            <p class="text-xs uppercase tracking-wide text-on-surface-variant">Stat</p>
            <div class="mt-4 flex items-start justify-between gap-3">
              <div>
                <p class="text-xs text-on-surface-variant">Monthly revenue</p>
                <p class="mt-1 text-3xl font-semibold tabular-nums text-on-surface">$112,480</p>
                <p class="mt-1 flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                  <iconify-icon icon="solar:alt-arrow-up-linear" width="14" height="14"></iconify-icon>
                  +12.5% vs last month
                </p>
              </div>
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary-container">
                <iconify-icon icon="solar:dollar-minimalistic-bold-duotone" width="22" height="22"></iconify-icon>
              </span>
            </div>
          </section>

          <!-- Media -->
          <section class="overflow-hidden rounded-2xl border border-outline-variant bg-surface">
            <div class="h-32 bg-gradient-to-br from-indigo-500 to-sky-400"></div>
            <div class="p-5">
              <p class="text-xs uppercase tracking-wide text-on-surface-variant">Media</p>
              <h2 class="mt-2 text-base font-semibold text-on-surface">Design system 2.0</h2>
              <p class="mt-1.5 text-sm text-on-surface-variant">
                Token overhaul, dark mode parity, and a documented component API.
              </p>
              <div class="mt-4 flex gap-2">
                <button matButton="filled" type="button">Open</button>
                <button matButton type="button">Share</button>
              </div>
            </div>
          </section>

          <!-- List -->
          <section class="rounded-2xl border border-outline-variant bg-surface p-5">
            <p class="text-xs uppercase tracking-wide text-on-surface-variant">List</p>
            <h2 class="mt-2 text-base font-semibold text-on-surface">Recent activity</h2>
            <ul class="mt-4 flex flex-col divide-y divide-outline-variant">
              @for (item of activity; track item.text) {
                <li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container-highest text-on-surface-variant">
                    <iconify-icon [icon]="item.icon" width="16" height="16"></iconify-icon>
                  </span>
                  <span class="min-w-0 flex-1 truncate text-sm text-on-surface">{{ item.text }}</span>
                  <span class="shrink-0 text-xs text-on-surface-variant">{{ item.when }}</span>
                </li>
              }
            </ul>
          </section>

          <!-- Progress -->
          <section class="rounded-2xl border border-outline-variant bg-surface p-5">
            <p class="text-xs uppercase tracking-wide text-on-surface-variant">Progress</p>
            <h2 class="mt-2 text-base font-semibold text-on-surface">Storage</h2>
            <p class="mt-1 text-sm text-on-surface-variant">184 GB of 256 GB used</p>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-highest">
              <div class="h-full rounded-full bg-primary" style="width: 72%"></div>
            </div>
            <div class="mt-4 flex flex-col gap-2">
              @for (row of storage; track row.label) {
                <div class="flex items-center gap-2 text-xs">
                  <span class="size-2.5 rounded-full" [class]="row.chip"></span>
                  <span class="flex-1 text-on-surface-variant">{{ row.label }}</span>
                  <span class="tabular-nums text-on-surface">{{ row.value }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Callout -->
          <section class="rounded-2xl border border-primary bg-primary-container p-5 text-on-primary-container">
            <p class="text-xs uppercase tracking-wide opacity-90">Callout</p>
            <h2 class="mt-2 text-base font-semibold">You are on the Team plan</h2>
            <p class="mt-1.5 text-sm">
              Business adds SSO, audit log export, and an uptime SLA.
            </p>
            <button matButton="filled" type="button" class="!mt-4">Compare plans</button>
          </section>

          <!-- Empty -->
          <section class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant p-8 text-center">
            <iconify-icon icon="solar:inbox-linear" width="36" height="36" class="text-on-surface-variant"></iconify-icon>
            <div>
              <p class="text-sm font-medium text-on-surface">No results</p>
              <p class="mt-1 text-xs text-on-surface-variant">Try a different filter, or clear the search.</p>
            </div>
            <button matButton="outlined" type="button">Clear filters</button>
          </section>
        </div>
      </app-page>
    } @else {
      <app-page title="User cards" description="Person-shaped cards: directory, compact row, and profile.">
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          @for (user of users(); track user.id) {
            <article class="flex flex-col rounded-2xl border border-outline-variant bg-surface p-5">
              <div class="flex items-start gap-3">
                <img [src]="avatar(user.avatarSeed)" alt="" class="size-12 shrink-0 rounded-full" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-on-surface">{{ user.name }}</p>
                  <p class="truncate text-xs text-on-surface-variant">{{ user.email }}</p>
                </div>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" [class]="statusClass(user)">
                  {{ status(user).label }}
                </span>
              </div>

              <dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt class="text-on-surface-variant">Role</dt>
                  <dd class="mt-0.5 text-on-surface">{{ user.role }}</dd>
                </div>
                <div>
                  <dt class="text-on-surface-variant">Team</dt>
                  <dd class="mt-0.5 text-on-surface">{{ user.team }}</dd>
                </div>
                <div>
                  <dt class="text-on-surface-variant">Projects</dt>
                  <dd class="mt-0.5 tabular-nums text-on-surface">{{ user.projects }}</dd>
                </div>
                <div>
                  <dt class="text-on-surface-variant">Last seen</dt>
                  <dd class="mt-0.5 text-on-surface">{{ user.lastSeen | date: 'MMM d' }}</dd>
                </div>
              </dl>

              <div class="mt-4 flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
                <div class="flex items-center gap-0.5 text-amber-500">
                  @for (star of stars; track star) {
                    <iconify-icon
                      [icon]="star <= user.rating ? 'solar:star-bold' : 'solar:star-linear'"
                      width="14"
                      height="14"></iconify-icon>
                  }
                </div>
                <div class="flex gap-1">
                  <button matIconButton type="button" [attr.aria-label]="'Email ' + user.name">
                    <iconify-icon icon="solar:letter-linear" width="17" height="17"></iconify-icon>
                  </button>
                  <button matIconButton type="button" [attr.aria-label]="'Message ' + user.name">
                    <iconify-icon icon="solar:chat-round-dots-linear" width="17" height="17"></iconify-icon>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      </app-page>
    }
  `
})
export class GalleryCardsComponent {
  private readonly store = inject(GalleryUsersService);
  private readonly avatars = inject(AvatarService);

  protected readonly users = this.store.users;
  protected readonly stars = [1, 2, 3, 4, 5];

  protected readonly variant = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['variant'] as 'general' | 'users') ?? 'general')),
    { initialValue: 'general' as const }
  );

  protected readonly activity = [
    { icon: 'solar:check-circle-linear', text: 'Merged widget registry', when: '2h' },
    { icon: 'solar:chat-round-dots-linear', text: 'Commented on audit', when: '5h' },
    { icon: 'solar:document-add-linear', text: 'Published dark mode post', when: '1d' }
  ];

  protected readonly storage = [
    { label: 'Documents', value: '82 GB', chip: 'bg-indigo-500' },
    { label: 'Media', value: '74 GB', chip: 'bg-green-500' },
    { label: 'Backups', value: '28 GB', chip: 'bg-amber-500' }
  ];

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected status(user: GalleryUser) {
    return USER_STATUS[user.status];
  }

  protected statusClass(user: GalleryUser): string {
    return TONE_CLASSES[USER_STATUS[user.status].tone];
  }
}

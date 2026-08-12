import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../shell/page/page';
import { AvatarService } from '../core/avatar.service';
import { AccountService, NOTIFICATION_META, NotificationKind } from './mock-data';

type Filter = 'all' | 'unread' | NotificationKind;

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'mention', label: 'Mentions' },
  { id: 'assignment', label: 'Assignments' },
  { id: 'comment', label: 'Comments' },
  { id: 'billing', label: 'Billing' },
  { id: 'system', label: 'System' }
];

@Component({
  selector: 'app-account-notifications',
  imports: [PageComponent, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Notifications" description="Everything that happened while you were away.">
      <ng-container actions>
        <button matButton="outlined" type="button" [disabled]="unread() === 0" (click)="store.markAllRead()">
          Mark all read
        </button>
      </ng-container>

      <div class="mb-5 flex flex-wrap gap-1.5">
        @for (option of filters; track option.id) {
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
            [class]="
              filter() === option.id
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            "
            [attr.aria-pressed]="filter() === option.id"
            (click)="filter.set(option.id)">
            {{ option.label }}
            @if (option.id === 'unread' && unread() > 0) {
              <span class="ml-1 tabular-nums">({{ unread() }})</span>
            }
          </button>
        }
      </div>

      <div class="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-outline-variant bg-surface">
        <ul class="divide-y divide-outline-variant">
          @for (item of visible(); track item.id) {
            <li
              class="flex items-start gap-3 p-4 transition-colors"
              [class.bg-surface-container-low]="!item.read">
              <span class="relative shrink-0">
                <img [src]="avatar(item.actorSeed)" alt="" class="size-10 rounded-full" />
                <span
                  class="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-surface"
                  [class]="meta(item.kind).classes">
                  <iconify-icon [icon]="meta(item.kind).icon" width="11" height="11"></iconify-icon>
                </span>
              </span>

              <div class="min-w-0 flex-1">
                <p class="text-sm text-on-surface-variant">
                  <span class="font-medium text-on-surface">{{ item.actorName }}</span>
                  {{ item.text }}
                  <span class="font-medium text-on-surface">{{ item.target }}</span>
                </p>
                <p class="mt-0.5 text-xs text-on-surface-variant">{{ item.at | date: 'MMM d, HH:mm' }}</p>
              </div>

              <button
                type="button"
                class="grid size-8 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                (click)="store.toggleRead(item.id)"
                [attr.aria-label]="item.read ? 'Mark unread' : 'Mark read'">
                <iconify-icon
                  [icon]="item.read ? 'solar:letter-linear' : 'solar:letter-opened-linear'"
                  width="16"
                  height="16"></iconify-icon>
              </button>
            </li>
          } @empty {
            <li class="px-4 py-16 text-center text-sm text-on-surface-variant">Nothing here.</li>
          }
        </ul>
      </div>
    </app-page>
  `
})
export class AccountNotificationsComponent {
  protected readonly store = inject(AccountService);
  private readonly avatars = inject(AvatarService);

  protected readonly filters = FILTERS;
  protected readonly filter = signal<Filter>('all');

  protected readonly unread = computed(
    () => this.store.notifications().filter((item) => !item.read).length
  );

  protected readonly visible = computed(() => {
    const filter = this.filter();
    const all = this.store.notifications();
    if (filter === 'all') return all;
    if (filter === 'unread') return all.filter((item) => !item.read);
    return all.filter((item) => item.kind === filter);
  });

  protected meta(kind: NotificationKind) {
    return NOTIFICATION_META[kind];
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }
}

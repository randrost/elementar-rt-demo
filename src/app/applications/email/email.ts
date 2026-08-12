import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { EmailMsg, EmailService, FOLDERS, LABELS, MailFolder } from './mock-data';

@Component({
  selector: 'app-email',
  imports: [PageComponent, RouterLink, FormsModule, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="heading()" [description]="subheading()">
      <ng-container actions>
        <button matButton="filled" type="button" (click)="openCompose()">
          <iconify-icon icon="solar:pen-new-square-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
          Compose
        </button>
      </ng-container>

      <div class="flex h-[calc(100vh-13rem)] min-h-[34rem] gap-4">
        <!-- Folder rail -->
        <nav class="hidden w-52 shrink-0 flex-col rounded-2xl border border-outline-variant bg-surface p-3 lg:flex" aria-label="Mail folders">
          @for (folder of folders; track folder.id) {
            <a
              [routerLink]="['/applications/email', folder.id]"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              [class]="
                activeFolder() === folder.id && !activeLabel()
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              ">
              <iconify-icon [icon]="folder.icon" width="18" height="18"></iconify-icon>
              {{ folder.label }}
              @if (unread(folder.id) > 0) {
                <span class="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[11px] tabular-nums text-on-primary">
                  {{ unread(folder.id) }}
                </span>
              }
            </a>
          }

          <p class="mb-2 mt-5 px-3 text-xs font-medium uppercase tracking-wide text-on-surface-variant">Labels</p>
          @for (label of labels; track label.id) {
            <a
              [routerLink]="['/applications/email/label', label.id]"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              [class]="
                activeLabel() === label.id
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              ">
              <span class="size-2.5 rounded-full" [class]="label.classes"></span>
              {{ label.label }}
            </a>
          }
        </nav>

        <!-- Message list -->
        <div
          class="flex w-full flex-col rounded-2xl border border-outline-variant bg-surface md:w-96 md:shrink-0"
          [class.hidden]="opened() && narrowShowsReader()"
          [class.md:flex]="true">
          <div class="border-b border-outline-variant p-3">
            <div class="relative">
              <iconify-icon
                icon="solar:magnifer-linear"
                width="18"
                height="18"
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"></iconify-icon>
              <input
                type="search"
                [(ngModel)]="query"
                placeholder="Search mail…"
                aria-label="Search mail"
                class="w-full rounded-xl border border-outline-variant bg-surface py-2 pl-10 pr-3 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <ul class="flex-1 overflow-y-auto">
            @for (message of visible(); track message.id) {
              <li class="border-b border-outline-variant last:border-0">
                <button
                  type="button"
                  class="flex w-full gap-3 p-3 text-left transition-colors"
                  [class]="opened()?.id === message.id ? 'bg-surface-container' : 'hover:bg-surface-container-low'"
                  (click)="openMessage(message)">
                  <img [src]="avatar(message.from.avatarSeed)" alt="" class="size-9 shrink-0 rounded-full" />

                  <span class="min-w-0 flex-1">
                    <span class="flex items-baseline gap-2">
                      <span
                        class="min-w-0 flex-1 truncate text-sm"
                        [class]="message.read ? 'text-on-surface-variant' : 'font-semibold text-on-surface'">
                        {{ message.from.name }}
                      </span>
                      <span class="shrink-0 text-[11px] text-on-surface-variant">{{ message.date | date: 'MMM d' }}</span>
                    </span>

                    <span
                      class="mt-0.5 block truncate text-sm"
                      [class]="message.read ? 'text-on-surface-variant' : 'font-medium text-on-surface'">
                      {{ message.subject }}
                    </span>
                    <span class="mt-0.5 block truncate text-xs text-on-surface-variant">{{ message.snippet }}</span>

                    <span class="mt-1.5 flex items-center gap-1.5">
                      @if (!message.read) {
                        <span class="size-1.5 rounded-full bg-primary"></span>
                      }
                      @if (message.starred) {
                        <iconify-icon icon="solar:star-bold" width="12" height="12" class="text-amber-500"></iconify-icon>
                      }
                      @if (message.hasAttachment) {
                        <iconify-icon icon="solar:paperclip-linear" width="12" height="12" class="text-on-surface-variant"></iconify-icon>
                      }
                      @for (label of message.labels; track label) {
                        <span class="rounded px-1.5 py-0.5 text-[10px] font-medium" [class]="labelClasses(label)">
                          {{ label }}
                        </span>
                      }
                    </span>
                  </span>
                </button>
              </li>
            } @empty {
              <li class="px-4 py-16 text-center text-sm text-on-surface-variant">Nothing here.</li>
            }
          </ul>
        </div>

        <!-- Reading pane -->
        @if (opened(); as message) {
          <article class="flex w-full flex-col overflow-y-auto rounded-2xl border border-outline-variant bg-surface">
            <header class="border-b border-outline-variant p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <h2 class="text-lg font-semibold text-on-surface">{{ message.subject }}</h2>
                <div class="flex items-center gap-1">
                  <button
                    matIconButton
                    type="button"
                    (click)="store.toggleStar(message.id)"
                    [attr.aria-label]="message.starred ? 'Unstar' : 'Star'">
                    <iconify-icon
                      [icon]="message.starred ? 'solar:star-bold' : 'solar:star-linear'"
                      width="19"
                      height="19"
                      [class]="message.starred ? 'text-amber-500' : ''"></iconify-icon>
                  </button>
                  <button matIconButton type="button" (click)="trash(message)" aria-label="Move to trash">
                    <iconify-icon icon="solar:trash-bin-trash-linear" width="19" height="19"></iconify-icon>
                  </button>
                  <button matButton type="button" class="md:!hidden" (click)="narrowShowsReader.set(false)">Back</button>
                </div>
              </div>

              <div class="mt-4 flex items-center gap-3">
                <img [src]="avatar(message.from.avatarSeed)" alt="" class="size-10 rounded-full" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-on-surface">{{ message.from.name }}</p>
                  <p class="truncate text-xs text-on-surface-variant">{{ message.from.email }}</p>
                </div>
                <span class="ml-auto shrink-0 text-xs text-on-surface-variant">
                  {{ message.date | date: 'medium' }}
                </span>
              </div>
            </header>

            <div class="flex-1 p-5">
              <p class="whitespace-pre-line text-sm leading-relaxed text-on-surface">{{ message.body }}</p>

              @if (message.hasAttachment) {
                <div class="mt-6 flex w-fit items-center gap-3 rounded-xl border border-outline-variant p-3">
                  <span class="grid size-10 place-items-center rounded-lg bg-surface-container-highest">
                    <iconify-icon icon="solar:file-text-bold-duotone" width="20" height="20" class="text-red-500"></iconify-icon>
                  </span>
                  <div>
                    <p class="text-sm font-medium text-on-surface">attachment.pdf</p>
                    <p class="text-xs text-on-surface-variant">248 KB</p>
                  </div>
                </div>
              }
            </div>

            <footer class="border-t border-outline-variant p-5">
              <button matButton="outlined" type="button" (click)="reply(message)">
                <iconify-icon icon="solar:reply-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
                Reply
              </button>
            </footer>
          </article>
        } @else {
          <div class="hidden w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant text-center md:flex">
            <iconify-icon icon="solar:letter-bold-duotone" width="44" height="44" class="text-primary"></iconify-icon>
            <p class="text-sm text-on-surface-variant">Pick a message to read it.</p>
          </div>
        }
      </div>
    </app-page>

    <!-- Compose -->
    @if (composeOpen()) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Compose message">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="composeOpen.set(false)" aria-label="Close"></button>

        <div class="relative flex w-full max-w-2xl flex-col rounded-2xl border border-outline-variant bg-surface shadow-2xl">
          <header class="flex items-center justify-between border-b border-outline-variant px-5 py-3.5">
            <h2 class="text-base font-semibold text-on-surface">New message</h2>
            <button
              type="button"
              class="grid size-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              (click)="composeOpen.set(false)"
              aria-label="Close">
              <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
            </button>
          </header>

          <div class="flex flex-col gap-px bg-outline-variant">
            <input
              [(ngModel)]="composeTo"
              placeholder="To"
              aria-label="Recipient"
              class="bg-surface px-5 py-3 text-sm outline-none focus:bg-surface-container-low" />
            <input
              [(ngModel)]="composeSubject"
              placeholder="Subject"
              aria-label="Subject"
              class="bg-surface px-5 py-3 text-sm outline-none focus:bg-surface-container-low" />
            <textarea
              [(ngModel)]="composeBody"
              rows="9"
              placeholder="Write your message…"
              aria-label="Message body"
              class="resize-none bg-surface px-5 py-3 text-sm outline-none focus:bg-surface-container-low"></textarea>
          </div>

          <footer class="flex items-center justify-end gap-2 px-5 py-3.5">
            <button matButton type="button" (click)="composeOpen.set(false)">Discard</button>
            <button matButton="filled" type="button" [disabled]="!composeTo().trim()" (click)="send()">Send</button>
          </footer>
        </div>
      </div>
    }
  `
})
export class EmailComponent {
  protected readonly store = inject(EmailService);
  private readonly avatars = inject(AvatarService);
  private readonly route = inject(ActivatedRoute);

  protected readonly folders = FOLDERS;
  protected readonly labels = LABELS;

  /** Folder and label both come from the URL, so the rail links are plain routerLinks. */
  private readonly routeState = toSignal(
    combineLatest([this.route.paramMap, this.route.data]).pipe(
      map(([params, data]) => ({
        folder: (data['folder'] as MailFolder | undefined) ?? 'inbox',
        label: params.get('label')
      }))
    ),
    { initialValue: { folder: 'inbox' as MailFolder, label: null as string | null } }
  );

  protected readonly activeFolder = computed(() => this.routeState().folder);
  protected readonly activeLabel = computed(() => this.routeState().label);

  protected readonly query = signal('');
  private readonly openedId = signal<string | null>(null);
  protected readonly narrowShowsReader = signal(false);

  protected readonly composeOpen = signal(false);
  protected readonly composeTo = signal('');
  protected readonly composeSubject = signal('');
  protected readonly composeBody = signal('');

  private readonly source = computed(() => {
    // Touch the message list so folder/label views react to sends and moves.
    this.store.messages();
    const label = this.activeLabel();
    return label ? this.store.withLabel(label) : this.store.inFolder(this.activeFolder());
  });

  protected readonly visible = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) return this.source();
    return this.source().filter(
      (message) =>
        message.subject.toLowerCase().includes(term) ||
        message.from.name.toLowerCase().includes(term) ||
        message.body.toLowerCase().includes(term)
    );
  });

  protected readonly opened = computed(
    () => this.visible().find((message) => message.id === this.openedId()) ?? null
  );

  protected readonly heading = computed(() => {
    const label = this.activeLabel();
    if (label) return LABELS.find((l) => l.id === label)?.label ?? 'Label';
    return FOLDERS.find((f) => f.id === this.activeFolder())?.label ?? 'Mail';
  });

  protected readonly subheading = computed(() => {
    const count = this.visible().length;
    return `${count} message${count === 1 ? '' : 's'}`;
  });

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected unread(folder: MailFolder): number {
    this.store.messages();
    return this.store.unreadCount(folder);
  }

  protected labelClasses(id: string): string {
    return LABELS.find((label) => label.id === id)?.classes ?? 'bg-surface-container-highest text-on-surface-variant';
  }

  protected openMessage(message: EmailMsg): void {
    this.openedId.set(message.id);
    this.narrowShowsReader.set(true);
    if (!message.read) this.store.markRead(message.id);
  }

  protected trash(message: EmailMsg): void {
    this.store.moveToTrash(message.id);
    this.openedId.set(null);
    this.narrowShowsReader.set(false);
  }

  protected openCompose(): void {
    this.composeTo.set('');
    this.composeSubject.set('');
    this.composeBody.set('');
    this.composeOpen.set(true);
  }

  protected reply(message: EmailMsg): void {
    this.composeTo.set(message.from.email);
    this.composeSubject.set(`Re: ${message.subject}`);
    this.composeBody.set('');
    this.composeOpen.set(true);
  }

  protected send(): void {
    const to = this.composeTo().trim();
    if (!to) return;
    this.store.send(to, this.composeSubject().trim(), this.composeBody().trim());
    this.composeOpen.set(false);
  }
}

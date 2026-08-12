import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { format, isSameDay, isToday, isYesterday, parseISO } from 'date-fns';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { ChatMessage, Conversation, MessengerService, QUICK_EMOJI } from './mock-data';

interface ThreadEntry {
  /** A day separator, or a message bubble. */
  kind: 'separator' | 'message';
  key: string;
  label?: string;
  message?: ChatMessage;
  /** True when the previous bubble came from the same side — tightens spacing. */
  grouped?: boolean;
}

function dayLabel(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMM d');
}

@Component({
  selector: 'app-messenger',
  imports: [PageComponent, FormsModule, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Messenger" description="Conversations with your team.">
      <div class="flex h-[calc(100vh-13rem)] min-h-[34rem] gap-4">
        <!-- Conversation list -->
        <div
          class="flex w-full flex-col rounded-2xl border border-outline-variant bg-surface lg:w-80 lg:shrink-0"
          [class.hidden]="narrowShowsThread()"
          [class.lg:flex]="true">
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
                placeholder="Search conversations…"
                aria-label="Search conversations"
                class="w-full rounded-xl border border-outline-variant bg-surface py-2 pl-10 pr-3 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <ul class="flex-1 overflow-y-auto p-2">
            @for (conversation of filtered(); track conversation.id) {
              <li>
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors"
                  [class]="
                    activeId() === conversation.id ? 'bg-surface-container' : 'hover:bg-surface-container-low'
                  "
                  (click)="openConversation(conversation)">
                  <span class="relative shrink-0">
                    <img [src]="avatar(conversation.avatarSeed)" alt="" class="size-10 rounded-full" />
                    @if (conversation.online) {
                      <span class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-green-500"></span>
                    }
                  </span>

                  <span class="min-w-0 flex-1">
                    <span class="flex items-baseline gap-2">
                      <span class="min-w-0 flex-1 truncate text-sm font-medium text-on-surface">
                        {{ conversation.name }}
                      </span>
                      @if (preview(conversation.id); as last) {
                        <span class="shrink-0 text-[11px] text-on-surface-variant">
                          {{ last.sentAt | date: 'HH:mm' }}
                        </span>
                      }
                    </span>
                    <span class="mt-0.5 flex items-center gap-2">
                      <span class="min-w-0 flex-1 truncate text-xs text-on-surface-variant">
                        @if (conversation.typing) {
                          <span class="text-primary">typing…</span>
                        } @else if (preview(conversation.id); as last) {
                          {{ last.outgoing ? 'You: ' : '' }}{{ last.body }}
                        }
                      </span>
                      @if (conversation.unread > 0) {
                        <span class="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[11px] tabular-nums text-on-primary">
                          {{ conversation.unread }}
                        </span>
                      }
                    </span>
                  </span>
                </button>
              </li>
            } @empty {
              <li class="px-3 py-12 text-center text-sm text-on-surface-variant">No conversations match.</li>
            }
          </ul>
        </div>

        <!-- Thread -->
        @if (active(); as conversation) {
          <div
            class="flex w-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface"
            [class.hidden]="!narrowShowsThread()"
            [class.lg:flex]="true">
            <header class="flex items-center gap-3 border-b border-outline-variant p-4">
              <button
                type="button"
                class="grid size-9 place-items-center rounded-lg text-on-surface-variant hover:text-on-surface lg:hidden"
                (click)="narrowShowsThread.set(false)"
                aria-label="Back to conversations">
                <iconify-icon icon="solar:alt-arrow-left-linear" width="20" height="20"></iconify-icon>
              </button>

              <span class="relative shrink-0">
                <img [src]="avatar(conversation.avatarSeed)" alt="" class="size-10 rounded-full" />
                @if (conversation.online) {
                  <span class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-green-500"></span>
                }
              </span>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-on-surface">{{ conversation.name }}</p>
                <p class="truncate text-xs text-on-surface-variant">
                  {{ conversation.online ? 'Online' : conversation.role }}
                </p>
              </div>

              <button matIconButton type="button" aria-label="Conversation details">
                <iconify-icon icon="solar:menu-dots-bold" width="18" height="18"></iconify-icon>
              </button>
            </header>

            <div #scroller class="flex-1 space-y-1 overflow-y-auto p-4" tabindex="0">
              @for (entry of entries(); track entry.key) {
                @if (entry.kind === 'separator') {
                  <div class="flex items-center gap-3 py-3">
                    <span class="h-px flex-1 bg-outline-variant"></span>
                    <span class="text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">
                      {{ entry.label }}
                    </span>
                    <span class="h-px flex-1 bg-outline-variant"></span>
                  </div>
                } @else if (entry.message; as message) {
                  <div class="flex" [class.justify-end]="message.outgoing" [class.mt-3]="!entry.grouped">
                    <div class="flex max-w-[75%] flex-col" [class.items-end]="message.outgoing">
                      <div
                        class="rounded-2xl px-3.5 py-2.5 text-sm"
                        [class]="
                          message.outgoing
                            ? 'bg-primary text-on-primary rounded-br-md'
                            : 'bg-surface-container text-on-surface rounded-bl-md'
                        ">
                        {{ message.body }}
                      </div>
                      <span class="mt-1 text-[11px] text-on-surface-variant">
                        {{ message.sentAt | date: 'HH:mm' }}
                      </span>
                    </div>
                  </div>
                }
              }

              @if (conversation.typing) {
                <div class="mt-3 flex">
                  <div class="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-container px-3.5 py-3">
                    @for (dot of [0, 1, 2]; track dot) {
                      <span
                        class="size-1.5 animate-bounce rounded-full bg-on-surface-variant"
                        [style.animation-delay.ms]="dot * 150"></span>
                    }
                  </div>
                </div>
              }
            </div>

            <footer class="relative border-t border-outline-variant p-3">
              @if (emojiOpen()) {
                <div class="absolute bottom-full left-3 mb-2 grid grid-cols-8 gap-1 rounded-2xl border border-outline-variant bg-surface p-2 shadow-xl">
                  @for (emoji of quickEmoji; track emoji) {
                    <button
                      type="button"
                      class="grid size-8 place-items-center rounded-lg text-lg transition-colors hover:bg-surface-container"
                      (click)="appendEmoji(emoji)"
                      [attr.aria-label]="'Insert ' + emoji">
                      {{ emoji }}
                    </button>
                  }
                </div>
              }

              <div class="flex items-end gap-2">
                <button
                  type="button"
                  class="grid size-10 shrink-0 place-items-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                  (click)="emojiOpen.set(!emojiOpen())"
                  [attr.aria-expanded]="emojiOpen()"
                  aria-label="Insert emoji">
                  <iconify-icon icon="solar:smile-circle-linear" width="20" height="20"></iconify-icon>
                </button>

                <textarea
                  [(ngModel)]="draft"
                  rows="1"
                  placeholder="Write a message…"
                  aria-label="Message"
                  (keydown.enter)="onEnter($event)"
                  class="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"></textarea>

                <button
                  matIconButton
                  type="button"
                  class="!size-10 shrink-0"
                  [disabled]="!draft().trim()"
                  (click)="send()"
                  aria-label="Send message">
                  <iconify-icon icon="solar:plain-bold" width="20" height="20"></iconify-icon>
                </button>
              </div>
            </footer>
          </div>
        }
      </div>
    </app-page>
  `
})
export class MessengerComponent {
  private readonly store = inject(MessengerService);
  private readonly avatars = inject(AvatarService);

  protected readonly quickEmoji = QUICK_EMOJI;

  protected readonly query = signal('');
  protected readonly draft = signal('');
  protected readonly emojiOpen = signal(false);
  protected readonly narrowShowsThread = signal(false);
  private readonly activeIdSignal = signal<string>('c1');

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly activeId = this.activeIdSignal.asReadonly();

  protected readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    const all = this.store.conversations();
    return term ? all.filter((conversation) => conversation.name.toLowerCase().includes(term)) : all;
  });

  protected readonly active = computed(
    () => this.store.conversations().find((conversation) => conversation.id === this.activeId()) ?? null
  );

  /** Messages interleaved with day separators, ready to render. */
  protected readonly entries = computed<ThreadEntry[]>(() => {
    const thread = this.store.thread(this.activeId());
    const out: ThreadEntry[] = [];
    let previous: ChatMessage | undefined;

    for (const message of thread) {
      const newDay = !previous || !isSameDay(parseISO(previous.sentAt), parseISO(message.sentAt));
      if (newDay) {
        out.push({ kind: 'separator', key: `sep-${message.id}`, label: dayLabel(message.sentAt) });
      }
      out.push({
        kind: 'message',
        key: message.id,
        message,
        grouped: !newDay && previous?.outgoing === message.outgoing
      });
      previous = message;
    }
    return out;
  });

  constructor() {
    afterNextRender(() => this.scrollToBottom());
    // Any change to the rendered thread pins the view to the newest message.
    effect(() => {
      this.entries();
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected preview(conversationId: string): ChatMessage | undefined {
    this.store.messages();
    return this.store.lastMessage(conversationId);
  }

  protected openConversation(conversation: Conversation): void {
    this.activeIdSignal.set(conversation.id);
    this.narrowShowsThread.set(true);
    this.emojiOpen.set(false);
    this.store.markRead(conversation.id);
  }

  protected appendEmoji(emoji: string): void {
    this.draft.update((text) => text + emoji);
    this.emojiOpen.set(false);
  }

  protected onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    // Shift+Enter keeps its usual newline behaviour.
    if (keyboard.shiftKey) return;
    keyboard.preventDefault();
    this.send();
  }

  protected send(): void {
    const body = this.draft().trim();
    if (!body) return;
    this.store.send(this.activeId(), body);
    this.draft.set('');
    this.emojiOpen.set(false);
  }

  private scrollToBottom(): void {
    const element = this.scroller()?.nativeElement;
    if (element) element.scrollTop = element.scrollHeight;
  }
}

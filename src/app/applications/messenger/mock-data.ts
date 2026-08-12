import { Injectable, signal } from '@angular/core';
import { hoursAgo, randomId } from '../../shared/mock/mock';

export interface ChatMessage {
  id: string;
  conversationId: string;
  /** True when the signed-in user sent it. */
  outgoing: boolean;
  body: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatarSeed: string;
  role: string;
  online: boolean;
  unread: number;
  /** Drives the typing indicator in the thread pane. */
  typing: boolean;
}

const CONVERSATIONS: readonly Conversation[] = [
  { id: 'c1', name: 'Ada Lovelace', avatarSeed: 'ada-lovelace', role: 'Chief Engineer', online: true, unread: 2, typing: true },
  { id: 'c2', name: 'Design guild', avatarSeed: 'design-guild', role: '6 members', online: true, unread: 0, typing: false },
  { id: 'c3', name: 'Grace Hopper', avatarSeed: 'grace-hopper', role: 'VP Engineering', online: false, unread: 0, typing: false },
  { id: 'c4', name: 'Marie Curie', avatarSeed: 'marie-curie', role: 'Director', online: true, unread: 1, typing: false },
  { id: 'c5', name: 'Release crew', avatarSeed: 'release-crew', role: '4 members', online: false, unread: 0, typing: false },
  { id: 'c6', name: 'Tim Berners-Lee', avatarSeed: 'tim-berners-lee', role: 'Architect', online: false, unread: 0, typing: false },
  { id: 'c7', name: 'Anita Borg', avatarSeed: 'anita-borg', role: 'Executive Director', online: true, unread: 0, typing: false }
];

/** [outgoing, body, hoursAgo] */
type Line = [boolean, string, number];

const THREADS: Record<string, Line[]> = {
  c1: [
    [false, 'Did you get a chance to look at the widget registry PR?', 30],
    [true, 'Skimmed it this morning. The metadata shape looks right to me.', 29],
    [false, 'Good. My only worry is defaultCols meaning different things in the gallery and the dynamic grid.', 28],
    [true, 'Agreed — I put both on a 12-column basis so they agree. Galleries just treat 12 as full width.', 27],
    [false, 'That is much cleaner. What about widgets that render their own grid, like the KPI tiles?', 5],
    [true, 'Those declare 12 and render their own row inside. The dashboard does not need to know.', 4],
    [false, 'Perfect. I will approve it once CI is green.', 2]
  ],
  c2: [
    [false, 'Reminder: design review moved to Thursday 14:00.', 52],
    [true, 'Noted. I will bring the empty-state copy.', 51],
    [false, 'Please do — lorem in a review always derails the conversation.', 50],
    [true, 'Learned that one the hard way.', 49]
  ],
  c3: [
    [false, 'Performance budget still holding?', 26],
    [true, '289kb transferred on initial load. Charts and the editor are both lazy.', 25],
    [false, 'Under 300. Nice. Re-measure after the widget catalog lands.', 24]
  ],
  c4: [
    [false, 'The tax rate on EU invoices looks wrong in the preview.', 8],
    [true, 'Checking now — it may be the rate defaulting to 20 regardless of region.', 7],
    [false, 'That would explain it. Ping me when you have a fix.', 6]
  ],
  c5: [
    [false, 'Branch freeze is Thursday, tag on Friday.', 74],
    [true, 'Changelog is drafted. I will fill in the last entries once the PRs merge.', 73],
    [false, 'Ping support before the announcement goes out this time.', 72]
  ],
  c6: [
    [false, 'Nothing in the docs explains the theming tokens.', 100],
    [true, 'I can take that page if you handle the screenshots.', 99]
  ],
  c7: [
    [false, 'Three of five testers missed the workspace step entirely.', 46],
    [true, 'Two backed out rather than guess. We should auto-fill the URL.', 45],
    [false, 'Agreed. Making it optional would help too.', 44]
  ]
};

@Injectable({ providedIn: 'root' })
export class MessengerService {
  private readonly conversationList = signal<Conversation[]>([...CONVERSATIONS]);

  private readonly messageList = signal<ChatMessage[]>(
    Object.entries(THREADS).flatMap(([conversationId, lines]) =>
      lines.map(([outgoing, body, hours], i) => ({
        id: `${conversationId}-m${i}`,
        conversationId,
        outgoing,
        body,
        sentAt: hoursAgo(hours)
      }))
    )
  );

  readonly conversations = this.conversationList.asReadonly();
  readonly messages = this.messageList.asReadonly();

  thread(conversationId: string): ChatMessage[] {
    return this.messageList()
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  }

  lastMessage(conversationId: string): ChatMessage | undefined {
    return this.thread(conversationId).at(-1);
  }

  send(conversationId: string, body: string): void {
    this.messageList.update((list) => [
      ...list,
      {
        id: randomId('msg-'),
        conversationId,
        outgoing: true,
        body,
        sentAt: new Date().toISOString()
      }
    ]);
  }

  markRead(conversationId: string): void {
    this.conversationList.update((list) =>
      list.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation
      )
    );
  }
}

export const QUICK_EMOJI = [
  '👍', '🎉', '😄', '🙌', '🔥', '✅', '👀', '💡',
  '🚀', '🐛', '📈', '🙏', '😅', '❤️', '☕', '🧠'
];

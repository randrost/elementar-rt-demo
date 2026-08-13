import { Injectable, signal } from '@angular/core';
import { hoursAgo, randomId, seededRandom } from '../../shared/mock/mock';

export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';

export interface MailParty {
  name: string;
  email: string;
  avatarSeed: string;
}

export interface EmailMsg {
  id: string;
  folder: MailFolder;
  labels: string[];
  from: MailParty;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
}

export const FOLDERS: readonly { id: MailFolder; label: string; icon: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: 'solar:inbox-linear' },
  { id: 'sent', label: 'Sent', icon: 'solar:plain-linear' },
  { id: 'drafts', label: 'Drafts', icon: 'solar:file-text-linear' },
  { id: 'spam', label: 'Spam', icon: 'solar:danger-triangle-linear' },
  { id: 'trash', label: 'Trash', icon: 'solar:trash-bin-trash-linear' }
];

export const LABELS: readonly { id: string; label: string; classes: string }[] = [
  { id: 'work', label: 'Work', classes: 'bg-blue-container text-on-blue-container' },
  { id: 'billing', label: 'Billing', classes: 'bg-green-container text-on-green-container' },
  { id: 'alerts', label: 'Alerts', classes: 'bg-orange-container text-on-orange-container' },
  { id: 'personal', label: 'Personal', classes: 'bg-surface-container-highest text-on-surface-variant' }
];

const PEOPLE: readonly MailParty[] = [
  { name: 'Ada Lovelace', email: 'ada@analytical.co', avatarSeed: 'ada-lovelace' },
  { name: 'Grace Hopper', email: 'grace@compiler.dev', avatarSeed: 'grace-hopper' },
  { name: 'Alan Turing', email: 'alan@bletchley.io', avatarSeed: 'alan-turing' },
  { name: 'Marie Curie', email: 'marie@radium.inst', avatarSeed: 'marie-curie' },
  { name: 'Tim Berners-Lee', email: 'tim@webfoundry.org', avatarSeed: 'tim-berners-lee' },
  { name: 'Radia Perlman', email: 'radia@spanningtree.net', avatarSeed: 'radia-perlman' },
  { name: 'Barbara Liskov', email: 'barbara@substitution.io', avatarSeed: 'barbara-liskov' },
  { name: 'Anita Borg', email: 'anita@systers.org', avatarSeed: 'anita-borg' },
  { name: 'Billing', email: 'billing@elementar-rt.r-tulika.me', avatarSeed: 'billing-bot' },
  { name: 'Status', email: 'status@elementar-rt.r-tulika.me', avatarSeed: 'status-bot' }
];

const THREADS: readonly { subject: string; body: string; labels: string[] }[] = [
  { subject: 'Design review moved to Thursday', body: 'The room was double-booked, so we pushed to Thursday 14:00. Same agenda: empty states, the density toggle, and destructive button colour in dark mode.\n\nBring the latest mockups if you have them.', labels: ['work'] },
  { subject: 'Invoice INV-2451 is ready', body: 'Your invoice for this billing period is attached. Payment is due within 30 days.\n\nIf anything looks wrong, reply to this thread and we will sort it out.', labels: ['billing'] },
  { subject: 'Re: Widget registry approach', body: 'I like keeping the registry as the single source of truth. One thing — can we make defaultCols use a 12-column basis so the dynamic dashboard and the galleries agree?\n\nOtherwise every consumer needs its own translation.', labels: ['work'] },
  { subject: 'Scheduled maintenance on Sunday', body: 'We will be applying a database upgrade on Sunday between 02:00 and 04:00 UTC. Expect brief read-only periods.\n\nNo action needed on your side.', labels: ['alerts'] },
  { subject: 'Onboarding test results', body: 'Three of five testers missed the workspace step. Two of them backed out entirely rather than guess.\n\nSuggest auto-filling the URL from the workspace name and making that field optional.', labels: ['work'] },
  { subject: 'Accessibility audit findings', body: 'Focus rings are missing on the card grid, and muted text over tinted surfaces fails contrast in three places. The drawer traps keyboard focus.\n\nFull list in the shared doc.', labels: ['work'] },
  { subject: 'Your payment method expires soon', body: 'The card ending 4242 expires next month. Update it before the next billing date to avoid an interruption.', labels: ['billing'] },
  { subject: 'Lunch on Friday?', body: 'A few of us are heading to the place with the good noodles around 12:30. Room for one more if you fancy it.', labels: ['personal'] },
  { subject: 'Performance budget check-in', body: 'Initial bundle is at 289kb transferred, so we are inside budget. Charts and the editor are both lazy.\n\nWorth re-measuring once the widget catalog lands.', labels: ['work'] },
  { subject: 'Unusual sign-in blocked', body: 'We blocked a sign-in attempt from an unrecognised device in a new location. If this was you, approve it from Account → Security → Sessions.', labels: ['alerts'] },
  { subject: 'Q3 roadmap draft', body: 'First pass attached. Billing rewrite is the big rock; everything else is sized to fit around it.\n\nComments welcome before Friday.', labels: ['work'] },
  { subject: 'Docs gaps we should close', body: 'Nothing explains the theming tokens, and the screenshots are stale since the sidebar redesign.\n\nI can take the tokens page if someone else does screenshots.', labels: ['work'] }
];

function build(index: number, folder: MailFolder, hours: number): EmailMsg {
  const rnd = seededRandom(index * 13 + 7);
  const thread = THREADS[index % THREADS.length];
  const from = PEOPLE[index % PEOPLE.length];
  return {
    id: `mail-${folder}-${index}`,
    folder,
    labels: thread.labels,
    from,
    subject: thread.subject,
    snippet: thread.body.split('\n')[0].slice(0, 110),
    body: thread.body,
    date: hoursAgo(hours),
    read: folder !== 'inbox' || rnd() > 0.45,
    starred: rnd() > 0.8,
    hasAttachment: rnd() > 0.7
  };
}

function seedFolder(folder: MailFolder, count: number, startHour: number): EmailMsg[] {
  return Array.from({ length: count }, (_, i) => build(i + startHour, folder, i * 7 + startHour));
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly items = signal<EmailMsg[]>([
    ...seedFolder('inbox', 18, 1),
    ...seedFolder('sent', 9, 3),
    ...seedFolder('drafts', 4, 6),
    ...seedFolder('spam', 5, 11),
    ...seedFolder('trash', 4, 17)
  ]);

  readonly messages = this.items.asReadonly();

  inFolder(folder: MailFolder): EmailMsg[] {
    return this.items()
      .filter((message) => message.folder === folder)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  withLabel(label: string): EmailMsg[] {
    return this.items()
      .filter((message) => message.labels.includes(label) && message.folder !== 'trash')
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  unreadCount(folder: MailFolder): number {
    return this.items().filter((message) => message.folder === folder && !message.read).length;
  }

  markRead(id: string, read = true): void {
    this.items.update((list) =>
      list.map((message) => (message.id === id ? { ...message, read } : message))
    );
  }

  toggleStar(id: string): void {
    this.items.update((list) =>
      list.map((message) => (message.id === id ? { ...message, starred: !message.starred } : message))
    );
  }

  moveToTrash(id: string): void {
    this.items.update((list) =>
      list.map((message) => (message.id === id ? { ...message, folder: 'trash' as const } : message))
    );
  }

  send(to: string, subject: string, body: string): void {
    this.items.update((list) => [
      {
        id: randomId('mail-'),
        folder: 'sent',
        labels: [],
        from: { name: 'You', email: to, avatarSeed: 'rostyslav-tulika' },
        subject: subject || '(no subject)',
        snippet: body.split('\n')[0].slice(0, 110),
        body,
        date: new Date().toISOString(),
        read: true,
        starred: false,
        hasAttachment: false
      },
      ...list
    ]);
  }
}

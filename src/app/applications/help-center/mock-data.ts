import { Injectable, signal } from '@angular/core';
import { daysAgo, randomId } from '../../shared/mock/mock';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'pending' | 'solved';

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Guide {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readMins: number;
  updated: string;
  authorSeed: string;
}

export interface Ticket {
  id: string;
  reference: string;
  subject: string;
  requester: string;
  requesterSeed: string;
  priority: TicketPriority;
  status: TicketStatus;
  updated: string;
}

export const TICKET_STATUS: Record<TicketStatus, { label: string; classes: string }> = {
  open: { label: 'Open', classes: 'bg-green-container text-on-green-container' },
  pending: { label: 'Pending', classes: 'bg-orange-container text-on-orange-container' },
  solved: { label: 'Solved', classes: 'bg-surface-container-highest text-on-surface-variant' }
};

export const TICKET_PRIORITY: Record<TicketPriority, { label: string; classes: string }> = {
  low: { label: 'Low', classes: 'bg-surface-container-highest text-on-surface-variant' },
  normal: { label: 'Normal', classes: 'bg-surface-container-highest text-on-surface-variant' },
  high: { label: 'High', classes: 'bg-orange-container text-on-orange-container' },
  urgent: { label: 'Urgent', classes: 'bg-red-container text-on-red-container' }
};

const CATEGORIES: readonly HelpCategory[] = [
  { id: 'getting-started', title: 'Getting started', description: 'Set up your workspace and invite your team.', icon: 'solar:rocket-2-bold-duotone', articles: 12 },
  { id: 'billing', title: 'Billing & plans', description: 'Invoices, payment methods, and changing plan.', icon: 'solar:bill-list-bold-duotone', articles: 9 },
  { id: 'security', title: 'Security', description: 'Two-factor auth, sessions, and access control.', icon: 'solar:shield-keyhole-bold-duotone', articles: 7 },
  { id: 'integrations', title: 'Integrations', description: 'Connect the tools you already run on.', icon: 'solar:plug-circle-bold-duotone', articles: 15 },
  { id: 'data', title: 'Data & exports', description: 'Import, export, and retention.', icon: 'solar:database-bold-duotone', articles: 6 },
  { id: 'troubleshooting', title: 'Troubleshooting', description: 'When something is not behaving.', icon: 'solar:bug-bold-duotone', articles: 11 }
];

const FAQS: readonly FaqItem[] = [
  { id: 'f1', question: 'How do I invite someone to my workspace?', answer: 'Open Contacts, choose Invite, and enter their email. They will get a link that expires after seven days. Invitees join with the Member role; you can change that from Account → Settings once they accept.', category: 'Getting started' },
  { id: 'f2', question: 'Can I change my plan mid-cycle?', answer: 'Yes. Upgrades apply immediately and we charge the prorated difference. Downgrades take effect at the end of the current period, so you keep what you paid for.', category: 'Billing' },
  { id: 'f3', question: 'Where do I turn on two-factor authentication?', answer: 'Account → Settings → Security. You can use an authenticator app or a hardware key. Turning it on signs out every other session.', category: 'Security' },
  { id: 'f4', question: 'How long do you keep deleted data?', answer: 'Deleted records sit in a recoverable state for 30 days, then are purged. Workspace deletion is immediate and cannot be undone.', category: 'Data' },
  { id: 'f5', question: 'Why is my invoice different this month?', answer: 'Usually seat changes. Adding a seat mid-cycle is prorated to the day, so the following invoice reflects both the proration and the new baseline.', category: 'Billing' },
  { id: 'f6', question: 'Do you support single sign-on?', answer: 'SAML and OIDC are available on the Business plan. Configure the provider under Site Settings → General, then enforce it for everyone once you have tested with one account.', category: 'Security' },
  { id: 'f7', question: 'Can I export everything?', answer: 'Yes — Site Settings → Media has a full export that produces a zip of your records as CSV plus any uploaded files. Large workspaces are emailed a link when the export finishes.', category: 'Data' },
  { id: 'f8', question: 'An integration stopped syncing. What now?', answer: 'Check the integration card for an auth error first; expired tokens are the usual cause. Reconnecting re-runs the last 24 hours of sync automatically.', category: 'Integrations' }
];

const GUIDES: readonly Omit<Guide, 'updated'>[] = [
  { id: 'g1', title: 'Building your first dashboard', excerpt: 'Pick widgets from the catalog, arrange them on the grid, and save a layout your team can use.', category: 'Getting started', readMins: 6, authorSeed: 'ada-lovelace' },
  { id: 'g2', title: 'Understanding the widget registry', excerpt: 'How widgets are registered, what the metadata controls, and how to add one of your own.', category: 'Platform', readMins: 9, authorSeed: 'margaret-hamilton' },
  { id: 'g3', title: 'Setting up SSO end to end', excerpt: 'From provider configuration through to enforcing it for the whole workspace, with rollback advice.', category: 'Security', readMins: 12, authorSeed: 'radia-perlman' },
  { id: 'g4', title: 'Invoicing without surprises', excerpt: 'Line items, tax handling, and what actually happens when you change seats mid-cycle.', category: 'Billing', readMins: 7, authorSeed: 'marie-curie' },
  { id: 'g5', title: 'Theming and design tokens', excerpt: 'The token set behind every surface, and how dark mode is derived rather than hand-authored.', category: 'Design', readMins: 8, authorSeed: 'hedy-lamarr' },
  { id: 'g6', title: 'Importing data cleanly', excerpt: 'Column mapping, deduplication, and how to dry-run an import before committing it.', category: 'Data', readMins: 10, authorSeed: 'grace-hopper' }
];

const TICKETS: readonly Omit<Ticket, 'updated'>[] = [
  { id: 't1', reference: 'SUP-1042', subject: 'Export finishes but the download link 404s', requester: 'Katherine Johnson', requesterSeed: 'katherine-johnson', priority: 'high', status: 'open' },
  { id: 't2', reference: 'SUP-1041', subject: 'Cannot remove a payment method', requester: 'Linus Pauling', requesterSeed: 'linus-pauling', priority: 'normal', status: 'pending' },
  { id: 't3', reference: 'SUP-1039', subject: 'SAML login loops back to sign-in', requester: 'Vint Cerf', requesterSeed: 'vint-cerf', priority: 'urgent', status: 'open' },
  { id: 't4', reference: 'SUP-1037', subject: 'Dark mode resets on every reload', requester: 'Alan Kay', requesterSeed: 'alan-kay', priority: 'normal', status: 'solved' },
  { id: 't5', reference: 'SUP-1036', subject: 'Invoice tax rate wrong for EU customers', requester: 'Sophie Wilson', requesterSeed: 'sophie-wilson', priority: 'high', status: 'pending' },
  { id: 't6', reference: 'SUP-1034', subject: 'Feature request: saved table views', requester: 'Donald Knuth', requesterSeed: 'donald-knuth', priority: 'low', status: 'open' },
  { id: 't7', reference: 'SUP-1031', subject: 'Kanban cards lose order after refresh', requester: 'Jean Bartik', requesterSeed: 'jean-bartik', priority: 'normal', status: 'solved' },
  { id: 't8', reference: 'SUP-1029', subject: 'Two-factor codes rejected on one device', requester: 'Anita Borg', requesterSeed: 'anita-borg', priority: 'high', status: 'open' },
  { id: 't9', reference: 'SUP-1027', subject: 'Webhook retries are too aggressive', requester: 'Ken Thompson', requesterSeed: 'ken-thompson', priority: 'low', status: 'pending' },
  { id: 't10', reference: 'SUP-1024', subject: 'Bulk invite fails past 50 addresses', requester: 'Adele Goldberg', requesterSeed: 'adele-goldberg', priority: 'normal', status: 'solved' },
  { id: 't11', reference: 'SUP-1022', subject: 'Chart tooltips clipped inside cards', requester: 'Frances Allen', requesterSeed: 'frances-allen', priority: 'low', status: 'open' },
  { id: 't12', reference: 'SUP-1019', subject: 'Timezone wrong on scheduled reports', requester: 'Chien-Shiung Wu', requesterSeed: 'chien-shiung-wu', priority: 'high', status: 'pending' },
  { id: 't13', reference: 'SUP-1016', subject: 'Deleted project still shows in search', requester: 'Rosalind Franklin', requesterSeed: 'rosalind-franklin', priority: 'normal', status: 'solved' },
  { id: 't14', reference: 'SUP-1013', subject: 'Cannot upload files over 25MB', requester: 'Nikola Tesla', requesterSeed: 'nikola-tesla', priority: 'normal', status: 'open' },
  { id: 't15', reference: 'SUP-1011', subject: 'Sidebar collapse state not remembered', requester: 'Barbara Liskov', requesterSeed: 'barbara-liskov', priority: 'low', status: 'solved' }
];

@Injectable({ providedIn: 'root' })
export class HelpCenterService {
  readonly categories = signal(CATEGORIES).asReadonly();
  readonly faqs = signal(FAQS).asReadonly();
  readonly guides = signal(
    GUIDES.map((guide, i) => ({ ...guide, updated: daysAgo(i * 6 + 2) }))
  ).asReadonly();

  private readonly ticketList = signal<Ticket[]>(
    TICKETS.map((ticket, i) => ({ ...ticket, updated: daysAgo(i + 1) }))
  );
  readonly tickets = this.ticketList.asReadonly();

  /** Highest reference seen so far; new tickets take the next number up. */
  private nextReference = 1043;

  openTicket(subject: string, priority: TicketPriority): void {
    const reference = `SUP-${this.nextReference}`;
    this.nextReference += 1;
    this.ticketList.update((list) => [
      {
        id: randomId('ticket-'),
        reference,
        subject,
        requester: 'You',
        requesterSeed: 'rostyslav-tulika',
        priority,
        status: 'open',
        updated: new Date().toISOString()
      },
      ...list
    ]);
  }
}

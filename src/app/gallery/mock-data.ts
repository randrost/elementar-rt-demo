import { Injectable, signal } from '@angular/core';
import { daysAgo } from '../shared/mock/mock';
import { StatusTone } from '../shared/datatable/datatable.types';

export type UserStatus = 'active' | 'invited' | 'suspended';
export type UserRole = 'Owner' | 'Admin' | 'Editor' | 'Member' | 'Viewer';

export interface GalleryUser {
  id: string;
  name: string;
  email: string;
  avatarSeed: string;
  role: UserRole;
  team: string;
  status: UserStatus;
  location: string;
  lastSeen: string;
  projects: number;
  rating: number;
}

export const USER_STATUS: Record<UserStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  invited: { label: 'Invited', tone: 'info' },
  suspended: { label: 'Suspended', tone: 'error' }
};

const SEED: readonly Omit<GalleryUser, 'id' | 'avatarSeed' | 'lastSeen'>[] = [
  { name: 'Ada Lovelace', email: 'ada@analytical.co', role: 'Owner', team: 'Engineering', status: 'active', location: 'London, UK', projects: 12, rating: 5 },
  { name: 'Grace Hopper', email: 'grace@compiler.dev', role: 'Admin', team: 'Engineering', status: 'active', location: 'Arlington, US', projects: 9, rating: 5 },
  { name: 'Hedy Lamarr', email: 'hedy@spectrum.fm', role: 'Admin', team: 'Design', status: 'active', location: 'Vienna, AT', projects: 7, rating: 4 },
  { name: 'Alan Turing', email: 'alan@bletchley.io', role: 'Editor', team: 'Research', status: 'active', location: 'Milton Keynes, UK', projects: 6, rating: 5 },
  { name: 'Marie Curie', email: 'marie@radium.inst', role: 'Editor', team: 'Finance', status: 'active', location: 'Paris, FR', projects: 8, rating: 4 },
  { name: 'Margaret Hamilton', email: 'margaret@apollo.sw', role: 'Admin', team: 'Engineering', status: 'active', location: 'Cambridge, US', projects: 11, rating: 5 },
  { name: 'Barbara Liskov', email: 'barbara@substitution.io', role: 'Editor', team: 'Engineering', status: 'active', location: 'Boston, US', projects: 5, rating: 4 },
  { name: 'Anita Borg', email: 'anita@systers.org', role: 'Member', team: 'Community', status: 'invited', location: 'Palo Alto, US', projects: 2, rating: 4 },
  { name: 'Radia Perlman', email: 'radia@spanningtree.net', role: 'Member', team: 'Engineering', status: 'active', location: 'Seattle, US', projects: 4, rating: 5 },
  { name: 'Tim Berners-Lee', email: 'tim@webfoundry.org', role: 'Viewer', team: 'Docs', status: 'active', location: 'Geneva, CH', projects: 3, rating: 4 },
  { name: 'Katherine Johnson', email: 'katherine@orbital.space', role: 'Member', team: 'Data', status: 'active', location: 'Hampton, US', projects: 6, rating: 5 },
  { name: 'Sophie Wilson', email: 'sophie@risc.uk', role: 'Member', team: 'Engineering', status: 'suspended', location: 'Cambridge, UK', projects: 1, rating: 3 },
  { name: 'Frances Allen', email: 'frances@optimizer.dev', role: 'Editor', team: 'Engineering', status: 'active', location: 'Yorktown, US', projects: 7, rating: 4 },
  { name: 'Adele Goldberg', email: 'adele@smalltalk.dev', role: 'Member', team: 'Design', status: 'invited', location: 'Menlo Park, US', projects: 2, rating: 4 },
  { name: 'Ken Thompson', email: 'ken@unixworks.dev', role: 'Viewer', team: 'Research', status: 'active', location: 'Murray Hill, US', projects: 3, rating: 5 },
  { name: 'Chien-Shiung Wu', email: 'wu@parity.lab', role: 'Member', team: 'Research', status: 'active', location: 'New York, US', projects: 5, rating: 4 }
];

@Injectable({ providedIn: 'root' })
export class GalleryUsersService {
  readonly users = signal<GalleryUser[]>(
    SEED.map((user, i) => ({
      ...user,
      id: `user-${i + 1}`,
      avatarSeed: user.name.toLowerCase().replace(/\s+/g, '-'),
      lastSeen: daysAgo(i)
    }))
  ).asReadonly();
}

/* ------------------------------------------------------------ selects ----- */

export const COUNTRIES: readonly { code: string; name: string }[] = [
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'jp', name: 'Japan' },
  { code: 'br', name: 'Brazil' },
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
  { code: 'at', name: 'Austria' }
];

export const CURRENCIES: readonly { code: string; name: string; symbol: string }[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' }
];

export const TIMEZONES: readonly string[] = [
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Kyiv',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Australia/Sydney'
];

export const DATE_FORMATS: readonly string[] = [
  'D MMMM YYYY',
  'MMMM D, YYYY',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD'
];

/* ------------------------------------------------------- integrations ---- */

export interface Integration {
  id: string;
  name: string;
  icon: string;
  category: string;
  blurb: string;
  connected: boolean;
}

@Injectable({ providedIn: 'root' })
export class IntegrationsService {
  private readonly items = signal<Integration[]>([
    { id: 'github', name: 'GitHub', icon: 'logos:github-icon', category: 'Development', blurb: 'Link pull requests to tasks and surface deploy status.', connected: true },
    { id: 'slack', name: 'Slack', icon: 'logos:slack-icon', category: 'Communication', blurb: 'Post notifications into the channels your team watches.', connected: true },
    { id: 'figma', name: 'Figma', icon: 'logos:figma', category: 'Design', blurb: 'Embed design files directly in the content editor.', connected: true },
    { id: 'stripe', name: 'Stripe', icon: 'logos:stripe', category: 'Billing', blurb: 'Sync invoices, payments, and subscription state.', connected: false },
    { id: 'google-analytics', name: 'Google Analytics', icon: 'logos:google-analytics', category: 'Analytics', blurb: 'Pull traffic and acquisition into the analytics dashboard.', connected: false },
    { id: 'notion', name: 'Notion', icon: 'logos:notion-icon', category: 'Productivity', blurb: 'Two-way sync for docs and specs.', connected: false },
    { id: 'sentry', name: 'Sentry', icon: 'logos:sentry-icon', category: 'Development', blurb: 'Surface release health next to your deploys.', connected: true },
    { id: 'vercel', name: 'Vercel', icon: 'logos:vercel-icon', category: 'Development', blurb: 'Preview deployments attached to every branch.', connected: false },
    { id: 'mailchimp', name: 'Mailchimp', icon: 'logos:mailchimp', category: 'Marketing', blurb: 'Sync contact lists and campaign results.', connected: false }
  ]);

  readonly integrations = this.items.asReadonly();

  toggle(id: string): void {
    this.items.update((list) =>
      list.map((item) => (item.id === id ? { ...item, connected: !item.connected } : item))
    );
  }
}

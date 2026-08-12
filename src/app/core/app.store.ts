import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { Announcement, AppNotification, Incident } from './models';

const SIDEBAR_COMPACT_KEY = 'ert-sidebar-compact';

interface AppState {
  announcement: Announcement | null;
  incidents: Incident[];
  notifications: AppNotification[];
  sidebarCompact: boolean;
  mobileSidebarOpen: boolean;
}

const seedNotifications: AppNotification[] = [
  { id: 'n1', title: 'New message from Aria', body: 'Hey! Are we still on for the review?', icon: 'solar:chat-round-dots-bold-duotone', time: iso(-8), read: false, kind: 'message' },
  { id: 'n2', title: 'Payment received', body: 'Invoice INV-1043 was paid.', icon: 'solar:card-bold-duotone', time: iso(-40), read: false, kind: 'billing' },
  { id: 'n3', title: 'Deployment succeeded', body: 'Production build v2.3.0 is live.', icon: 'solar:check-circle-bold-duotone', time: iso(-120), read: true, kind: 'success' },
  { id: 'n4', title: 'Marta mentioned you', body: '“…let’s ask @you about the roadmap.”', icon: 'solar:mention-circle-bold-duotone', time: iso(-260), read: true, kind: 'mention' },
  { id: 'n5', title: 'Scheduled maintenance', body: 'Analytics will be briefly unavailable Sunday.', icon: 'solar:danger-triangle-bold-duotone', time: iso(-1440), read: true, kind: 'system' }
];

const initialState: AppState = {
  announcement: {
    id: 'a1',
    message: 'Elementar RT Admin is open-source and MIT licensed.',
    linkLabel: 'View the repo',
    link: 'https://github.com/randrost/elementar-rt-demo'
  },
  incidents: [],
  notifications: seedNotifications,
  sidebarCompact: readCompact(),
  mobileSidebarOpen: false
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    unreadCount: computed(() => store.notifications().filter((n) => !n.read).length),
    hasAnnouncement: computed(() => store.announcement() !== null),
    hasIncidents: computed(() => store.incidents().length > 0)
  })),
  withMethods((store) => ({
    dismissAnnouncement(): void {
      patchState(store, { announcement: null });
    },
    dismissIncident(id: string): void {
      patchState(store, { incidents: store.incidents().filter((i) => i.id !== id) });
    },
    markAllRead(): void {
      patchState(store, { notifications: store.notifications().map((n) => ({ ...n, read: true })) });
    },
    markRead(id: string): void {
      patchState(store, { notifications: store.notifications().map((n) => (n.id === id ? { ...n, read: true } : n)) });
    },
    toggleSidebarCompact(): void {
      const next = !store.sidebarCompact();
      patchState(store, { sidebarCompact: next });
      writeCompact(next);
    },
    setMobileSidebarOpen(open: boolean): void {
      patchState(store, { mobileSidebarOpen: open });
    }
  })),
  withHooks({
    onInit() {
      // Seed a sample non-critical incident to demonstrate the banner.
      // Kept empty by default; product can push incidents at runtime.
    }
  })
);

function iso(minutesAgo: number): string {
  return new Date(Date.now() + minutesAgo * 60_000).toISOString();
}

function readCompact(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_COMPACT_KEY) === '1';
}

function writeCompact(value: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SIDEBAR_COMPACT_KEY, value ? '1' : '0');
}

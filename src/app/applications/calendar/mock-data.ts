import { Injectable, signal } from '@angular/core';
import { randomId } from '../../shared/mock/mock';

export type EventKind = 'meeting' | 'focus' | 'review' | 'personal' | 'holiday';

export interface ScheduleEvent {
  id: string;
  title: string;
  /** ISO strings; `allDay` events use date-only precision. */
  start: string;
  end: string;
  allDay: boolean;
  kind: EventKind;
  location: string;
  notes: string;
}

export const EVENT_KINDS: Record<EventKind, { label: string; color: string; chip: string }> = {
  meeting: { label: 'Meeting', color: '#6366f1', chip: 'bg-indigo-500' },
  focus: { label: 'Focus time', color: '#22c55e', chip: 'bg-green-500' },
  review: { label: 'Review', color: '#f59e0b', chip: 'bg-amber-500' },
  personal: { label: 'Personal', color: '#ec4899', chip: 'bg-pink-500' },
  holiday: { label: 'Holiday', color: '#06b6d4', chip: 'bg-cyan-500' }
};

/** Builds an ISO timestamp `dayOffset` days from today at the given local time. */
function at(dayOffset: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function dayOnly(dayOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

const SEED: readonly Omit<ScheduleEvent, 'id'>[] = [
  { title: 'Design review', start: at(0, 14), end: at(0, 15), allDay: false, kind: 'review', location: 'Room 3 / Meet', notes: 'Empty states, density toggle, destructive colour in dark mode.' },
  { title: 'Standup', start: at(0, 9, 30), end: at(0, 9, 45), allDay: false, kind: 'meeting', location: 'Meet', notes: '' },
  { title: 'Focus: widget registry', start: at(0, 10), end: at(0, 12), allDay: false, kind: 'focus', location: '', notes: 'No meetings. Finish the registry metadata.' },
  { title: 'Standup', start: at(1, 9, 30), end: at(1, 9, 45), allDay: false, kind: 'meeting', location: 'Meet', notes: '' },
  { title: 'Billing sync', start: at(1, 11), end: at(1, 12), allDay: false, kind: 'meeting', location: 'Room 1', notes: 'EU tax rate defect and the ledger migration.' },
  { title: 'Onboarding interviews', start: at(2, 13), end: at(2, 16), allDay: false, kind: 'meeting', location: 'Meet', notes: 'Three sessions, 45 minutes each.' },
  { title: 'Focus: accessibility pass', start: at(3, 9), end: at(3, 12), allDay: false, kind: 'focus', location: '', notes: 'Focus rings, contrast, drawer keyboard trap.' },
  { title: 'Release freeze', start: dayOnly(4), end: dayOnly(5), allDay: true, kind: 'review', location: '', notes: 'Branch freeze. Regression pass, changelog, tag.' },
  { title: 'Dentist', start: at(5, 8, 30), end: at(5, 9, 30), allDay: false, kind: 'personal', location: '', notes: '' },
  { title: 'Quarterly planning', start: at(7, 10), end: at(7, 16), allDay: false, kind: 'meeting', location: 'Room 3', notes: 'Bring the roadmap draft and the perf budget numbers.' },
  { title: 'Company holiday', start: dayOnly(9), end: dayOnly(10), allDay: true, kind: 'holiday', location: '', notes: '' },
  { title: 'Docs sprint', start: at(11, 9), end: at(11, 17), allDay: false, kind: 'focus', location: '', notes: 'Theming tokens page and fresh screenshots.' },
  { title: 'Design guild', start: at(-2, 15), end: at(-2, 16), allDay: false, kind: 'meeting', location: 'Meet', notes: '' },
  { title: 'Perf review', start: at(-4, 11), end: at(-4, 12), allDay: false, kind: 'review', location: 'Room 2', notes: 'Bundle at 289kb transferred.' }
];

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly items = signal<ScheduleEvent[]>(
    SEED.map((event, i) => ({ ...event, id: `event-${i + 1}` }))
  );

  readonly events = this.items.asReadonly();

  byId(id: string): ScheduleEvent | undefined {
    return this.items().find((event) => event.id === id);
  }

  add(event: Omit<ScheduleEvent, 'id'>): string {
    const id = randomId('event-');
    this.items.update((list) => [...list, { ...event, id }]);
    return id;
  }

  update(id: string, patch: Partial<Omit<ScheduleEvent, 'id'>>): void {
    this.items.update((list) =>
      list.map((event) => (event.id === id ? { ...event, ...patch } : event))
    );
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((event) => event.id !== id));
  }
}

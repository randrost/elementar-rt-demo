import { Injectable, signal } from '@angular/core';
import { daysAgo, randomId } from '../../shared/mock/mock';

export type NoteColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'neutral';

export interface Note {
  id: string;
  title: string;
  body: string;
  color: NoteColor;
  tags: string[];
  updated: string;
}

export const NOTE_COLORS: readonly NoteColor[] = ['yellow', 'green', 'blue', 'pink', 'purple', 'neutral'];

/** Card surface per colour. Tuned so text stays readable in both schemes. */
export const NOTE_SURFACE: Record<NoteColor, string> = {
  yellow: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
  green: 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900',
  blue: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-900',
  pink: 'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900',
  purple: 'bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-900',
  neutral: 'bg-surface border-outline-variant'
};

/** Solid swatch used in the colour picker. */
export const NOTE_SWATCH: Record<NoteColor, string> = {
  yellow: 'bg-amber-300',
  green: 'bg-green-300',
  blue: 'bg-sky-300',
  pink: 'bg-pink-300',
  purple: 'bg-violet-300',
  neutral: 'bg-neutral-300'
};

const SEED: readonly Omit<Note, 'id' | 'updated'>[] = [
  { title: 'Release checklist', body: 'Freeze the branch Thursday. Run the full regression pass, update the changelog, then tag. Ping support before the announcement goes out.', color: 'yellow', tags: ['Release'] },
  { title: 'Design review notes', body: 'Empty states need real copy, not lorem. The table density toggle tested well — keep it. Revisit the colour of destructive buttons in dark mode.', color: 'blue', tags: ['Design', 'Review'] },
  { title: 'Onboarding friction', body: 'Three of five testers missed the workspace step entirely. Consider making the URL field auto-fill from the workspace name.', color: 'pink', tags: ['Research'] },
  { title: 'Q3 hiring', body: 'Two backend, one designer. Write the scorecard before the first screen, not after.', color: 'green', tags: ['Team'] },
  { title: 'Perf budget', body: 'Initial bundle under 300kb transferred. Charts and the editor must stay lazy. Re-measure after the widget catalog lands.', color: 'purple', tags: ['Engineering'] },
  { title: 'Customer call — Northwind', body: 'They want per-seat invoicing and a CSV export of the audit log. Neither is scheduled. Follow up with pricing.', color: 'neutral', tags: ['Sales'] },
  { title: 'Docs gaps', body: 'No page explains theming tokens. Screenshot set is stale since the sidebar redesign.', color: 'yellow', tags: ['Docs'] },
  { title: 'Accessibility pass', body: 'Focus rings missing on the card grid. Colour contrast fails on muted text over tinted surfaces. Keyboard traps in the drawer.', color: 'green', tags: ['Design', 'Engineering'] },
  { title: 'Weekly review', body: 'Shipped: dashboards, widget registry. Slipped: email templates. Blocked: nothing.', color: 'blue', tags: ['Team'] },
  { title: 'Idea — saved views', body: 'Let people save a filter set on any datatable and pin it to the sidebar. Would cover most of the "can we get a report for X" requests.', color: 'purple', tags: ['Product'] },
  { title: 'Support themes', body: 'Password reset confusion is the top ticket driver two months running. The email copy is the likely culprit.', color: 'pink', tags: ['Support'] },
  { title: 'Reading list', body: 'Refactoring UI, the Angular signals RFC, and that piece on designing for the empty state.', color: 'neutral', tags: ['Personal'] }
];

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly items = signal<Note[]>(
    SEED.map((note, i) => ({ ...note, id: `note-${i + 1}`, updated: daysAgo(i) }))
  );

  readonly notes = this.items.asReadonly();

  add(note: Pick<Note, 'title' | 'body' | 'color' | 'tags'>): void {
    this.items.update((list) => [
      { ...note, id: randomId('note-'), updated: new Date().toISOString() },
      ...list
    ]);
  }

  update(id: string, patch: Partial<Omit<Note, 'id'>>): void {
    this.items.update((list) =>
      list.map((note) =>
        note.id === id ? { ...note, ...patch, updated: new Date().toISOString() } : note
      )
    );
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((note) => note.id !== id));
  }
}

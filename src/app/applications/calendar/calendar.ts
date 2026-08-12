import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { EventInput } from '@fullcalendar/core';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { CalendarHostDirective, CalendarView } from './calendar-host.directive';
import { EVENT_KINDS, EventKind, ScheduleEvent, ScheduleService } from './mock-data';

const VIEWS: readonly { id: CalendarView; label: string }[] = [
  { id: 'dayGridMonth', label: 'Month' },
  { id: 'timeGridWeek', label: 'Week' },
  { id: 'timeGridDay', label: 'Day' },
  { id: 'listWeek', label: 'List' }
];

const KINDS = Object.keys(EVENT_KINDS) as EventKind[];

/** `datetime-local` wants `YYYY-MM-DDTHH:mm` in local time, not a UTC ISO string. */
function toLocalInput(iso: string, dateOnly = false): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return dateOnly ? day : `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

@Component({
  selector: 'app-calendar',
  imports: [PageComponent, FormsModule, MatButtonModule, CalendarHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    /* FullCalendar ships its own light palette; map its variables onto the app's
       tokens so it follows the theme instead of fighting it. */
    :host ::ng-deep .fc {
      --fc-border-color: var(--color-outline-variant, rgb(0 0 0 / 0.12));
      --fc-page-bg-color: transparent;
      --fc-neutral-bg-color: color-mix(in srgb, currentColor 6%, transparent);
      --fc-today-bg-color: color-mix(in srgb, currentColor 6%, transparent);
      --fc-now-indicator-color: #ef4444;
      font-family: inherit;
    }
    :host ::ng-deep .fc .fc-col-header-cell-cushion,
    :host ::ng-deep .fc .fc-daygrid-day-number,
    :host ::ng-deep .fc .fc-list-day-text,
    :host ::ng-deep .fc .fc-list-day-side-text,
    :host ::ng-deep .fc .fc-timegrid-slot-label-cushion {
      color: inherit;
      text-decoration: none;
      font-size: 0.8125rem;
    }
    :host ::ng-deep .fc .fc-event {
      border: none;
      padding: 1px 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    :host ::ng-deep .fc .fc-list-event:hover td {
      background: color-mix(in srgb, currentColor 6%, transparent);
    }
    /* FullCalendar dims out-of-month day numbers to 0.3 opacity, which lands at
       1.9:1. Enough to still read as "not this month", enough to pass 4.5:1. */
    :host ::ng-deep .fc .fc-day-other .fc-daygrid-day-top {
      opacity: 0.65;
    }
  `,
  template: `
    <app-page title="Calendar" description="Drag to reschedule, click a slot to add, click an event to edit.">
      <ng-container actions>
        <button matButton="filled" type="button" (click)="openNew()">
          <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
          New event
        </button>
      </ng-container>

      <!-- Toolbar -->
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button matButton="outlined" type="button" (click)="host().today()">Today</button>
          <div class="flex items-center">
            <button
              matIconButton
              type="button"
              (click)="host().prev()"
              aria-label="Previous period">
              <iconify-icon icon="solar:alt-arrow-left-linear" width="18" height="18"></iconify-icon>
            </button>
            <button matIconButton type="button" (click)="host().next()" aria-label="Next period">
              <iconify-icon icon="solar:alt-arrow-right-linear" width="18" height="18"></iconify-icon>
            </button>
          </div>
          <h2 class="ml-1 text-base font-semibold text-on-surface">{{ title() }}</h2>
        </div>

        <div class="flex rounded-xl border border-outline-variant p-0.5" role="group" aria-label="Calendar view">
          @for (option of views; track option.id) {
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              [class]="view() === option.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
              [attr.aria-pressed]="view() === option.id"
              (click)="view.set(option.id)">
              {{ option.label }}
            </button>
          }
        </div>
      </div>

      <!-- Legend -->
      <div class="mb-4 flex flex-wrap gap-3">
        @for (kind of kinds; track kind) {
          <span class="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span class="size-2.5 rounded-full" [class]="meta(kind).chip"></span>
            {{ meta(kind).label }}
          </span>
        }
      </div>

      <div class="h-[calc(100vh-19rem)] min-h-[34rem] rounded-2xl border border-outline-variant bg-surface p-4 text-on-surface">
        <div
          [appCalendarHost]="fcEvents()"
          [view]="view()"
          (titleChanged)="title.set($event)"
          (eventOpened)="openExisting($event)"
          (rangeSelected)="openForRange($event)"
          (eventMoved)="moveEvent($event)"
          class="h-full w-full"></div>
      </div>
    </app-page>

    <!-- Create / edit dialog -->
    @if (draft(); as event) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Event">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="close()" aria-label="Close"></button>

        <div class="relative w-full max-w-lg rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
          <h2 class="text-lg font-semibold text-on-surface">{{ editingId() ? 'Edit event' : 'New event' }}</h2>

          <label class="mt-5 block text-xs font-medium text-on-surface-variant" for="event-title">Title</label>
          <input
            id="event-title"
            [(ngModel)]="draftTitle"
            placeholder="What is it?"
            class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-medium text-on-surface-variant" for="event-start">Starts</label>
              <input
                id="event-start"
                [type]="draftAllDay() ? 'date' : 'datetime-local'"
                [(ngModel)]="draftStart"
                class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-xs font-medium text-on-surface-variant" for="event-end">Ends</label>
              <input
                id="event-end"
                [type]="draftAllDay() ? 'date' : 'datetime-local'"
                [(ngModel)]="draftEnd"
                class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <label class="mt-4 flex w-fit items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" [(ngModel)]="draftAllDay" class="size-4 accent-current" />
            All day
          </label>

          <span class="mt-4 block text-xs font-medium text-on-surface-variant">Type</span>
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            @for (kind of kinds; track kind) {
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                [class]="
                  draftKind() === kind
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                "
                [attr.aria-pressed]="draftKind() === kind"
                (click)="draftKind.set(kind)">
                <span class="size-2 rounded-full" [class]="meta(kind).chip"></span>
                {{ meta(kind).label }}
              </button>
            }
          </div>

          <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="event-location">Location</label>
          <input
            id="event-location"
            [(ngModel)]="draftLocation"
            placeholder="Room, link, or blank"
            class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />

          <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="event-notes">Notes</label>
          <textarea
            id="event-notes"
            rows="3"
            [(ngModel)]="draftNotes"
            class="mt-1.5 w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"></textarea>

          <div class="mt-6 flex items-center justify-between gap-2">
            @if (editingId()) {
              <button matButton type="button" class="!text-error" (click)="remove()">Delete</button>
            } @else {
              <span></span>
            }
            <div class="flex items-center gap-2">
              <button matButton type="button" (click)="close()">Cancel</button>
              <button matButton="filled" type="button" [disabled]="!draftTitle().trim()" (click)="save()">Save</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class CalendarComponent {
  private readonly store = inject(ScheduleService);

  protected readonly views = VIEWS;
  protected readonly kinds = KINDS;

  protected readonly host = viewChild.required(CalendarHostDirective);

  protected readonly view = signal<CalendarView>('dayGridMonth');
  protected readonly title = signal('');

  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<Partial<ScheduleEvent> | null>(null);
  protected readonly draftTitle = signal('');
  protected readonly draftStart = signal('');
  protected readonly draftEnd = signal('');
  protected readonly draftAllDay = signal(false);
  protected readonly draftKind = signal<EventKind>('meeting');
  protected readonly draftLocation = signal('');
  protected readonly draftNotes = signal('');

  /** Store events mapped onto FullCalendar's shape. */
  protected readonly fcEvents = computed<EventInput[]>(() =>
    this.store.events().map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: EVENT_KINDS[event.kind].color,
      borderColor: EVENT_KINDS[event.kind].color
    }))
  );

  protected meta(kind: EventKind) {
    return EVENT_KINDS[kind];
  }

  protected openNew(): void {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    this.fill(null, {
      title: '',
      start: now.toISOString(),
      end: end.toISOString(),
      allDay: false,
      kind: 'meeting',
      location: '',
      notes: ''
    });
  }

  protected openForRange(range: { start: string; end: string; allDay: boolean }): void {
    this.fill(null, {
      title: '',
      start: range.start,
      end: range.end,
      allDay: range.allDay,
      kind: 'meeting',
      location: '',
      notes: ''
    });
  }

  protected openExisting(id: string): void {
    const event = this.store.byId(id);
    if (event) this.fill(id, event);
  }

  protected moveEvent(change: { id: string; start: string; end: string; allDay: boolean }): void {
    this.store.update(change.id, { start: change.start, end: change.end, allDay: change.allDay });
  }

  protected save(): void {
    const title = this.draftTitle().trim();
    if (!title) return;

    const allDay = this.draftAllDay();
    const payload = {
      title,
      start: fromLocalInput(this.draftStart()),
      end: fromLocalInput(this.draftEnd()),
      allDay,
      kind: this.draftKind(),
      location: this.draftLocation().trim(),
      notes: this.draftNotes().trim()
    };

    const id = this.editingId();
    if (id) this.store.update(id, payload);
    else this.store.add(payload);
    this.close();
  }

  protected remove(): void {
    const id = this.editingId();
    if (id) this.store.remove(id);
    this.close();
  }

  protected close(): void {
    this.draft.set(null);
    this.editingId.set(null);
  }

  private fill(id: string | null, event: Partial<ScheduleEvent>): void {
    const allDay = event.allDay ?? false;
    this.editingId.set(id);
    this.draftTitle.set(event.title ?? '');
    this.draftStart.set(toLocalInput(event.start ?? new Date().toISOString(), allDay));
    this.draftEnd.set(toLocalInput(event.end ?? new Date().toISOString(), allDay));
    this.draftAllDay.set(allDay);
    this.draftKind.set(event.kind ?? 'meeting');
    this.draftLocation.set(event.location ?? '');
    this.draftNotes.set(event.notes ?? '');
    this.draft.set(event);
  }
}

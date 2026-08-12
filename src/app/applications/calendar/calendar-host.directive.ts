import {
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  output,
  untracked
} from '@angular/core';
import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

/**
 * Drives a FullCalendar instance on the host element.
 *
 * The published `@fullcalendar/angular` wrapper is on 7.x while the plugins only
 * ship 6.x stable, so the two cannot be installed together. Wrapping the core
 * imperatively sidesteps that and matches how this project already hosts
 * ECharts — see `shared/charts/chart-host.directive.ts`.
 */
@Directive({ selector: '[appCalendarHost]' })
export class CalendarHostDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  readonly events = input.required<EventInput[]>({ alias: 'appCalendarHost' });
  readonly view = input<CalendarView>('dayGridMonth');

  /** Emits the clicked event's id. */
  readonly eventOpened = output<string>();
  /** Emits the selected range as ISO strings. */
  readonly rangeSelected = output<{ start: string; end: string; allDay: boolean }>();
  /** Emits after a drag or resize moves an event. */
  readonly eventMoved = output<{ id: string; start: string; end: string; allDay: boolean }>();
  /** Emits the visible range title so the page can render its own toolbar. */
  readonly titleChanged = output<string>();

  private calendar?: Calendar;
  private lastWidth = 0;

  constructor() {
    // FullCalendar attaches its own listeners; keep them out of Angular's zone.
    this.zone.runOutsideAngular(() => {
      this.calendar = new Calendar(this.host.nativeElement, this.baseOptions());
      this.calendar.render();
      this.emitTitle();
    });

    effect(() => {
      const events = this.events();
      const view = this.view();
      untracked(() => this.sync(events, view));
    });

    // FullCalendar measures its column widths once and only re-measures on a
    // window resize. It renders before the shell sidebar has settled, so without
    // this the last day column is cut off until the window is resized.
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width && width !== this.lastWidth) {
        this.lastWidth = width;
        this.zone.runOutsideAngular(() => this.calendar?.updateSize());
      }
    });
    observer.observe(this.host.nativeElement);

    inject(DestroyRef).onDestroy(() => {
      observer.disconnect();
      this.calendar?.destroy();
    });
  }

  today(): void {
    this.calendar?.today();
    this.emitTitle();
  }

  prev(): void {
    this.calendar?.prev();
    this.emitTitle();
  }

  next(): void {
    this.calendar?.next();
    this.emitTitle();
  }

  private sync(events: EventInput[], view: CalendarView): void {
    const calendar = this.calendar;
    if (!calendar) return;

    this.zone.runOutsideAngular(() => {
      if (calendar.view.type !== view) calendar.changeView(view);
      calendar.removeAllEvents();
      for (const event of events) calendar.addEvent(event);
      this.emitTitle();
    });
  }

  private emitTitle(): void {
    const title = this.calendar?.view.title ?? '';
    this.zone.run(() => this.titleChanged.emit(title));
  }

  private baseOptions(): CalendarOptions {
    return {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: this.view(),
      // The page renders its own toolbar so it matches the rest of the shell.
      headerToolbar: false,
      height: '100%',
      firstDay: 1,
      nowIndicator: true,
      // Event fills are chosen for 4.5:1 against this.
      eventTextColor: '#ffffff',
      dayMaxEvents: 3,
      selectable: true,
      editable: true,
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      eventClick: (arg) => {
        arg.jsEvent.preventDefault();
        this.zone.run(() => this.eventOpened.emit(arg.event.id));
      },
      select: (arg) => {
        this.zone.run(() =>
          this.rangeSelected.emit({
            start: arg.start.toISOString(),
            end: arg.end.toISOString(),
            allDay: arg.allDay
          })
        );
        this.calendar?.unselect();
      },
      eventDrop: (arg) => this.emitMoved(arg.event),
      eventResize: (arg) => this.emitMoved(arg.event)
    };
  }

  private emitMoved(event: { id: string; start: Date | null; end: Date | null; allDay: boolean }): void {
    if (!event.start) return;
    const start = event.start;
    // FullCalendar leaves `end` null for zero-length events; fall back to +1h.
    const end = event.end ?? new Date(start.getTime() + 60 * 60 * 1000);
    this.zone.run(() =>
      this.eventMoved.emit({
        id: event.id,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: event.allDay
      })
    );
  }
}

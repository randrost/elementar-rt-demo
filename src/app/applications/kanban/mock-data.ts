import { Injectable, signal } from '@angular/core';
import { daysAgo, randomId } from '../../shared/mock/mock';

export type CardPriority = 'low' | 'medium' | 'high';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  labels: string[];
  assigneeSeed: string;
  due: string;
  priority: CardPriority;
  checklistDone: number;
  checklistTotal: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export const PRIORITY_CLASSES: Record<CardPriority, string> = {
  low: 'bg-surface-container-highest text-on-surface-variant',
  medium: 'bg-orange-container text-on-orange-container',
  high: 'bg-red-container text-on-red-container'
};

let seq = 0;
function card(
  title: string,
  description: string,
  labels: string[],
  assigneeSeed: string,
  dueInDays: number,
  priority: CardPriority,
  checklistDone = 0,
  checklistTotal = 0
): KanbanCard {
  seq += 1;
  return {
    id: `card-${seq}`,
    title,
    description,
    labels,
    assigneeSeed,
    due: daysAgo(-dueInDays),
    priority,
    checklistDone,
    checklistTotal
  };
}

const SEED: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      card('Saved table views', 'Let people pin a filter set to the sidebar.', ['Product'], 'ada-lovelace', 21, 'low', 0, 4),
      card('Audit log export', 'CSV export, requested by two enterprise accounts.', ['Enterprise'], 'grace-hopper', 30, 'medium'),
      card('Theming docs', 'Nothing explains the token set yet.', ['Docs'], 'tim-berners-lee', 14, 'low', 1, 3)
    ]
  },
  {
    id: 'ready',
    title: 'Ready',
    cards: [
      card('Invoice line-item totals', 'Live subtotal, tax, and grand total as rows change.', ['Billing'], 'marie-curie', 7, 'high', 2, 5),
      card('Email compose dialog', 'Attachments can wait; get send working first.', ['Email'], 'alan-turing', 9, 'medium')
    ]
  },
  {
    id: 'in-progress',
    title: 'In progress',
    cards: [
      card('Widget registry', 'Single source of truth for galleries and dashboards.', ['Platform'], 'margaret-hamilton', 3, 'high', 5, 6),
      card('Contacts detail pane', 'Two-pane layout, collapses on mobile.', ['App'], 'barbara-liskov', 4, 'medium', 3, 4)
    ]
  },
  {
    id: 'review',
    title: 'In review',
    cards: [
      card('Dynamic dashboard grid', 'Drag, resize, persist. Watch the resize measurement.', ['Platform'], 'radia-perlman', 1, 'high', 6, 6),
      card('Auth flows', 'Sign-in through to the setup wizard.', ['Auth'], 'hedy-lamarr', 2, 'medium', 7, 7)
    ]
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      card('App shell + navigation', 'Sidebar, header, breadcrumbs, theming.', ['Platform'], 'sophie-wilson', -5, 'medium', 8, 8),
      card('Datatable kit', 'Sorting, paging, selection, cell renderers.', ['Platform'], 'frances-allen', -8, 'high', 9, 9)
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class KanbanService {
  private readonly board = signal<KanbanColumn[]>(SEED);
  readonly columns = this.board.asReadonly();

  /** Replaces the board wholesale — used after a drag rearranges the arrays. */
  setColumns(columns: KanbanColumn[]): void {
    this.board.set(columns);
  }

  addCard(columnId: string, title: string): void {
    this.board.update((columns) =>
      columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: [
                ...column.cards,
                {
                  id: randomId('card-'),
                  title,
                  description: '',
                  labels: [],
                  assigneeSeed: 'ada-lovelace',
                  due: daysAgo(-7),
                  priority: 'medium' as const,
                  checklistDone: 0,
                  checklistTotal: 0
                }
              ]
            }
          : column
      )
    );
  }

  removeCard(cardId: string): void {
    this.board.update((columns) =>
      columns.map((column) => ({ ...column, cards: column.cards.filter((c) => c.id !== cardId) }))
    );
  }

  addColumn(title: string): void {
    this.board.update((columns) => [...columns, { id: randomId('col-'), title, cards: [] }]);
  }

  removeColumn(columnId: string): void {
    this.board.update((columns) => columns.filter((column) => column.id !== columnId));
  }
}

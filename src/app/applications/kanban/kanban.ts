import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { CardPriority, KanbanCard, KanbanService, PRIORITY_CLASSES } from './mock-data';

@Component({
  selector: 'app-kanban',
  imports: [
    PageComponent,
    FormsModule,
    DatePipe,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatButtonModule,
    MatMenuModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    .cdk-drag-preview {
      box-shadow:
        0 10px 30px rgb(0 0 0 / 0.2),
        0 3px 8px rgb(0 0 0 / 0.1);
    }
    .cdk-drag-placeholder {
      opacity: 0.4;
    }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
  template: `
    <app-page title="Kanban" description="Drag cards between columns. Everything is local to this session.">
      <ng-container actions>
        @if (addingColumn()) {
          <div class="flex items-center gap-2">
            <input
              [(ngModel)]="newColumnTitle"
              placeholder="Column name"
              aria-label="New column name"
              class="w-40 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
            <button matButton="filled" type="button" (click)="confirmAddColumn()">Add</button>
            <button matButton type="button" (click)="addingColumn.set(false)">Cancel</button>
          </div>
        } @else {
          <button matButton="outlined" type="button" (click)="addingColumn.set(true)">
            <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
            Add column
          </button>
        }
      </ng-container>

      <div class="-mx-1 overflow-x-auto pb-4">
        <div class="flex min-h-[30rem] items-start gap-4 px-1" cdkDropListGroup>
          @for (column of store.columns(); track column.id) {
            <section class="flex w-72 shrink-0 flex-col rounded-2xl bg-surface-container-low p-3">
              <header class="mb-3 flex items-center gap-2 px-1">
                <h2 class="text-sm font-semibold text-on-surface">{{ column.title }}</h2>
                <span class="rounded-full bg-surface-container-highest px-2 py-0.5 text-xs tabular-nums text-on-surface-variant">
                  {{ column.cards.length }}
                </span>
                <button
                  matIconButton
                  class="!ml-auto"
                  [matMenuTriggerFor]="columnMenu"
                  [attr.aria-label]="'Actions for ' + column.title">
                  <iconify-icon icon="solar:menu-dots-bold" width="18" height="18"></iconify-icon>
                </button>
                <mat-menu #columnMenu="matMenu">
                  <button mat-menu-item (click)="startAddCard(column.id)">Add a card</button>
                  <button mat-menu-item class="text-error" (click)="store.removeColumn(column.id)">
                    Delete column
                  </button>
                </mat-menu>
              </header>

              <div
                class="flex min-h-[4rem] flex-col gap-2"
                cdkDropList
                [cdkDropListData]="column.cards"
                (cdkDropListDropped)="drop($event)">
                @for (item of column.cards; track item.id) {
                  <article
                    cdkDrag
                    class="group cursor-grab rounded-xl border border-outline-variant bg-surface p-3 active:cursor-grabbing"
                    (click)="openCard(item)">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="text-sm font-medium text-on-surface">{{ item.title }}</h3>
                      <button
                        type="button"
                        class="shrink-0 rounded-md p-0.5 text-on-surface-variant opacity-0 transition-opacity hover:text-red-600 focus:opacity-100 group-hover:opacity-100 dark:hover:text-red-400"
                        (click)="remove($event, item.id)"
                        [attr.aria-label]="'Delete ' + item.title">
                        <iconify-icon icon="solar:close-circle-linear" width="15" height="15"></iconify-icon>
                      </button>
                    </div>

                    @if (item.labels.length) {
                      <div class="mt-2 flex flex-wrap gap-1">
                        @for (label of item.labels; track label) {
                          <span class="rounded bg-surface-container-highest px-1.5 py-0.5 text-[11px] text-on-surface-variant">
                            {{ label }}
                          </span>
                        }
                      </div>
                    }

                    <div class="mt-3 flex items-center gap-2">
                      <img [src]="avatar(item.assigneeSeed)" alt="" class="size-6 rounded-full" />
                      <span class="rounded-full px-1.5 py-0.5 text-[11px] font-medium capitalize" [class]="priorityClass(item.priority)">
                        {{ item.priority }}
                      </span>
                      @if (item.checklistTotal > 0) {
                        <span class="flex items-center gap-1 text-[11px] tabular-nums text-on-surface-variant">
                          <iconify-icon icon="solar:checklist-minimalistic-linear" width="13" height="13"></iconify-icon>
                          {{ item.checklistDone }}/{{ item.checklistTotal }}
                        </span>
                      }
                      <span class="ml-auto text-[11px] text-on-surface-variant">{{ item.due | date: 'MMM d' }}</span>
                    </div>
                  </article>
                }
              </div>

              @if (addingCardTo() === column.id) {
                <div class="mt-2">
                  <textarea
                    [(ngModel)]="newCardTitle"
                    rows="2"
                    placeholder="What needs doing?"
                    aria-label="New card title"
                    class="w-full resize-none rounded-xl border border-outline-variant bg-surface p-2.5 text-sm outline-none focus:border-primary"></textarea>
                  <div class="mt-2 flex gap-2">
                    <button matButton="filled" type="button" (click)="confirmAddCard(column.id)">Add card</button>
                    <button matButton type="button" (click)="addingCardTo.set(null)">Cancel</button>
                  </div>
                </div>
              } @else {
                <button
                  type="button"
                  class="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  (click)="startAddCard(column.id)">
                  <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
                  Add a card
                </button>
              }
            </section>
          }
        </div>
      </div>
    </app-page>

    <!-- Card detail -->
    @if (openedCard(); as item) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="openedCard.set(null)" aria-label="Close"></button>
        <div class="relative w-full max-w-lg rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
          <div class="flex items-start justify-between gap-4">
            <h2 class="text-lg font-semibold text-on-surface">{{ item.title }}</h2>
            <button
              type="button"
              class="grid size-8 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              (click)="openedCard.set(null)"
              aria-label="Close">
              <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
            </button>
          </div>

          @if (item.description) {
            <p class="mt-3 text-sm text-on-surface-variant">{{ item.description }}</p>
          }

          <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-xs text-on-surface-variant">Assignee</dt>
              <dd class="mt-1 flex items-center gap-2">
                <img [src]="avatar(item.assigneeSeed)" alt="" class="size-7 rounded-full" />
                <span class="text-on-surface">{{ assigneeName(item.assigneeSeed) }}</span>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-on-surface-variant">Due</dt>
              <dd class="mt-1 text-on-surface">{{ item.due | date: 'mediumDate' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-on-surface-variant">Priority</dt>
              <dd class="mt-1">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" [class]="priorityClass(item.priority)">
                  {{ item.priority }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-on-surface-variant">Checklist</dt>
              <dd class="mt-1 tabular-nums text-on-surface">
                {{ item.checklistTotal ? item.checklistDone + ' of ' + item.checklistTotal : '—' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    }
  `
})
export class KanbanComponent {
  protected readonly store = inject(KanbanService);
  private readonly avatars = inject(AvatarService);

  protected readonly addingCardTo = signal<string | null>(null);
  protected readonly newCardTitle = signal('');
  protected readonly addingColumn = signal(false);
  protected readonly newColumnTitle = signal('');
  protected readonly openedCard = signal<KanbanCard | null>(null);

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected assigneeName(seed: string): string {
    return seed
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  protected priorityClass(priority: CardPriority): string {
    return PRIORITY_CLASSES[priority];
  }

  protected drop(event: CdkDragDrop<KanbanCard[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    // The CDK mutates the arrays in place; push a fresh reference so signals fire.
    this.store.setColumns(this.store.columns().map((column) => ({ ...column, cards: [...column.cards] })));
  }

  protected startAddCard(columnId: string): void {
    this.newCardTitle.set('');
    this.addingCardTo.set(columnId);
  }

  protected confirmAddCard(columnId: string): void {
    const title = this.newCardTitle().trim();
    if (title) this.store.addCard(columnId, title);
    this.addingCardTo.set(null);
  }

  protected confirmAddColumn(): void {
    const title = this.newColumnTitle().trim();
    if (title) this.store.addColumn(title);
    this.newColumnTitle.set('');
    this.addingColumn.set(false);
  }

  protected remove(event: Event, cardId: string): void {
    event.stopPropagation();
    this.store.removeCard(cardId);
  }

  protected openCard(item: KanbanCard): void {
    this.openedCard.set(item);
  }
}

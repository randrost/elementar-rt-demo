import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { Note, NOTE_COLORS, NOTE_SURFACE, NOTE_SWATCH, NoteColor, NotesService } from './mock-data';

@Component({
  selector: 'app-notes',
  imports: [PageComponent, FormsModule, MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Notes" description="Quick thoughts, pinned where you'll find them again.">
      <!-- Composer -->
      <section class="mb-6 rounded-2xl border p-4 transition-colors" [class]="surface(draftColor())">
        <input
          [(ngModel)]="draftTitle"
          placeholder="Title"
          aria-label="Note title"
          class="w-full bg-transparent text-base font-semibold text-on-surface outline-none placeholder:text-on-surface-variant" />
        <textarea
          [(ngModel)]="draftBody"
          rows="2"
          placeholder="Write a note…"
          aria-label="Note body"
          class="mt-2 w-full resize-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"></textarea>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-1.5">
            @for (color of colors; track color) {
              <button
                type="button"
                class="size-6 rounded-full ring-offset-2 ring-offset-surface transition-all"
                [class]="swatch(color) + (draftColor() === color ? ' ring-2 ring-primary' : '')"
                (click)="draftColor.set(color)"
                [attr.aria-label]="'Use ' + color"
                [attr.aria-pressed]="draftColor() === color"></button>
            }
          </div>

          <div class="flex items-center gap-2">
            <input
              [(ngModel)]="draftTags"
              placeholder="tags, comma separated"
              aria-label="Note tags"
              class="w-48 rounded-lg border border-outline-variant bg-surface px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary" />
            <button matButton="filled" type="button" [disabled]="!canAdd()" (click)="addNote()">Add note</button>
          </div>
        </div>
      </section>

      <!-- Tag filter -->
      <div class="mb-5 flex flex-wrap gap-1.5">
        <button
          type="button"
          class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          [class]="chipClass(tag() === null)"
          (click)="tag.set(null)">
          All notes
        </button>
        @for (name of allTags(); track name) {
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
            [class]="chipClass(tag() === name)"
            (click)="tag.set(name)">
            {{ name }}
          </button>
        }
      </div>

      <!-- Masonry -->
      @if (visible().length === 0) {
        <p class="rounded-2xl border border-dashed border-outline-variant py-16 text-center text-sm text-on-surface-variant">
          Nothing here yet. Add a note above.
        </p>
      } @else {
        <div class="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          @for (note of visible(); track note.id) {
            <article class="mb-4 break-inside-avoid rounded-2xl border p-4 transition-colors" [class]="surface(note.color)">
              @if (editingId() === note.id) {
                <input
                  [(ngModel)]="editTitle"
                  aria-label="Edit title"
                  class="w-full bg-transparent text-sm font-semibold text-on-surface outline-none" />
                <textarea
                  [(ngModel)]="editBody"
                  rows="5"
                  aria-label="Edit body"
                  class="mt-2 w-full resize-none bg-transparent text-sm text-on-surface outline-none"></textarea>
                <div class="mt-3 flex justify-end gap-2">
                  <button matButton type="button" (click)="cancelEdit()">Cancel</button>
                  <button matButton="filled" type="button" (click)="saveEdit(note.id)">Save</button>
                </div>
              } @else {
                <div class="group">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="text-sm font-semibold text-on-surface">{{ note.title }}</h3>
                    <div class="flex shrink-0 gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <button
                        type="button"
                        class="grid size-7 place-items-center rounded-lg text-on-surface-variant hover:text-on-surface"
                        (click)="startEdit(note)"
                        [attr.aria-label]="'Edit ' + note.title">
                        <iconify-icon icon="solar:pen-linear" width="15" height="15"></iconify-icon>
                      </button>
                      <button
                        type="button"
                        class="grid size-7 place-items-center rounded-lg text-on-surface-variant hover:text-red-600 dark:hover:text-red-400"
                        (click)="store.remove(note.id)"
                        [attr.aria-label]="'Delete ' + note.title">
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="15" height="15"></iconify-icon>
                      </button>
                    </div>
                  </div>

                  <p class="mt-2 whitespace-pre-line text-sm text-on-surface-variant">{{ note.body }}</p>

                  <div class="mt-3 flex flex-wrap items-center gap-1.5">
                    @for (name of note.tags; track name) {
                      <span class="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-on-surface-variant dark:bg-white/10">
                        {{ name }}
                      </span>
                    }
                  </div>

                  <p class="mt-3 text-[11px] text-on-surface-variant">{{ note.updated | date: 'MMM d, y' }}</p>
                </div>
              }
            </article>
          }
        </div>
      }
    </app-page>
  `
})
export class NotesComponent {
  protected readonly store = inject(NotesService);
  protected readonly colors = NOTE_COLORS;

  protected readonly draftTitle = signal('');
  protected readonly draftBody = signal('');
  protected readonly draftTags = signal('');
  protected readonly draftColor = signal<NoteColor>('yellow');

  protected readonly editingId = signal<string | null>(null);
  protected readonly editTitle = signal('');
  protected readonly editBody = signal('');

  protected readonly tag = signal<string | null>(null);

  protected readonly allTags = computed(() =>
    [...new Set(this.store.notes().flatMap((note) => note.tags))].sort()
  );

  protected readonly visible = computed(() => {
    const tag = this.tag();
    return tag ? this.store.notes().filter((note) => note.tags.includes(tag)) : this.store.notes();
  });

  protected readonly canAdd = computed(
    () => this.draftTitle().trim().length > 0 || this.draftBody().trim().length > 0
  );

  protected surface(color: NoteColor): string {
    return NOTE_SURFACE[color];
  }

  protected swatch(color: NoteColor): string {
    return NOTE_SWATCH[color];
  }

  protected chipClass(active: boolean): string {
    return active
      ? 'border-primary bg-primary text-on-primary'
      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low';
  }

  protected addNote(): void {
    if (!this.canAdd()) return;
    this.store.add({
      title: this.draftTitle().trim() || 'Untitled',
      body: this.draftBody().trim(),
      color: this.draftColor(),
      tags: this.draftTags()
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    });
    this.draftTitle.set('');
    this.draftBody.set('');
    this.draftTags.set('');
  }

  protected startEdit(note: Note): void {
    this.editingId.set(note.id);
    this.editTitle.set(note.title);
    this.editBody.set(note.body);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(id: string): void {
    this.store.update(id, { title: this.editTitle().trim() || 'Untitled', body: this.editBody().trim() });
    this.editingId.set(null);
  }
}

import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { CourseSection, CoursesService, LESSON_META, Lesson } from './mock-data';

const KINDS: readonly Lesson['kind'][] = ['video', 'reading', 'exercise', 'quiz'];

/**
 * Curriculum editor. Sections reorder among themselves; lessons reorder inside a
 * section and move between sections. Section drags are handle-only so grabbing a
 * lesson never picks up its parent.
 */
@Component({
  selector: 'app-course-builder',
  imports: [
    PageComponent,
    RouterLink,
    FormsModule,
    MatButtonModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle
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
    @if (course(); as item) {
      <app-page [title]="'Builder · ' + item.title" description="Drag to reorder. Changes apply immediately.">
        <ng-container actions>
          <a matButton [routerLink]="['/applications/courses/details', item.id]">Done</a>
        </ng-container>

        <div class="flex flex-col gap-6 lg:flex-row">
          <!-- Curriculum tree -->
          <div class="min-w-0 flex-1">
            <div cdkDropList [cdkDropListData]="item.sections" (cdkDropListDropped)="dropSection($event)" class="flex flex-col gap-3">
              @for (section of item.sections; track section.id; let i = $index) {
                <section cdkDrag class="rounded-2xl border border-outline-variant bg-surface">
                  <header class="flex items-center gap-2 border-b border-outline-variant p-3">
                    <button
                      cdkDragHandle
                      type="button"
                      class="grid size-8 shrink-0 cursor-move place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      [attr.aria-label]="'Reorder ' + section.title">
                      <iconify-icon icon="solar:hamburger-menu-linear" width="17" height="17"></iconify-icon>
                    </button>

                    <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-container-highest text-xs font-semibold text-on-surface-variant">
                      {{ i + 1 }}
                    </span>

                    <input
                      [ngModel]="section.title"
                      (ngModelChange)="renameSection(item.id, section, $event)"
                      [attr.aria-label]="'Section title'"
                      class="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-sm font-medium text-on-surface outline-none hover:bg-surface-container-low focus:bg-surface-container-low" />

                    <span class="shrink-0 text-xs text-on-surface-variant">{{ section.lessons.length }} lessons</span>

                    <button
                      type="button"
                      class="grid size-8 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:text-red-600 dark:hover:text-red-400"
                      (click)="store.removeSection(item.id, section.id)"
                      [attr.aria-label]="'Delete section ' + section.title">
                      <iconify-icon icon="solar:trash-bin-trash-linear" width="16" height="16"></iconify-icon>
                    </button>
                  </header>

                  <div
                    cdkDropList
                    [id]="'lessons-' + section.id"
                    [cdkDropListData]="section.lessons"
                    [cdkDropListConnectedTo]="lessonListIds()"
                    (cdkDropListDropped)="dropLesson($event)"
                    class="flex min-h-14 flex-col p-2">
                    @for (lesson of section.lessons; track lesson.id) {
                      <div
                        cdkDrag
                        class="flex cursor-grab items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors active:cursor-grabbing"
                        [class]="selectedId() === lesson.id ? 'bg-surface-container' : 'hover:bg-surface-container-low'"
                        (click)="selectedId.set(lesson.id)">
                        <iconify-icon
                          [icon]="kindMeta(lesson).icon"
                          width="18"
                          height="18"
                          class="shrink-0 text-primary"></iconify-icon>
                        <span class="min-w-0 flex-1 truncate text-sm text-on-surface">{{ lesson.title }}</span>
                        <span class="shrink-0 text-xs tabular-nums text-on-surface-variant">
                          {{ lesson.durationMins }}m
                        </span>
                        <button
                          type="button"
                          class="grid size-7 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:text-red-600 dark:hover:text-red-400"
                          (click)="removeLesson($event, item.id, lesson.id)"
                          [attr.aria-label]="'Delete lesson ' + lesson.title">
                          <iconify-icon icon="solar:close-circle-linear" width="15" height="15"></iconify-icon>
                        </button>
                      </div>
                    } @empty {
                      <p class="px-2.5 py-3 text-xs text-on-surface-variant">Drop a lesson here, or add one below.</p>
                    }

                    <button
                      type="button"
                      class="mt-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                      (click)="addLesson(item.id, section.id)">
                      <iconify-icon icon="solar:add-circle-linear" width="16" height="16"></iconify-icon>
                      Add lesson
                    </button>
                  </div>
                </section>
              }
            </div>

            <div class="mt-3 flex items-center gap-2">
              <input
                [(ngModel)]="newSectionTitle"
                placeholder="New section title"
                aria-label="New section title"
                class="flex-1 rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <button matButton="filled" type="button" [disabled]="!newSectionTitle().trim()" (click)="addSection(item.id)">
                Add section
              </button>
            </div>
          </div>

          <!-- Lesson editor -->
          <aside class="w-full shrink-0 lg:w-80">
            @if (selected(); as lesson) {
              <div class="sticky top-6 rounded-2xl border border-outline-variant bg-surface p-5">
                <h2 class="text-sm font-semibold text-on-surface">Lesson</h2>

                <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="lesson-title">Title</label>
                <input
                  id="lesson-title"
                  [ngModel]="lesson.title"
                  (ngModelChange)="patch(item.id, lesson.id, { title: $event })"
                  class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />

                <span class="mt-4 block text-xs font-medium text-on-surface-variant">Type</span>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  @for (kind of kinds; track kind) {
                    <button
                      type="button"
                      class="rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors"
                      [class]="
                        lesson.kind === kind
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                      "
                      [attr.aria-pressed]="lesson.kind === kind"
                      (click)="patch(item.id, lesson.id, { kind })">
                      {{ kind }}
                    </button>
                  }
                </div>

                <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="lesson-mins">
                  Duration (minutes)
                </label>
                <input
                  id="lesson-mins"
                  type="number"
                  min="1"
                  [ngModel]="lesson.durationMins"
                  (ngModelChange)="patch(item.id, lesson.id, { durationMins: +$event || 1 })"
                  class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-primary" />

                <label class="mt-4 block text-xs font-medium text-on-surface-variant" for="lesson-notes">Notes</label>
                <textarea
                  id="lesson-notes"
                  rows="5"
                  [ngModel]="lesson.notes"
                  (ngModelChange)="patch(item.id, lesson.id, { notes: $event })"
                  placeholder="Outline, links, anything the author needs."
                  class="mt-1.5 w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"></textarea>
                <p class="mt-2 text-xs text-on-surface-variant">
                  Plain text for now — this becomes the rich editor once the posts editor lands.
                </p>
              </div>
            } @else {
              <div class="sticky top-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant p-8 text-center">
                <iconify-icon icon="solar:document-add-bold-duotone" width="36" height="36" class="text-primary"></iconify-icon>
                <p class="text-sm text-on-surface-variant">Pick a lesson to edit it.</p>
              </div>
            }
          </aside>
        </div>
      </app-page>
    } @else {
      <app-page title="Course not found">
        <div class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-outline-variant py-20 text-center">
          <p class="text-sm text-on-surface-variant">That course does not exist.</p>
          <a matButton="filled" routerLink="/applications/courses/list">Back to courses</a>
        </div>
      </app-page>
    }
  `
})
export class CourseBuilderComponent {
  protected readonly store = inject(CoursesService);
  private readonly routeId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  protected readonly kinds = KINDS;
  protected readonly newSectionTitle = signal('');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly course = computed(() => this.store.byId(this.routeId) ?? null);

  protected readonly lessonListIds = computed(() =>
    (this.course()?.sections ?? []).map((section) => `lessons-${section.id}`)
  );

  protected readonly selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    for (const section of this.course()?.sections ?? []) {
      const found = section.lessons.find((lesson) => lesson.id === id);
      if (found) return found;
    }
    return null;
  });

  protected kindMeta(lesson: Lesson) {
    return LESSON_META[lesson.kind];
  }

  protected dropSection(event: CdkDragDrop<CourseSection[]>): void {
    const sections = [...(this.course()?.sections ?? [])];
    moveItemInArray(sections, event.previousIndex, event.currentIndex);
    this.store.setSections(this.routeId, sections);
  }

  protected dropLesson(event: CdkDragDrop<Lesson[]>): void {
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
    // The CDK mutated the lesson arrays in place; hand back fresh references.
    const sections = (this.course()?.sections ?? []).map((section) => ({
      ...section,
      lessons: [...section.lessons]
    }));
    this.store.setSections(this.routeId, sections);
  }

  protected renameSection(courseId: string, section: CourseSection, title: string): void {
    const sections = (this.course()?.sections ?? []).map((current) =>
      current.id === section.id ? { ...current, title } : current
    );
    this.store.setSections(courseId, sections);
  }

  protected addSection(courseId: string): void {
    const title = this.newSectionTitle().trim();
    if (!title) return;
    this.store.addSection(courseId, title);
    this.newSectionTitle.set('');
  }

  protected addLesson(courseId: string, sectionId: string): void {
    this.store.addLesson(courseId, sectionId, 'New lesson');
  }

  protected removeLesson(event: Event, courseId: string, lessonId: string): void {
    event.stopPropagation();
    if (this.selectedId() === lessonId) this.selectedId.set(null);
    this.store.removeLesson(courseId, lessonId);
  }

  protected patch(courseId: string, lessonId: string, changes: Partial<Omit<Lesson, 'id'>>): void {
    this.store.updateLesson(courseId, lessonId, changes);
  }
}

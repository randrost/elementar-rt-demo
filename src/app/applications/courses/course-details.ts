import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { CourseSection, CoursesService, LESSON_META, LEVEL_META, Lesson } from './mock-data';

@Component({
  selector: 'app-course-details',
  imports: [PageComponent, RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (course(); as item) {
      <app-page>
        <a
          routerLink="/applications/courses/list"
          class="mb-6 flex w-fit items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface">
          <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
          All courses
        </a>

        <!-- Hero -->
        <section class="overflow-hidden rounded-2xl border border-outline-variant bg-surface">
          <div class="h-40 bg-gradient-to-br" [class]="item.cover"></div>
          <div class="p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" [class]="levelMeta().classes">
                    {{ levelMeta().label }}
                  </span>
                  <span class="text-xs text-on-surface-variant">{{ item.category }}</span>
                </div>
                <h1 class="mt-2 text-2xl font-semibold tracking-tight text-on-surface">{{ item.title }}</h1>
                <p class="mt-2 max-w-2xl text-sm text-on-surface-variant">{{ item.summary }}</p>
              </div>

              <a matButton="filled" [routerLink]="['/applications/courses/builder', item.id]">Edit curriculum</a>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-6 border-t border-outline-variant pt-5">
              <div class="flex items-center gap-2.5">
                <img [src]="avatar(item.authorSeed)" alt="" class="size-9 rounded-full" />
                <div>
                  <p class="text-sm font-medium text-on-surface">{{ item.authorName }}</p>
                  <p class="text-xs text-on-surface-variant">Instructor</p>
                </div>
              </div>

              @for (stat of stats(); track stat.label) {
                <div>
                  <p class="text-xs text-on-surface-variant">{{ stat.label }}</p>
                  <p class="text-sm font-medium tabular-nums text-on-surface">{{ stat.value }}</p>
                </div>
              }

              <div class="min-w-48 flex-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-on-surface-variant">Your progress</span>
                  <span class="font-medium tabular-nums text-on-surface">{{ progress() }}%</span>
                </div>
                <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-highest">
                  <div class="h-full rounded-full bg-primary transition-[width]" [style.width.%]="progress()"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Curriculum -->
        <section class="mt-6">
          <h2 class="mb-3 text-lg font-semibold text-on-surface">Curriculum</h2>

          <div class="flex flex-col gap-3">
            @for (section of item.sections; track section.id; let i = $index) {
              @let open = expanded().has(section.id);
              <div class="overflow-hidden rounded-2xl border border-outline-variant bg-surface">
                <h3>
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-container-low"
                    [attr.aria-expanded]="open"
                    (click)="toggleSection(section.id)">
                    <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-container-highest text-xs font-semibold text-on-surface-variant">
                      {{ i + 1 }}
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block text-sm font-medium text-on-surface">{{ section.title }}</span>
                      <span class="block text-xs text-on-surface-variant">
                        {{ section.lessons.length }} lessons · {{ sectionMins(section) }} min
                      </span>
                    </span>
                    <iconify-icon
                      icon="solar:alt-arrow-down-linear"
                      width="18"
                      height="18"
                      class="shrink-0 text-on-surface-variant transition-transform"
                      [class.rotate-180]="open"></iconify-icon>
                  </button>
                </h3>

                @if (open) {
                  <ul class="border-t border-outline-variant">
                    @for (lesson of section.lessons; track lesson.id) {
                      <li class="flex items-center gap-3 border-b border-outline-variant px-5 py-3 last:border-0">
                        <button
                          type="button"
                          class="grid size-6 shrink-0 place-items-center rounded-full border transition-colors"
                          [class]="
                            lesson.completed
                              ? 'border-primary bg-primary text-on-primary'
                              : 'border-outline-variant text-transparent hover:border-primary'
                          "
                          (click)="store.toggleLesson(item.id, lesson.id)"
                          [attr.aria-pressed]="lesson.completed"
                          [attr.aria-label]="(lesson.completed ? 'Mark incomplete: ' : 'Mark complete: ') + lesson.title">
                          <iconify-icon icon="solar:check-read-linear" width="13" height="13"></iconify-icon>
                        </button>

                        <iconify-icon
                          [icon]="kind(lesson).icon"
                          width="18"
                          height="18"
                          class="shrink-0 text-primary"></iconify-icon>

                        <span
                          class="min-w-0 flex-1 truncate text-sm"
                          [class]="lesson.completed ? 'text-on-surface-variant line-through' : 'text-on-surface'">
                          {{ lesson.title }}
                        </span>

                        <span class="shrink-0 text-xs text-on-surface-variant">{{ kind(lesson).label }}</span>
                        <span class="w-14 shrink-0 text-right text-xs tabular-nums text-on-surface-variant">
                          {{ lesson.durationMins }} min
                        </span>
                      </li>
                    } @empty {
                      <li class="px-5 py-6 text-center text-sm text-on-surface-variant">No lessons in this section yet.</li>
                    }
                  </ul>
                }
              </div>
            }
          </div>
        </section>
      </app-page>
    } @else {
      <app-page title="Course not found">
        <div class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-outline-variant py-20 text-center">
          <iconify-icon icon="solar:square-academic-cap-bold-duotone" width="44" height="44" class="text-primary"></iconify-icon>
          <p class="text-sm text-on-surface-variant">That course does not exist.</p>
          <a matButton="filled" routerLink="/applications/courses/list">Back to courses</a>
        </div>
      </app-page>
    }
  `
})
export class CourseDetailsComponent {
  protected readonly store = inject(CoursesService);
  private readonly avatars = inject(AvatarService);

  readonly id = input<string>('');

  protected readonly course = computed(() => this.store.byId(this.id()) ?? null);
  protected readonly progress = computed(() => {
    const course = this.course();
    return course ? this.store.progress(course) : 0;
  });

  protected readonly levelMeta = computed(() => {
    const course = this.course();
    return course ? LEVEL_META[course.level] : LEVEL_META.beginner;
  });

  protected readonly stats = computed(() => {
    const course = this.course();
    if (!course) return [];
    const mins = this.store.durationMins(course);
    const hours = Math.floor(mins / 60);
    return [
      { label: 'Lessons', value: String(this.store.lessonCount(course)) },
      { label: 'Duration', value: hours ? `${hours}h ${mins % 60}m` : `${mins}m` },
      { label: 'Sections', value: String(course.sections.length) }
    ];
  });

  /** Sections open by default so the curriculum reads as a whole. */
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());

  constructor() {
    queueMicrotask(() => {
      const course = this.course();
      if (course) this.expanded.set(new Set(course.sections.map((section) => section.id)));
    });
  }

  protected toggleSection(id: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected sectionMins(section: CourseSection): number {
    return section.lessons.reduce((sum, lesson) => sum + lesson.durationMins, 0);
  }

  protected kind(lesson: Lesson) {
    return LESSON_META[lesson.kind];
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }
}

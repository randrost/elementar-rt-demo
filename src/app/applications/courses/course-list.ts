import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { Course, CoursesService, LEVEL_META } from './mock-data';

@Component({
  selector: 'app-course-list',
  imports: [PageComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Courses" description="Learning paths for the team, and how far along you are.">
      <div class="mb-6 flex flex-wrap gap-1.5">
        @for (option of categories(); track option) {
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
            [class]="
              category() === option
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            "
            [attr.aria-pressed]="category() === option"
            (click)="category.set(option)">
            {{ option }}
          </button>
        }
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        @for (course of visible(); track course.id) {
          <a
            [routerLink]="['/applications/courses/details', course.id]"
            class="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface transition-colors hover:bg-surface-container-low">
            <span class="flex h-32 items-end bg-gradient-to-br p-4" [class]="course.cover">
              <span class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                {{ course.category }}
              </span>
            </span>

            <span class="flex flex-1 flex-col p-5">
              <span class="flex items-center gap-2">
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" [class]="level(course).classes">
                  {{ level(course).label }}
                </span>
                <span class="text-xs text-on-surface-variant">
                  {{ store.lessonCount(course) }} lessons · {{ duration(course) }}
                </span>
              </span>

              <span class="mt-3 block text-base font-semibold text-on-surface">{{ course.title }}</span>
              <span class="mt-1.5 block flex-1 text-sm text-on-surface-variant">{{ course.summary }}</span>

              <span class="mt-4 block">
                <span class="flex items-center justify-between text-xs">
                  <span class="text-on-surface-variant">Progress</span>
                  <span class="font-medium tabular-nums text-on-surface">{{ store.progress(course) }}%</span>
                </span>
                <span class="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                  <span class="block h-full rounded-full bg-primary" [style.width.%]="store.progress(course)"></span>
                </span>
              </span>

              <span class="mt-4 flex items-center gap-2.5 border-t border-outline-variant pt-4">
                <img [src]="avatar(course.authorSeed)" alt="" class="size-7 rounded-full" />
                <span class="text-xs text-on-surface-variant">{{ course.authorName }}</span>
              </span>
            </span>
          </a>
        }
      </div>
    </app-page>
  `
})
export class CourseListComponent {
  protected readonly store = inject(CoursesService);
  private readonly avatars = inject(AvatarService);

  protected readonly category = signal('All');

  protected readonly categories = computed(() => [
    'All',
    ...new Set(this.store.courses().map((course) => course.category))
  ]);

  protected readonly visible = computed(() => {
    const category = this.category();
    const all = this.store.courses();
    return category === 'All' ? all : all.filter((course) => course.category === category);
  });

  protected level(course: Course) {
    return LEVEL_META[course.level];
  }

  protected duration(course: Course): string {
    const mins = this.store.durationMins(course);
    const hours = Math.floor(mins / 60);
    return hours ? `${hours}h ${mins % 60}m` : `${mins}m`;
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }
}

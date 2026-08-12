import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { PageComponent } from '../../shell/page/page';
import { AvatarService } from '../../core/avatar.service';
import { Project, ProjectStatus, ProjectsService, STATUS_META } from './mock-data';

type StatusFilter = 'all' | ProjectStatus;
type ViewMode = 'grid' | 'board';

const FILTERS: readonly { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'on-track', label: 'On track' },
  { id: 'at-risk', label: 'At risk' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'shipped', label: 'Shipped' }
];

const BOARD_COLUMNS: readonly ProjectStatus[] = ['on-track', 'at-risk', 'blocked', 'shipped'];

@Component({
  selector: 'app-projects',
  imports: [PageComponent, DatePipe, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Projects" description="What's in flight, who's on it, and how far along it is.">
      <ng-container actions>
        <div class="flex rounded-xl border border-outline-variant p-0.5" role="group" aria-label="View mode">
          @for (mode of modes; track mode.id) {
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              [class]="view() === mode.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
              [attr.aria-pressed]="view() === mode.id"
              (click)="view.set(mode.id)">
              <iconify-icon [icon]="mode.icon" width="16" height="16"></iconify-icon>
              {{ mode.label }}
            </button>
          }
        </div>
      </ng-container>

      <div class="mb-6 flex flex-wrap gap-1.5">
        @for (option of filters; track option.id) {
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
            [class]="
              filter() === option.id
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            "
            [attr.aria-pressed]="filter() === option.id"
            (click)="filter.set(option.id)">
            {{ option.label }}
          </button>
        }
      </div>

      @if (view() === 'grid') {
        @if (visible().length === 0) {
          <p class="rounded-2xl border border-dashed border-outline-variant py-16 text-center text-sm text-on-surface-variant">
            No projects with that status.
          </p>
        } @else {
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (project of visible(); track project.id) {
              <ng-container *ngTemplateOutlet="card; context: { $implicit: project }" />
            }
          </div>
        }
      } @else {
        <div class="-mx-1 overflow-x-auto pb-4">
          <div class="flex items-start gap-4 px-1">
            @for (status of boardColumns; track status) {
              <section class="flex w-80 shrink-0 flex-col rounded-2xl bg-surface-container-low p-3">
                <header class="mb-3 flex items-center gap-2 px-1">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" [class]="statusMeta(status).classes">
                    {{ statusMeta(status).label }}
                  </span>
                  <span class="text-xs tabular-nums text-on-surface-variant">{{ inStatus(status).length }}</span>
                </header>
                <div class="flex flex-col gap-3">
                  @for (project of inStatus(status); track project.id) {
                    <ng-container *ngTemplateOutlet="card; context: { $implicit: project }" />
                  } @empty {
                    <p class="px-1 py-6 text-center text-xs text-on-surface-variant">Nothing here.</p>
                  }
                </div>
              </section>
            }
          </div>
        </div>
      }
    </app-page>

    <ng-template #card let-project>
      <article class="flex flex-col rounded-2xl border border-outline-variant bg-surface p-5">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-sm font-semibold text-on-surface">{{ project.name }}</h3>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" [class]="statusMeta(project.status).classes">
            {{ statusMeta(project.status).label }}
          </span>
        </div>

        <p class="mt-2 text-sm text-on-surface-variant">{{ project.description }}</p>

        <div class="mt-4">
          <div class="flex items-center justify-between text-xs">
            <span class="text-on-surface-variant">{{ project.tasksDone }} of {{ project.tasksTotal }} tasks</span>
            <span class="font-medium tabular-nums text-on-surface">{{ project.progress }}%</span>
          </div>
          <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
            <div class="h-full rounded-full bg-primary" [style.width.%]="project.progress"></div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-1">
          @for (tag of project.tags; track tag) {
            <span class="rounded-md bg-surface-container-highest px-1.5 py-0.5 text-[11px] text-on-surface-variant">
              {{ tag }}
            </span>
          }
        </div>

        <div class="mt-4 flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
          <div class="flex -space-x-2">
            @for (seed of project.members; track seed) {
              <img
                [src]="avatar(seed)"
                [alt]="memberName(seed)"
                [title]="memberName(seed)"
                class="size-7 rounded-full border-2 border-surface bg-surface-container" />
            }
          </div>
          <span class="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <iconify-icon icon="solar:calendar-linear" width="14" height="14"></iconify-icon>
            {{ project.due | date: 'MMM d' }}
          </span>
        </div>
      </article>
    </ng-template>
  `
})
export class ProjectsComponent {
  private readonly store = inject(ProjectsService);
  private readonly avatars = inject(AvatarService);

  protected readonly filters = FILTERS;
  protected readonly boardColumns = BOARD_COLUMNS;
  protected readonly modes: readonly { id: ViewMode; label: string; icon: string }[] = [
    { id: 'grid', label: 'Grid', icon: 'solar:widget-4-linear' },
    { id: 'board', label: 'Board', icon: 'solar:notebook-linear' }
  ];

  protected readonly filter = signal<StatusFilter>('all');
  protected readonly view = signal<ViewMode>('grid');

  protected readonly visible = computed(() => {
    const status = this.filter();
    const all = this.store.projects();
    return status === 'all' ? all : all.filter((project) => project.status === status);
  });

  /** Board columns respect the status filter too, so the two views stay consistent. */
  protected inStatus(status: ProjectStatus): Project[] {
    return this.visible().filter((project) => project.status === status);
  }

  protected statusMeta(status: ProjectStatus) {
    return STATUS_META[status];
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected memberName(seed: string): string {
    return seed
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}

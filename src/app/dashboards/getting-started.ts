import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../shell/page/page';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  action: string;
}

interface QuickLink {
  label: string;
  description: string;
  icon: string;
  link: string;
}

const STORAGE_KEY = 'elementar-rt:getting-started';

const CHECKLIST: readonly ChecklistItem[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add a photo and job title so teammates recognise you.',
    icon: 'solar:user-circle-bold-duotone',
    link: '/account/settings/my-profile',
    action: 'Edit profile'
  },
  {
    id: 'workspace',
    title: 'Name your workspace',
    description: 'Set the workspace title, logo, and default language.',
    icon: 'solar:widget-5-bold-duotone',
    link: '/management/settings/general',
    action: 'Open settings'
  },
  {
    id: 'invite',
    title: 'Invite your team',
    description: 'Admin work is easier with the people you work with.',
    icon: 'solar:users-group-rounded-bold-duotone',
    link: '/applications/contacts',
    action: 'Invite people'
  },
  {
    id: 'security',
    title: 'Turn on two-factor auth',
    description: 'Add a second step to every sign-in on your account.',
    icon: 'solar:shield-keyhole-bold-duotone',
    link: '/account/settings/security',
    action: 'Secure account'
  },
  {
    id: 'integrations',
    title: 'Connect an integration',
    description: 'Pull in data from the tools you already run on.',
    icon: 'solar:plug-circle-bold-duotone',
    link: '/integrations',
    action: 'Browse integrations'
  }
];

const QUICK_LINKS: readonly QuickLink[] = [
  { label: 'Analytics', description: 'Traffic and acquisition', icon: 'solar:chart-square-bold-duotone', link: '/dashboard/analytics' },
  { label: 'Invoices', description: 'Billing documents', icon: 'solar:bill-list-bold-duotone', link: '/applications/invoice/list' },
  { label: 'Projects', description: 'Work in flight', icon: 'solar:folder-bold-duotone', link: '/applications/projects' },
  { label: 'Kanban', description: 'Boards and tasks', icon: 'solar:notebook-bold-duotone', link: '/applications/kanban' },
  { label: 'Email', description: 'Shared team inbox', icon: 'solar:letter-bold-duotone', link: '/applications/email/inbox' },
  { label: 'Widgets', description: 'The full catalog', icon: 'solar:pie-chart-2-bold-duotone', link: '/widgets/general' }
];

/** Reads the persisted set of completed ids, tolerating a corrupted entry. */
function loadDone(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

@Component({
  selector: 'app-getting-started',
  imports: [PageComponent, RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page
      title="Getting started"
      description="A short setup checklist, then the shortcuts you'll use most.">
      <div class="flex flex-col gap-6">
        <!-- Progress -->
        <section class="rounded-2xl border border-outline-variant bg-surface p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-on-surface">Set up your workspace</h2>
              <p class="mt-1 text-sm text-on-surface-variant">
                {{ doneCount() }} of {{ checklist.length }} steps complete
              </p>
            </div>
            @if (doneCount() === checklist.length) {
              <span class="flex items-center gap-1.5 rounded-full bg-green-container px-3 py-1.5 text-sm font-medium text-on-green-container">
                <iconify-icon icon="solar:check-circle-bold" width="18" height="18"></iconify-icon>
                All done
              </span>
            } @else {
              <button matButton type="button" (click)="reset()">Reset checklist</button>
            }
          </div>

          <div class="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-highest">
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-300"
              [style.width.%]="progress()"
              role="progressbar"
              [attr.aria-valuenow]="doneCount()"
              aria-valuemin="0"
              [attr.aria-valuemax]="checklist.length"></div>
          </div>

          <ul class="mt-6 flex flex-col divide-y divide-outline-variant">
            @for (item of checklist; track item.id) {
              @let done = isDone(item.id);
              <li class="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  class="grid size-10 shrink-0 place-items-center rounded-xl transition-colors"
                  [class]="done ? 'bg-green-container text-on-green-container' : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'"
                  (click)="toggle(item.id)"
                  [attr.aria-pressed]="done"
                  [attr.aria-label]="(done ? 'Mark incomplete: ' : 'Mark complete: ') + item.title">
                  <iconify-icon
                    [icon]="done ? 'solar:check-read-linear' : item.icon"
                    width="22"
                    height="22"></iconify-icon>
                </button>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-on-surface" [class.line-through]="done" [class.text-on-surface-variant]="done">
                    {{ item.title }}
                  </p>
                  <p class="mt-0.5 text-sm text-on-surface-variant">{{ item.description }}</p>
                </div>

                <a matButton="outlined" class="shrink-0" [routerLink]="item.link">{{ item.action }}</a>
              </li>
            }
          </ul>
        </section>

        <!-- Quick links -->
        <section>
          <h2 class="mb-3 text-lg font-semibold text-on-surface">Jump back in</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (link of quickLinks; track link.link) {
              <a
                [routerLink]="link.link"
                class="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-4 transition-colors hover:bg-surface-container-low">
                <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary-container">
                  <iconify-icon [icon]="link.icon" width="22" height="22"></iconify-icon>
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-medium text-on-surface">{{ link.label }}</span>
                  <span class="block truncate text-xs text-on-surface-variant">{{ link.description }}</span>
                </span>
                <iconify-icon
                  icon="solar:alt-arrow-right-linear"
                  width="18"
                  height="18"
                  class="ml-auto shrink-0 text-on-surface-variant"></iconify-icon>
              </a>
            }
          </div>
        </section>
      </div>
    </app-page>
  `
})
export class GettingStartedComponent {
  protected readonly checklist = CHECKLIST;
  protected readonly quickLinks = QUICK_LINKS;

  private readonly done = signal<readonly string[]>(loadDone());

  protected readonly doneCount = computed(
    () => CHECKLIST.filter((item) => this.done().includes(item.id)).length
  );
  protected readonly progress = computed(() => (this.doneCount() / CHECKLIST.length) * 100);

  protected isDone(id: string): boolean {
    return this.done().includes(id);
  }

  protected toggle(id: string): void {
    this.done.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
    this.persist();
  }

  protected reset(): void {
    this.done.set([]);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.done()));
  }
}

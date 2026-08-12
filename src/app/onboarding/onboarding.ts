import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ColorScheme, ColorSchemeStore } from '@elementar-rt/components/color-scheme';
import { StepperComponent } from '../shared/stepper/stepper';

interface Choice {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const ROLES: readonly Choice[] = [
  { id: 'founder', label: 'Founder', description: 'Running the business', icon: 'solar:crown-bold-duotone' },
  { id: 'designer', label: 'Designer', description: 'Product and brand work', icon: 'solar:pallete-2-bold-duotone' },
  { id: 'developer', label: 'Developer', description: 'Building the product', icon: 'solar:code-square-bold-duotone' },
  { id: 'marketing', label: 'Marketing', description: 'Growth and campaigns', icon: 'solar:chart-2-bold-duotone' },
  { id: 'operations', label: 'Operations', description: 'Process and delivery', icon: 'solar:box-bold-duotone' },
  { id: 'other', label: 'Something else', description: "I'll figure it out", icon: 'solar:widget-4-bold-duotone' }
];

const MODULES: readonly Choice[] = [
  { id: 'analytics', label: 'Analytics', description: 'Traffic and revenue dashboards', icon: 'solar:chart-square-bold-duotone' },
  { id: 'invoicing', label: 'Invoicing', description: 'Bill clients and track payments', icon: 'solar:bill-list-bold-duotone' },
  { id: 'projects', label: 'Projects', description: 'Boards, tasks, and milestones', icon: 'solar:notebook-bold-duotone' },
  { id: 'email', label: 'Email', description: 'A shared team inbox', icon: 'solar:letter-bold-duotone' },
  { id: 'calendar', label: 'Calendar', description: 'Schedules and bookings', icon: 'solar:calendar-bold-duotone' },
  { id: 'courses', label: 'Courses', description: 'Lessons and learning paths', icon: 'solar:square-academic-cap-bold-duotone' }
];

/**
 * First-run setup, rendered outside the app shell. Choices are kept locally and
 * summarised on the last step; the appearance step applies immediately so the
 * preview is the real thing.
 */
@Component({
  selector: 'app-onboarding',
  imports: [RouterLink, MatButtonModule, StepperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="min-h-screen bg-surface-container-low text-on-surface">
      <header class="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-6">
        <span class="flex items-center gap-2.5">
          <span class="grid size-9 place-items-center rounded-xl bg-primary text-on-primary">
            <iconify-icon icon="solar:atom-bold-duotone" width="22" height="22"></iconify-icon>
          </span>
          <span class="text-lg font-semibold">Elementar<span class="text-on-surface-variant">RT</span></span>
        </span>
        <a
          routerLink="/dashboard/getting-started"
          class="text-sm font-medium text-on-surface-variant hover:text-on-surface">
          Skip setup
        </a>
      </header>

      <main class="mx-auto w-full max-w-4xl px-6 pb-16">
        <div class="rounded-3xl border border-outline-variant bg-surface p-6 sm:p-10">
          <app-stepper class="mb-10 block" [steps]="steps" [current]="step()" ariaLabel="Onboarding" />

          @switch (step()) {
            @case (0) {
              <section>
                <h1 class="text-xl font-semibold">Welcome aboard</h1>
                <p class="mt-1.5 text-sm text-on-surface-variant">
                  What describes your work best? We'll highlight the tools that fit.
                </p>

                <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  @for (item of roles; track item.id) {
                    <button
                      type="button"
                      class="flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors"
                      [class]="cardClass(role() === item.id)"
                      [attr.aria-pressed]="role() === item.id"
                      (click)="role.set(item.id)">
                      <iconify-icon [icon]="item.icon" width="24" height="24" class="mt-0.5 text-primary"></iconify-icon>
                      <span class="min-w-0">
                        <span class="block text-sm font-medium">{{ item.label }}</span>
                        <span class="mt-0.5 block text-xs text-on-surface-variant">{{ item.description }}</span>
                      </span>
                    </button>
                  }
                </div>
              </section>
            }

            @case (1) {
              <section>
                <h1 class="text-xl font-semibold">Make it yours</h1>
                <p class="mt-1.5 text-sm text-on-surface-variant">
                  Choose an appearance. This applies straight away and you can change it any time from the header.
                </p>

                <div class="mt-8 grid gap-4 sm:grid-cols-2">
                  @for (option of schemes; track option.id) {
                    <button
                      type="button"
                      class="overflow-hidden rounded-2xl border text-left transition-colors"
                      [class]="cardClass(colorScheme.theme() === option.id)"
                      [attr.aria-pressed]="colorScheme.theme() === option.id"
                      (click)="colorScheme.setScheme(option.id)">
                      <span class="flex h-28 items-stretch gap-1.5 p-3" [class]="option.preview">
                        <span class="w-1/4 rounded-lg" [class]="option.previewBar"></span>
                        <span class="flex flex-1 flex-col gap-1.5">
                          <span class="h-1/3 rounded-lg" [class]="option.previewBar"></span>
                          <span class="flex-1 rounded-lg" [class]="option.previewBar"></span>
                        </span>
                      </span>
                      <span class="flex items-center gap-2 border-t border-outline-variant px-4 py-3">
                        <iconify-icon [icon]="option.icon" width="20" height="20" class="text-primary"></iconify-icon>
                        <span class="text-sm font-medium">{{ option.label }}</span>
                        @if (colorScheme.theme() === option.id) {
                          <iconify-icon
                            icon="solar:check-circle-bold"
                            width="18"
                            height="18"
                            class="ml-auto text-primary"></iconify-icon>
                        }
                      </span>
                    </button>
                  }
                </div>
              </section>
            }

            @case (2) {
              <section>
                <h1 class="text-xl font-semibold">Pick your tools</h1>
                <p class="mt-1.5 text-sm text-on-surface-variant">
                  Select everything you expect to use. Nothing is hidden — this just orders your dashboard.
                </p>

                <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  @for (item of modules; track item.id) {
                    @let picked = isPicked(item.id);
                    <button
                      type="button"
                      class="flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors"
                      [class]="cardClass(picked)"
                      [attr.aria-pressed]="picked"
                      (click)="toggleModule(item.id)">
                      <iconify-icon [icon]="item.icon" width="24" height="24" class="mt-0.5 text-primary"></iconify-icon>
                      <span class="min-w-0 flex-1">
                        <span class="block text-sm font-medium">{{ item.label }}</span>
                        <span class="mt-0.5 block text-xs text-on-surface-variant">{{ item.description }}</span>
                      </span>
                      @if (picked) {
                        <iconify-icon icon="solar:check-circle-bold" width="18" height="18" class="text-primary"></iconify-icon>
                      }
                    </button>
                  }
                </div>
              </section>
            }

            @case (3) {
              <section class="text-center">
                <span class="mx-auto grid size-16 place-items-center rounded-full bg-green-container text-on-green-container">
                  <iconify-icon icon="solar:confetti-minimalistic-bold-duotone" width="34" height="34"></iconify-icon>
                </span>
                <h1 class="mt-6 text-xl font-semibold">Your workspace is ready</h1>
                <p class="mt-1.5 text-sm text-on-surface-variant">
                  Here's what we set up. Everything stays editable in Settings.
                </p>

                <dl class="mx-auto mt-8 grid max-w-lg gap-2 text-left">
                  <div class="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
                    <dt class="text-sm text-on-surface-variant">Role</dt>
                    <dd class="text-sm font-medium">{{ roleLabel() }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
                    <dt class="text-sm text-on-surface-variant">Appearance</dt>
                    <dd class="text-sm font-medium capitalize">{{ colorScheme.theme() }}</dd>
                  </div>
                  <div class="flex items-start justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
                    <dt class="shrink-0 text-sm text-on-surface-variant">Tools</dt>
                    <dd class="text-right text-sm font-medium">{{ moduleLabels() }}</dd>
                  </div>
                </dl>
              </section>
            }
          }

          <footer class="mt-10 flex items-center justify-between gap-3 border-t border-outline-variant pt-6">
            <button matButton type="button" [disabled]="step() === 0" (click)="back()">Back</button>
            <button matButton="filled" type="button" class="!h-11 !px-6" [disabled]="!canAdvance()" (click)="next()">
              {{ step() === 3 ? 'Go to dashboard' : 'Continue' }}
            </button>
          </footer>
        </div>
      </main>
    </div>
  `
})
export class OnboardingComponent {
  private readonly router = inject(Router);
  protected readonly colorScheme = inject(ColorSchemeStore);

  protected readonly steps = ['Welcome', 'Appearance', 'Tools', 'Ready'];
  protected readonly roles = ROLES;
  protected readonly modules = MODULES;
  protected readonly schemes: readonly {
    id: ColorScheme;
    label: string;
    icon: string;
    preview: string;
    previewBar: string;
  }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: 'solar:sun-bold-duotone',
      preview: 'bg-neutral-100',
      previewBar: 'bg-white'
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: 'solar:moon-bold-duotone',
      preview: 'bg-neutral-900',
      previewBar: 'bg-neutral-700'
    }
  ];

  protected readonly step = signal(0);
  protected readonly role = signal<string | null>(null);
  protected readonly picked = signal<readonly string[]>(['analytics', 'projects']);

  protected readonly roleLabel = computed(
    () => ROLES.find((r) => r.id === this.role())?.label ?? 'Not set'
  );

  protected readonly moduleLabels = computed(() => {
    const ids = this.picked();
    if (!ids.length) return 'None yet';
    return MODULES.filter((m) => ids.includes(m.id))
      .map((m) => m.label)
      .join(', ');
  });

  /** Only the role step gates progress; the rest have sensible defaults. */
  protected readonly canAdvance = computed(() => this.step() !== 0 || this.role() !== null);

  protected cardClass(selected: boolean): string {
    return selected
      ? 'border-primary ring-1 ring-primary bg-surface-container'
      : 'border-outline-variant hover:bg-surface-container-low';
  }

  protected isPicked(id: string): boolean {
    return this.picked().includes(id);
  }

  protected toggleModule(id: string): void {
    this.picked.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  protected back(): void {
    this.step.update((s) => Math.max(0, s - 1));
  }

  protected next(): void {
    if (this.step() < 3) {
      this.step.update((s) => s + 1);
      return;
    }
    this.router.navigate(['/dashboard/getting-started']);
  }
}

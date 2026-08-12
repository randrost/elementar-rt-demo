import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

export type ErrorTone = 'primary' | 'error' | 'warning';
export type ErrorVariant = 'centered' | 'split';

const TONE_BADGE: Record<ErrorTone, string> = {
  primary: 'bg-primary-container text-on-primary-container',
  error: 'bg-red-container text-on-red-container',
  warning: 'bg-orange-container text-on-orange-container'
};

const TONE_PANEL: Record<ErrorTone, string> = {
  primary: 'bg-primary text-on-primary',
  error: 'bg-red-container text-on-red-container',
  warning: 'bg-orange-container text-on-orange-container'
};

/**
 * Presentational shell shared by every error route. `centered` is the compact
 * treatment; `split` pairs the message with a full-height decorative panel.
 * Projected `[actions]` replace the default Back / Dashboard pair.
 */
@Component({
  selector: 'app-error-page',
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (variant() === 'split') {
      <main class="flex min-h-screen bg-surface text-on-surface">
        <div class="flex w-full flex-col justify-center px-6 py-16 sm:px-12 lg:w-1/2 lg:px-16">
          <a routerLink="/" class="mb-12 flex items-center gap-2.5">
            <span class="grid size-9 place-items-center rounded-xl bg-primary text-on-primary">
              <iconify-icon icon="solar:atom-bold-duotone" width="22" height="22"></iconify-icon>
            </span>
            <span class="text-lg font-semibold">Elementar<span class="text-on-surface-variant">RT</span></span>
          </a>

          @if (code()) {
            <p class="text-sm font-semibold uppercase tracking-widest text-primary">Error {{ code() }}</p>
          }
          <h1 class="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{{ heading() }}</h1>
          <p class="mt-4 max-w-md text-on-surface-variant">{{ description() }}</p>

          <div class="mt-10 flex flex-wrap items-center gap-3">
            <ng-content select="[actions]">
              <button matButton="filled" class="!h-11" type="button" (click)="goBack()">Go back</button>
              <a matButton="outlined" class="!h-11" routerLink="/dashboard/getting-started">Back to dashboard</a>
            </ng-content>
          </div>
        </div>

        <div
          class="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex"
          [class]="panelClass()"
          aria-hidden="true">
          <iconify-icon [icon]="icon()" width="180" height="180" class="relative z-10 opacity-90"></iconify-icon>
          @if (code()) {
            <span class="absolute select-none text-[22rem] font-bold leading-none opacity-10">{{ code() }}</span>
          }
          <span class="pointer-events-none absolute -right-20 -top-24 size-96 rounded-full bg-white/10 blur-3xl"></span>
          <span class="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/10 blur-3xl"></span>
        </div>
      </main>
    } @else {
      <main class="grid min-h-screen place-items-center bg-surface px-6 py-16 text-on-surface">
        <div class="w-full max-w-md text-center">
          <span class="mx-auto grid size-16 place-items-center rounded-2xl" [class]="badgeClass()">
            <iconify-icon [icon]="icon()" width="34" height="34"></iconify-icon>
          </span>

          @if (code()) {
            <p class="mt-8 text-7xl font-bold tracking-tight">{{ code() }}</p>
          }
          <h1 class="mt-3 text-2xl font-semibold" [class.mt-8]="!code()">{{ heading() }}</h1>
          <p class="mt-2 text-sm text-on-surface-variant">{{ description() }}</p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ng-content select="[actions]">
              <button matButton="filled" class="!h-11" type="button" (click)="goBack()">Go back</button>
              <a matButton="outlined" class="!h-11" routerLink="/dashboard/getting-started">Back to dashboard</a>
            </ng-content>
          </div>
        </div>
      </main>
    }
  `
})
export class ErrorPageComponent {
  readonly code = input<string>();
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input('solar:danger-triangle-bold-duotone');
  readonly variant = input<ErrorVariant>('centered');
  readonly tone = input<ErrorTone>('primary');

  protected readonly badgeClass = computed(() => TONE_BADGE[this.tone()]);
  protected readonly panelClass = computed(() => TONE_PANEL[this.tone()]);

  protected goBack(): void {
    history.back();
  }
}

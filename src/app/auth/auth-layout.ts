import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Split-screen shell for all auth pages: a branded promo panel (hidden on small
 * screens) beside the routed form panel.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex min-h-screen bg-surface text-on-surface">
      <!-- Brand panel -->
      <aside
        aria-label="About Elementar RT"
        class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-on-primary lg:flex">
        <div class="flex items-center gap-2.5">
          <span class="grid size-9 place-items-center rounded-xl bg-on-primary/15">
            <iconify-icon icon="solar:atom-bold-duotone" width="22" height="22"></iconify-icon>
          </span>
          <span class="text-lg font-semibold">Elementar<span class="opacity-85">RT</span></span>
        </div>
        <div class="relative z-10 max-w-md">
          <h2 class="text-3xl font-semibold leading-tight">Build beautiful admin experiences, faster.</h2>
          <p class="mt-4 text-on-primary/80">
            An open-source, MIT-licensed Angular admin template with 100+ components,
            dashboards, and applications — ready for your next product.
          </p>
        </div>
        <div class="flex items-center gap-3 text-sm text-on-primary/85">
          <iconify-icon icon="solar:shield-check-bold" width="18" height="18"></iconify-icon>
          MIT licensed · Free forever
        </div>
        <div class="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-on-primary/10 blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-on-primary/10 blur-2xl"></div>
      </aside>

      <!-- Form panel -->
      <div class="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div class="w-full max-w-sm">
          <main class="w-full"><router-outlet /></main>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}

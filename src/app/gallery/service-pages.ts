import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageComponent } from '../shell/page/page';
import { IntegrationsService } from './mock-data';

type Health = 'operational' | 'degraded' | 'down';

const HEALTH: Record<Health, { label: string; dot: string; chip: string }> = {
  operational: { label: 'Operational', dot: 'bg-green-500', chip: 'bg-green-container text-on-green-container' },
  degraded: { label: 'Degraded', dot: 'bg-orange-500', chip: 'bg-orange-container text-on-orange-container' },
  down: { label: 'Down', dot: 'bg-red-500', chip: 'bg-red-container text-on-red-container' }
};

@Component({
  selector: 'app-gallery-service-pages',
  imports: [PageComponent, RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (variant() === 'email-activation') {
      <app-page>
        <div class="mx-auto max-w-md py-12 text-center">
          <span class="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
            <iconify-icon icon="solar:letter-opened-bold-duotone" width="34" height="34"></iconify-icon>
          </span>

          @if (!activated()) {
            <h1 class="mt-6 text-2xl font-semibold text-on-surface">Confirm your email</h1>
            <p class="mt-2 text-sm text-on-surface-variant">
              We sent a confirmation link to
              <span class="font-medium text-on-surface">r.tulika&#64;narz.net</span>. Open it to finish
              activating your account.
            </p>

            <button matButton="filled" type="button" class="!mt-8 !h-11 w-full" (click)="activate()">
              I've confirmed it
            </button>

            <div class="mt-6 text-sm text-on-surface-variant">
              @if (secondsLeft() > 0) {
                Resend available in {{ secondsLeft() }}s
              } @else {
                Didn't get it?
                <button type="button" class="font-medium text-primary hover:underline" (click)="resend()">
                  Send it again
                </button>
              }
            </div>
          } @else {
            <h1 class="mt-6 text-2xl font-semibold text-on-surface">Email confirmed</h1>
            <p class="mt-2 text-sm text-on-surface-variant">
              Your account is fully activated. Everything is unlocked.
            </p>
            <a routerLink="/dashboard/getting-started" matButton="filled" class="!mt-8 !flex !h-11 w-full">
              Go to dashboard
            </a>
          }

          <p class="mt-8 text-xs text-on-surface-variant">
            Wrong address?
            <a routerLink="/account/settings/my-profile" class="font-medium text-primary hover:underline">
              Change it in your profile
            </a>
          </p>
        </div>
      </app-page>
    } @else {
      <app-page title="Integration status" description="Live health for everything connected to this workspace.">
        <div class="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-5">
          <span class="grid size-11 place-items-center rounded-xl" [class]="overall().chip">
            <iconify-icon
              [icon]="overallHealth() === 'operational' ? 'solar:check-circle-bold-duotone' : 'solar:danger-triangle-bold-duotone'"
              width="24"
              height="24"></iconify-icon>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-base font-semibold text-on-surface">
              {{ overallHealth() === 'operational' ? 'All systems operational' : 'Some services are degraded' }}
            </p>
            <p class="text-sm text-on-surface-variant">
              {{ connected().length }} integrations connected · checked a moment ago
            </p>
          </div>
          <button matButton="outlined" type="button" (click)="recheck()">Re-check</button>
        </div>

        <div class="overflow-hidden rounded-2xl border border-outline-variant bg-surface">
          <ul class="divide-y divide-outline-variant">
            @for (item of connected(); track item.id) {
              <li class="flex flex-wrap items-center gap-4 p-4">
                <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-container-highest">
                  <iconify-icon [icon]="item.icon" width="22" height="22"></iconify-icon>
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-on-surface">{{ item.name }}</p>
                  <p class="text-xs text-on-surface-variant">{{ item.blurb }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full" [class]="health(item.id).dot"></span>
                  <span class="text-sm text-on-surface-variant">{{ health(item.id).label }}</span>
                </div>

                <span class="w-20 shrink-0 text-right text-xs tabular-nums text-on-surface-variant">
                  {{ latency(item.id) }}ms
                </span>
              </li>
            } @empty {
              <li class="px-4 py-16 text-center text-sm text-on-surface-variant">
                Nothing connected yet.
                <a routerLink="/integrations" class="font-medium text-primary hover:underline">Browse integrations</a>.
              </li>
            }
          </ul>
        </div>
      </app-page>
    }
  `
})
export class GalleryServicePagesComponent {
  private readonly integrations = inject(IntegrationsService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly variant = toSignal(
    inject(ActivatedRoute).data.pipe(
      map((data) => (data['variant'] as 'email-activation' | 'integrations') ?? 'email-activation')
    ),
    { initialValue: 'email-activation' as const }
  );

  /* --- email activation --- */
  protected readonly activated = signal(false);
  protected readonly secondsLeft = signal(30);

  constructor() {
    const timer = setInterval(() => this.secondsLeft.update((s) => (s > 0 ? s - 1 : 0)), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected activate(): void {
    this.activated.set(true);
  }

  protected resend(): void {
    this.secondsLeft.set(30);
    this.snackBar.open('Confirmation email sent again', 'Dismiss', { duration: 3000 });
  }

  /* --- integration status --- */
  protected readonly connected = computed(() =>
    this.integrations.integrations().filter((item) => item.connected)
  );

  /** Deterministic per-id so the page does not flicker between renders. */
  protected health(id: string): { label: string; dot: string; chip: string } {
    return HEALTH[this.healthOf(id)];
  }

  protected latency(id: string): number {
    return 40 + (this.hash(id) % 160);
  }

  protected readonly overallHealth = computed<Health>(() =>
    this.connected().some((item) => this.healthOf(item.id) !== 'operational') ? 'degraded' : 'operational'
  );

  protected readonly overall = computed(() => HEALTH[this.overallHealth()]);

  protected recheck(): void {
    this.snackBar.open('Re-checked all integrations', 'Dismiss', { duration: 2500 });
  }

  private healthOf(id: string): Health {
    const value = this.hash(id) % 10;
    if (value === 0) return 'down';
    if (value < 3) return 'degraded';
    return 'operational';
  }

  private hash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    return hash;
  }
}

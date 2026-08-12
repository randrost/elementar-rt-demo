import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

const RESEND_SECONDS = 30;

/**
 * Confirmation screen shown after requesting a reset link. The link would arrive by
 * email; here the "open the link" action just continues to set-new-password.
 */
@Component({
  selector: 'app-password-reset',
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <span class="mb-6 grid size-12 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
      <iconify-icon icon="solar:letter-opened-bold-duotone" width="26" height="26"></iconify-icon>
    </span>

    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-on-surface">Check your email</h1>
      <p class="mt-1.5 text-sm text-on-surface-variant">
        We sent a password reset link to
        <span class="font-medium text-on-surface">{{ email() }}</span>. The link expires in 60 minutes.
      </p>
    </div>

    <a routerLink="/auth/set-new-password" matButton="filled" class="!flex !h-11 w-full">Open the reset link</a>

    <div class="mt-6 text-center text-sm text-on-surface-variant">
      @if (secondsLeft() > 0) {
        <span>Resend available in {{ secondsLeft() }}s</span>
      } @else {
        Didn't get the email?
        <button type="button" class="font-medium text-primary hover:underline" (click)="resend()">Resend it</button>
      }
    </div>

    @if (resentCount() > 0 && secondsLeft() > 0) {
      <p
        class="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-green-container px-3 py-2 text-xs text-on-green-container"
        role="status">
        <iconify-icon icon="solar:check-circle-bold" width="15" height="15"></iconify-icon>
        A new link is on its way.
      </p>
    }

    <a
      routerLink="/auth/sign-in"
      class="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface">
      <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
      Back to sign in
    </a>
  `
})
export class PasswordResetComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly email = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('email') || 'your inbox')),
    { initialValue: 'your inbox' }
  );

  protected readonly secondsLeft = signal(RESEND_SECONDS);
  protected readonly resentCount = signal(0);

  constructor() {
    const timer = setInterval(() => this.secondsLeft.update((s) => (s > 0 ? s - 1 : 0)), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected resend(): void {
    this.resentCount.update((n) => n + 1);
    this.secondsLeft.set(RESEND_SECONDS);
  }
}

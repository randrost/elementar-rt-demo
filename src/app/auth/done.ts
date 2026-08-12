import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

interface Outcome {
  title: string;
  body: string;
  cta: string;
  ctaLink: string;
}

const OUTCOMES: Record<string, Outcome> = {
  password: {
    title: 'Password updated',
    body: 'Your new password is active. Other devices have been signed out.',
    cta: 'Sign in',
    ctaLink: '/auth/sign-in'
  },
  account: {
    title: "You're all set",
    body: 'Your workspace is ready. Invitations are on their way to your teammates.',
    cta: 'Go to dashboard',
    ctaLink: '/dashboard/getting-started'
  },
  verified: {
    title: 'Email verified',
    body: 'Thanks for confirming your address — your account is fully activated.',
    cta: 'Go to dashboard',
    ctaLink: '/dashboard/getting-started'
  }
};

/** Terminal success screen for the auth flows; the copy varies by `?flow=`. */
@Component({
  selector: 'app-auth-done',
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex flex-col items-center text-center">
      <span class="grid size-16 place-items-center rounded-full bg-green-container text-on-green-container">
        <iconify-icon icon="solar:check-circle-bold-duotone" width="36" height="36"></iconify-icon>
      </span>

      <h1 class="mt-6 text-2xl font-semibold text-on-surface">{{ outcome().title }}</h1>
      <p class="mt-2 text-sm text-on-surface-variant">{{ outcome().body }}</p>

      <a [routerLink]="outcome().ctaLink" matButton="filled" class="!mt-8 !flex !h-11 w-full">
        {{ outcome().cta }}
      </a>

      <a
        routerLink="/applications/help-center/home"
        class="mt-6 text-sm font-medium text-on-surface-variant hover:text-on-surface">
        Need a hand? Visit the help center
      </a>
    </div>
  `
})
export class AuthDoneComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly flow = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('flow') ?? 'account')), {
    initialValue: 'account'
  });

  protected readonly outcome = computed(() => OUTCOMES[this.flow()] ?? OUTCOMES['account']);
}

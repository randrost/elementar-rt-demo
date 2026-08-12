import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PasswordMeterComponent } from '../../auth/password-strength';

interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  scope: string;
  connected: boolean;
}

@Component({
  selector: 'app-account-security',
  imports: [FormsModule, MatButtonModule, PasswordMeterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex flex-col gap-5">
      <!-- Password -->
      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <h2 class="text-base font-semibold text-on-surface">Change password</h2>
        <p class="mt-1 text-sm text-on-surface-variant">
          Changing it signs you out of every other device.
        </p>

        <div class="mt-5 grid max-w-md gap-4">
          <div>
            <label class="block text-xs font-medium text-on-surface-variant" for="current-pw">Current password</label>
            <input
              id="current-pw"
              type="password"
              [(ngModel)]="current"
              autocomplete="current-password"
              class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>

          <div>
            <label class="block text-xs font-medium text-on-surface-variant" for="new-pw">New password</label>
            <input
              id="new-pw"
              type="password"
              [(ngModel)]="next"
              autocomplete="new-password"
              class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
            <div class="mt-2">
              <app-password-meter [value]="next()" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-on-surface-variant" for="confirm-pw">Confirm new password</label>
            <input
              id="confirm-pw"
              type="password"
              [(ngModel)]="confirm"
              autocomplete="new-password"
              class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
            @if (confirm() && confirm() !== next()) {
              <p class="mt-1.5 text-xs text-red-600 dark:text-red-400">Both passwords must match.</p>
            }
          </div>
        </div>

        <div class="mt-6">
          <button matButton="filled" type="button" [disabled]="!canSubmit()" (click)="changePassword()">
            Update password
          </button>
        </div>
      </section>

      <!-- Two-factor -->
      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-on-surface">Two-factor authentication</h2>
            <p class="mt-1 max-w-md text-sm text-on-surface-variant">
              A second step at sign-in. We recommend an authenticator app over SMS.
            </p>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            [class]="twoFactor() ? 'bg-green-container text-on-green-container' : 'bg-surface-container-highest text-on-surface-variant'">
            {{ twoFactor() ? 'On' : 'Off' }}
          </span>
        </div>

        <div class="mt-5 flex flex-col divide-y divide-outline-variant">
          @for (method of methods; track method.id) {
            <div class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-container text-on-primary-container">
                <iconify-icon [icon]="method.icon" width="19" height="19"></iconify-icon>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-on-surface">{{ method.name }}</p>
                <p class="text-xs text-on-surface-variant">{{ method.scope }}</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="enabled(method.id)"
                [attr.aria-label]="method.name"
                class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                [class]="enabled(method.id) ? 'bg-primary' : 'bg-surface-container-highest'"
                (click)="toggleMethod(method.id)">
                <span
                  class="absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]"
                  [style.left.px]="enabled(method.id) ? 22 : 2"></span>
              </button>
            </div>
          }
        </div>
      </section>

      <!-- Connected apps -->
      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <h2 class="text-base font-semibold text-on-surface">Connected apps</h2>
        <p class="mt-1 text-sm text-on-surface-variant">Third parties with access to your workspace.</p>

        <div class="mt-5 flex flex-col divide-y divide-outline-variant">
          @for (app of apps(); track app.id) {
            <div class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-container-highest">
                <iconify-icon [icon]="app.icon" width="19" height="19"></iconify-icon>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-on-surface">{{ app.name }}</p>
                <p class="text-xs text-on-surface-variant">{{ app.scope }}</p>
              </div>
              <button matButton type="button" [class.!text-error]="app.connected" (click)="toggleApp(app.id)">
                {{ app.connected ? 'Revoke' : 'Connect' }}
              </button>
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class AccountSecurityComponent {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly current = signal('');
  protected readonly next = signal('');
  protected readonly confirm = signal('');

  protected readonly methods = [
    { id: 'app', name: 'Authenticator app', icon: 'solar:smartphone-2-bold-duotone', scope: 'Time-based codes from an app you control.' },
    { id: 'key', name: 'Hardware key', icon: 'solar:key-bold-duotone', scope: 'A physical security key over WebAuthn.' },
    { id: 'sms', name: 'SMS codes', icon: 'solar:chat-round-bold-duotone', scope: 'Least secure; use only as a fallback.' }
  ];

  private readonly enabledMethods = signal<Record<string, boolean>>({ app: true, key: false, sms: false });

  protected readonly apps = signal<ConnectedApp[]>([
    { id: 'github', name: 'GitHub', icon: 'logos:github-icon', scope: 'Reads repository metadata for deploy status.', connected: true },
    { id: 'figma', name: 'Figma', icon: 'logos:figma', scope: 'Embeds design files in the content editor.', connected: true },
    { id: 'slack', name: 'Slack', icon: 'logos:slack-icon', scope: 'Posts notifications to a channel.', connected: false }
  ]);

  protected twoFactor(): boolean {
    return Object.values(this.enabledMethods()).some(Boolean);
  }

  protected enabled(id: string): boolean {
    return this.enabledMethods()[id] ?? false;
  }

  protected toggleMethod(id: string): void {
    this.enabledMethods.update((current) => ({ ...current, [id]: !current[id] }));
  }

  protected toggleApp(id: string): void {
    this.apps.update((list) =>
      list.map((app) => (app.id === id ? { ...app, connected: !app.connected } : app))
    );
  }

  protected canSubmit(): boolean {
    return !!this.current() && this.next().length >= 8 && this.next() === this.confirm();
  }

  protected changePassword(): void {
    if (!this.canSubmit()) return;
    this.current.set('');
    this.next.set('');
    this.confirm.set('');
    this.snackBar.open('Password updated. Other sessions signed out.', 'Dismiss', { duration: 4000 });
  }
}

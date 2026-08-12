import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService, DeviceSession } from '../mock-data';

@Component({
  selector: 'app-account-sessions',
  imports: [MatButtonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="rounded-2xl border border-outline-variant bg-surface p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-on-surface">Active sessions</h2>
          <p class="mt-1 text-sm text-on-surface-variant">
            Devices signed in to your account. Revoking one signs it out immediately.
          </p>
        </div>
        <button
          matButton="outlined"
          type="button"
          class="!text-error"
          [disabled]="others() === 0"
          (click)="confirmAll.set(true)">
          Revoke all others
        </button>
      </div>

      <div class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[34rem] text-sm">
          <thead>
            <tr class="border-b border-outline-variant text-left text-xs uppercase tracking-wide text-on-surface-variant">
              <th class="pb-3 font-medium">Device</th>
              <th class="pb-3 font-medium">Location</th>
              <th class="pb-3 font-medium">Last active</th>
              <th class="w-24 pb-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            @for (session of store.sessions(); track session.id) {
              <tr class="border-b border-outline-variant last:border-0">
                <td class="py-3.5 pr-4">
                  <div class="flex items-center gap-2.5">
                    <iconify-icon [icon]="icon(session)" width="20" height="20" class="shrink-0 text-on-surface-variant"></iconify-icon>
                    <div class="min-w-0">
                      <p class="flex items-center gap-2 font-medium text-on-surface">
                        {{ session.device }}
                        @if (session.current) {
                          <span class="rounded-full bg-green-container px-2 py-0.5 text-[11px] font-medium text-on-green-container">
                            This device
                          </span>
                        }
                      </p>
                      <p class="text-xs text-on-surface-variant">{{ session.browser }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 pr-4">
                  <p class="text-on-surface">{{ session.location }}</p>
                  <p class="text-xs tabular-nums text-on-surface-variant">{{ session.ip }}</p>
                </td>
                <td class="py-3.5 pr-4 text-on-surface-variant">
                  {{ session.current ? 'Now' : (session.lastActive | date: 'MMM d, HH:mm') }}
                </td>
                <td class="py-3.5 text-right">
                  @if (!session.current) {
                    <button matButton type="button" class="!text-error" (click)="pending.set(session)">
                      Revoke
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- Confirm -->
    @if (pending() || confirmAll()) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="cancel()" aria-label="Cancel"></button>
        <div class="relative w-full max-w-sm rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl">
          <h2 class="text-base font-semibold text-on-surface">
            {{ confirmAll() ? 'Revoke all other sessions?' : 'Revoke this session?' }}
          </h2>
          <p class="mt-2 text-sm text-on-surface-variant">
            @if (confirmAll()) {
              {{ others() }} devices will be signed out. This device stays signed in.
            } @else {
              {{ pending()?.device }} will be signed out immediately.
            }
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <button matButton type="button" (click)="cancel()">Cancel</button>
            <button matButton="filled" type="button" (click)="revoke()">Revoke</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AccountSessionsComponent {
  protected readonly store = inject(AccountService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly pending = signal<DeviceSession | null>(null);
  protected readonly confirmAll = signal(false);

  protected others(): number {
    return this.store.sessions().filter((session) => !session.current).length;
  }

  protected icon(session: DeviceSession): string {
    if (/iphone|android|pixel/i.test(session.device)) return 'solar:smartphone-2-linear';
    if (/ipad|tablet/i.test(session.device)) return 'solar:tablet-linear';
    return 'solar:laptop-linear';
  }

  protected cancel(): void {
    this.pending.set(null);
    this.confirmAll.set(false);
  }

  protected revoke(): void {
    if (this.confirmAll()) {
      const count = this.others();
      for (const session of this.store.sessions()) {
        if (!session.current) this.store.revokeSession(session.id);
      }
      this.snackBar.open(`${count} sessions revoked`, 'Dismiss', { duration: 3000 });
    } else {
      const session = this.pending();
      if (session) {
        this.store.revokeSession(session.id);
        this.snackBar.open(`${session.device} signed out`, 'Dismiss', { duration: 3000 });
      }
    }
    this.cancel();
  }
}

import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageComponent } from '../../shell/page/page';

type Tone = 'info' | 'success' | 'warning' | 'error';

const TONE: Record<Tone, { icon: string; band: string; chip: string }> = {
  info: { icon: 'solar:info-circle-bold-duotone', band: 'border-blue-500', chip: 'bg-blue-container text-on-blue-container' },
  success: { icon: 'solar:check-circle-bold-duotone', band: 'border-green-500', chip: 'bg-green-container text-on-green-container' },
  warning: { icon: 'solar:danger-triangle-bold-duotone', band: 'border-orange-500', chip: 'bg-orange-container text-on-orange-container' },
  error: { icon: 'solar:close-circle-bold-duotone', band: 'border-red-500', chip: 'bg-red-container text-on-red-container' }
};

@Component({
  selector: 'app-gallery-notifications',
  imports: [PageComponent, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="Notifications" description="Inline banners, toasts, and the empty case.">
      <div class="flex flex-col gap-8">
        <section>
          <h2 class="mb-4 text-sm font-semibold text-on-surface">Banners</h2>
          <div class="flex flex-col gap-3">
            @for (item of banners; track item.tone) {
              @if (!dismissed().includes(item.tone)) {
                <div
                  class="flex items-start gap-3 rounded-xl border border-l-4 border-outline-variant bg-surface p-4"
                  [class]="tone(item.tone).band"
                  role="status">
                  <iconify-icon
                    [icon]="tone(item.tone).icon"
                    width="22"
                    height="22"
                    class="mt-0.5 shrink-0"
                    [class]="textTone(item.tone)"></iconify-icon>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-on-surface">{{ item.title }}</p>
                    <p class="mt-0.5 text-sm text-on-surface-variant">{{ item.body }}</p>
                    @if (item.action) {
                      <button matButton type="button" class="!mt-2 -ml-2">{{ item.action }}</button>
                    }
                  </div>
                  <button
                    type="button"
                    class="grid size-8 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    (click)="dismiss(item.tone)"
                    [attr.aria-label]="'Dismiss ' + item.title">
                    <iconify-icon icon="solar:close-circle-linear" width="17" height="17"></iconify-icon>
                  </button>
                </div>
              }
            }
          </div>
          @if (dismissed().length) {
            <button matButton="outlined" type="button" class="!mt-3" (click)="dismissed.set([])">
              Restore dismissed
            </button>
          }
        </section>

        <section>
          <h2 class="mb-4 text-sm font-semibold text-on-surface">Toasts</h2>
          <p class="mb-4 text-sm text-on-surface-variant">
            Transient confirmations. Use these for results, not for anything the user must read.
          </p>
          <div class="flex flex-wrap gap-2">
            @for (item of banners; track item.tone) {
              <button matButton="outlined" type="button" (click)="toast(item.title)">
                {{ item.tone }} toast
              </button>
            }
            <button matButton="outlined" type="button" (click)="toastWithAction()">With action</button>
          </div>
        </section>

        <section>
          <h2 class="mb-4 text-sm font-semibold text-on-surface">Compact list</h2>
          <div class="max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface">
            <ul class="divide-y divide-outline-variant">
              @for (item of banners; track item.tone) {
                <li class="flex items-start gap-3 p-4">
                  <span class="grid size-8 shrink-0 place-items-center rounded-lg" [class]="tone(item.tone).chip">
                    <iconify-icon [icon]="tone(item.tone).icon" width="16" height="16"></iconify-icon>
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-on-surface">{{ item.title }}</p>
                    <p class="mt-0.5 text-xs text-on-surface-variant">{{ item.body }}</p>
                  </div>
                </li>
              }
            </ul>
          </div>
        </section>
      </div>
    </app-page>
  `
})
export class GalleryNotificationsComponent {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly dismissed = signal<Tone[]>([]);

  protected readonly banners: readonly { tone: Tone; title: string; body: string; action?: string }[] = [
    { tone: 'info', title: 'Maintenance on Sunday', body: 'A database upgrade runs 02:00–04:00 UTC. Expect brief read-only periods.', action: 'Status page' },
    { tone: 'success', title: 'Invoice paid', body: 'INV-2451 was settled. A receipt is on its way to your billing address.' },
    { tone: 'warning', title: 'Card expiring soon', body: 'The card ending 4242 expires next month. Update it to avoid an interruption.', action: 'Update card' },
    { tone: 'error', title: 'Sync failed', body: 'The Stripe integration could not refresh its token. Reconnecting fixes this.', action: 'Reconnect' }
  ];

  protected tone(value: Tone) {
    return TONE[value];
  }

  protected textTone(value: Tone): string {
    return {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-orange-500',
      error: 'text-red-500'
    }[value];
  }

  protected dismiss(value: Tone): void {
    this.dismissed.update((list) => [...list, value]);
  }

  protected toast(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 3000 });
  }

  protected toastWithAction(): void {
    this.snackBar
      .open('Post moved to trash', 'Undo', { duration: 5000 })
      .onAction()
      .subscribe(() => this.snackBar.open('Restored', 'Dismiss', { duration: 2000 }));
  }
}

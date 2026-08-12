import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AccountService,
  CHANNEL_LABELS,
  PREF_CHANNELS,
  PREF_ROWS,
  PrefChannel
} from '../mock-data';

/**
 * Two presentations of the same preference matrix: a wide table, and a stacked
 * card list for the compact variant. The route picks which via `data.variant`.
 */
@Component({
  selector: 'app-notification-prefs',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="rounded-2xl border border-outline-variant bg-surface p-6">
      <h2 class="text-base font-semibold text-on-surface">Notification preferences</h2>
      <p class="mt-1 text-sm text-on-surface-variant">
        Choose how each kind of event reaches you. Security notices cannot be turned off entirely.
      </p>

      @if (variant() === 'table') {
        <div class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[32rem] text-sm">
            <thead>
              <tr class="border-b border-outline-variant text-left text-xs uppercase tracking-wide text-on-surface-variant">
                <th class="pb-3 font-medium">Event</th>
                @for (channel of channels; track channel) {
                  <th class="w-24 pb-3 text-center font-medium">{{ label(channel) }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of rows; track row.key) {
                <tr class="border-b border-outline-variant last:border-0">
                  <td class="py-3.5 pr-4">
                    <p class="font-medium text-on-surface">{{ row.label }}</p>
                    <p class="text-xs text-on-surface-variant">{{ row.hint }}</p>
                  </td>
                  @for (channel of channels; track channel) {
                    <td class="py-3.5 text-center">
                      <button
                        type="button"
                        role="switch"
                        [attr.aria-checked]="on(row.key, channel)"
                        [attr.aria-label]="row.label + ' via ' + label(channel)"
                        class="relative h-6 w-11 rounded-full transition-colors"
                        [class]="on(row.key, channel) ? 'bg-primary' : 'bg-surface-container-highest'"
                        (click)="toggle(row.key, channel)">
                        <span
                          class="absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]"
                          [style.left.px]="on(row.key, channel) ? 22 : 2"></span>
                      </button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="mt-6 flex flex-col gap-3">
          @for (row of rows; track row.key) {
            <div class="rounded-xl border border-outline-variant p-4">
              <p class="text-sm font-medium text-on-surface">{{ row.label }}</p>
              <p class="mt-0.5 text-xs text-on-surface-variant">{{ row.hint }}</p>
              <div class="mt-3 flex flex-wrap gap-1.5">
                @for (channel of channels; track channel) {
                  <button
                    type="button"
                    class="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                    [class]="
                      on(row.key, channel)
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                    "
                    [attr.aria-pressed]="on(row.key, channel)"
                    (click)="toggle(row.key, channel)">
                    {{ label(channel) }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }

      <div class="mt-6 flex justify-end">
        <button matButton="filled" type="button" (click)="save()">Save preferences</button>
      </div>
    </section>
  `
})
export class NotificationPrefsComponent {
  private readonly store = inject(AccountService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rows = PREF_ROWS;
  protected readonly channels = PREF_CHANNELS;

  protected readonly variant = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['variant'] as 'table' | 'cards') ?? 'table')),
    { initialValue: 'table' as const }
  );

  protected readonly prefs = computed(() => this.store.preferences());

  protected label(channel: PrefChannel): string {
    return CHANNEL_LABELS[channel];
  }

  protected on(row: string, channel: PrefChannel): boolean {
    return this.prefs()[`${row}.${channel}`] ?? false;
  }

  protected toggle(row: string, channel: PrefChannel): void {
    const key = `${row}.${channel}`;
    this.store.setPreference(key, !this.on(row, channel));
  }

  protected save(): void {
    this.snackBar.open('Preferences saved', 'Dismiss', { duration: 3000 });
  }
}

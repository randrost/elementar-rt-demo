import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService, COOKIE_CATEGORIES } from '../mock-data';

@Component({
  selector: 'app-account-cookie',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="rounded-2xl border border-outline-variant bg-surface p-6">
      <h2 class="text-base font-semibold text-on-surface">Cookie preferences</h2>
      <p class="mt-1 max-w-2xl text-sm text-on-surface-variant">
        Strictly necessary cookies keep you signed in and cannot be switched off. Everything else is
        your call, and you can change it whenever you like.
      </p>

      <div class="mt-6 flex flex-col gap-3">
        @for (category of categories; track category.key) {
          <div class="flex items-start gap-4 rounded-xl border border-outline-variant p-4">
            <div class="min-w-0 flex-1">
              <p class="flex flex-wrap items-center gap-2 text-sm font-medium text-on-surface">
                {{ category.title }}
                @if (category.required) {
                  <span class="rounded-full bg-surface-container-highest px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
                    Always on
                  </span>
                }
              </p>
              <p class="mt-1 text-sm text-on-surface-variant">{{ category.description }}</p>
            </div>

            <button
              type="button"
              role="switch"
              [attr.aria-checked]="on(category.key)"
              [attr.aria-label]="category.title"
              [disabled]="category.required"
              class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60"
              [class]="on(category.key) ? 'bg-primary' : 'bg-surface-container-highest'"
              (click)="toggle(category.key, category.required)">
              <span
                class="absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]"
                [style.left.px]="on(category.key) ? 22 : 2"></span>
            </button>
          </div>
        }
      </div>

      <div class="mt-6 flex flex-wrap justify-end gap-2">
        <button matButton type="button" (click)="rejectAll()">Reject optional</button>
        <button matButton="outlined" type="button" (click)="acceptAll()">Accept all</button>
        <button matButton="filled" type="button" (click)="save()">Save choices</button>
      </div>
    </section>
  `
})
export class AccountCookieComponent {
  private readonly store = inject(AccountService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly categories = COOKIE_CATEGORIES;

  protected on(key: string): boolean {
    return this.store.cookieConsent()[key] ?? false;
  }

  protected toggle(key: string, required: boolean): void {
    if (required) return;
    this.store.setCookie(key, !this.on(key));
  }

  protected acceptAll(): void {
    for (const category of COOKIE_CATEGORIES) this.store.setCookie(category.key, true);
    this.snackBar.open('All cookies accepted', 'Dismiss', { duration: 3000 });
  }

  protected rejectAll(): void {
    for (const category of COOKIE_CATEGORIES) {
      this.store.setCookie(category.key, category.required);
    }
    this.snackBar.open('Optional cookies rejected', 'Dismiss', { duration: 3000 });
  }

  protected save(): void {
    this.snackBar.open('Cookie choices saved', 'Dismiss', { duration: 3000 });
  }
}

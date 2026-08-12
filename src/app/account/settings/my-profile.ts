import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvatarService } from '../../core/avatar.service';

const SEEDS = ['rostyslav-tulika', 'nova', 'atlas', 'juno', 'orion', 'vesta'];

@Component({
  selector: 'app-my-profile',
  imports: [FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex flex-col gap-5">
      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <h2 class="text-base font-semibold text-on-surface">Photo</h2>
        <p class="mt-1 text-sm text-on-surface-variant">Pick an avatar, or upload your own.</p>

        <div class="mt-5 flex flex-wrap items-center gap-4">
          <img [src]="avatar(seed())" alt="" class="size-20 rounded-full bg-surface-container" />
          <div class="flex flex-wrap gap-2">
            @for (option of seeds; track option) {
              <button
                type="button"
                class="rounded-full ring-offset-2 ring-offset-surface transition-all"
                [class]="seed() === option ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'"
                (click)="seed.set(option)"
                [attr.aria-label]="'Use avatar ' + option"
                [attr.aria-pressed]="seed() === option">
                <img [src]="avatar(option)" alt="" class="size-11 rounded-full bg-surface-container" />
              </button>
            }
          </div>
          <button matButton="outlined" type="button" (click)="upload()">
            <iconify-icon icon="solar:upload-linear" width="17" height="17" class="mr-1.5"></iconify-icon>
            Upload
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-outline-variant bg-surface p-6">
        <h2 class="text-base font-semibold text-on-surface">Details</h2>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          @for (field of fields; track field.key) {
            <div [class.sm:col-span-2]="field.wide">
              <label class="block text-xs font-medium text-on-surface-variant" [attr.for]="field.key">
                {{ field.label }}
              </label>
              @if (field.multiline) {
                <textarea
                  [id]="field.key"
                  rows="3"
                  [ngModel]="value(field.key)"
                  (ngModelChange)="set(field.key, $event)"
                  class="mt-1.5 w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"></textarea>
              } @else {
                <input
                  [id]="field.key"
                  [ngModel]="value(field.key)"
                  (ngModelChange)="set(field.key, $event)"
                  class="mt-1.5 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
              }
            </div>
          }
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button matButton type="button" (click)="reset()">Reset</button>
          <button matButton="filled" type="button" (click)="save()">Save profile</button>
        </div>
      </section>
    </div>
  `
})
export class MyProfileComponent {
  private readonly avatars = inject(AvatarService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly seeds = SEEDS;
  protected readonly seed = signal(SEEDS[0]);

  protected readonly fields = [
    { key: 'name', label: 'Full name', wide: false, multiline: false },
    { key: 'title', label: 'Job title', wide: false, multiline: false },
    { key: 'email', label: 'Email', wide: false, multiline: false },
    { key: 'phone', label: 'Phone', wide: false, multiline: false },
    { key: 'location', label: 'Location', wide: false, multiline: false },
    { key: 'website', label: 'Website', wide: false, multiline: false },
    { key: 'bio', label: 'Bio', wide: true, multiline: true }
  ];

  private readonly defaults: Record<string, string> = {
    name: 'Rostyslav Tulika',
    title: 'Product Engineer',
    email: 'rostik.tulika@gmail.com',
    phone: '+44 20 7946 0123',
    location: 'London, UK',
    website: 'https://elementar-rt.dev',
    bio: 'Building an open-source admin template, one phase at a time.'
  };

  private readonly form = signal<Record<string, string>>({ ...this.defaults });

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected value(key: string): string {
    return this.form()[key] ?? '';
  }

  protected set(key: string, value: string): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  protected save(): void {
    this.snackBar.open('Profile saved', 'Dismiss', { duration: 3000 });
  }

  protected reset(): void {
    this.form.set({ ...this.defaults });
    this.seed.set(SEEDS[0]);
    this.snackBar.open('Changes discarded', 'Dismiss', { duration: 3000 });
  }

  protected upload(): void {
    this.snackBar.open('Upload is simulated in this demo', 'Dismiss', { duration: 3000 });
  }
}

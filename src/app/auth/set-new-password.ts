import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PasswordMeterComponent } from './password-strength';
import { matchFields, strongPassword } from './validators';

@Component({
  selector: 'app-set-new-password',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PasswordMeterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <span class="mb-6 grid size-12 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
      <iconify-icon icon="solar:lock-password-unlocked-bold-duotone" width="26" height="26"></iconify-icon>
    </span>

    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-on-surface">Set a new password</h1>
      <p class="mt-1.5 text-sm text-on-surface-variant">
        Choose a password you haven't used before. You'll be signed out everywhere else.
      </p>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-1">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="mb-2">
        <mat-label>New password</mat-label>
        <input
          matInput
          [type]="show() ? 'text' : 'password'"
          formControlName="password"
          autocomplete="new-password" />
        <button
          matIconButton
          matSuffix
          type="button"
          (click)="show.set(!show())"
          [attr.aria-label]="show() ? 'Hide password' : 'Show password'">
          <iconify-icon
            [icon]="show() ? 'solar:eye-closed-linear' : 'solar:eye-linear'"
            width="20"
            height="20"></iconify-icon>
        </button>
      </mat-form-field>

      <app-password-meter [value]="password()" />

      <mat-form-field appearance="outline">
        <mat-label>Confirm new password</mat-label>
        <input matInput type="password" formControlName="confirm" autocomplete="new-password" />
        @if (form.controls.confirm.touched && form.controls.confirm.hasError('mismatch')) {
          <mat-error>Both passwords must match.</mat-error>
        }
      </mat-form-field>

      <button matButton="filled" type="submit" class="!h-11 w-full" [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="20" />
        } @else {
          Update password
        }
      </button>
    </form>
  `
})
export class SetNewPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly show = signal(false);
  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, strongPassword()]],
      confirm: ['', [Validators.required]]
    },
    { validators: matchFields('password', 'confirm') }
  );

  protected readonly password = toSignal(this.form.controls.password.valueChanges, {
    initialValue: ''
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    setTimeout(() => this.router.navigate(['/auth/done'], { queryParams: { flow: 'password' } }), 900);
  }
}

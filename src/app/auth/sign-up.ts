import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PasswordMeterComponent } from './password-strength';
import { strongPassword } from './validators';

@Component({
  selector: 'app-sign-up',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    PasswordMeterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-on-surface">Create your account</h1>
      <p class="mt-1.5 text-sm text-on-surface-variant">Start your 14-day trial. No card required.</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-1">
      <mat-form-field appearance="outline">
        <mat-label>Full name</mat-label>
        <input matInput formControlName="name" autocomplete="name" placeholder="Ada Lovelace" />
        @if (form.controls.name.touched && form.controls.name.invalid) {
          <mat-error>Tell us what to call you.</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Work email</mat-label>
        <input matInput type="email" formControlName="email" autocomplete="email" placeholder="you@company.com" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <mat-error>Enter a valid email address.</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="mb-2">
        <mat-label>Password</mat-label>
        <input
          matInput
          [type]="showPassword() ? 'text' : 'password'"
          formControlName="password"
          autocomplete="new-password" />
        <button
          matIconButton
          matSuffix
          type="button"
          (click)="showPassword.set(!showPassword())"
          [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
          <iconify-icon
            [icon]="showPassword() ? 'solar:eye-closed-linear' : 'solar:eye-linear'"
            width="20"
            height="20"></iconify-icon>
        </button>
      </mat-form-field>

      <app-password-meter [value]="password()" />

      <mat-checkbox formControlName="terms" class="mb-3 text-sm">
        I agree to the <a href="#" class="text-primary hover:underline">Terms</a> and
        <a href="#" class="text-primary hover:underline">Privacy Policy</a>
      </mat-checkbox>

      <button matButton="filled" type="submit" class="!h-11 w-full" [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="20" />
        } @else {
          Create account
        }
      </button>
    </form>

    <div class="my-6 flex items-center gap-3 text-xs text-on-surface-variant">
      <span class="h-px flex-1 bg-outline-variant"></span>OR<span class="h-px flex-1 bg-outline-variant"></span>
    </div>

    <div class="flex gap-3">
      <button matButton="outlined" class="!h-11 flex-1">
        <iconify-icon icon="logos:google-icon" width="18" height="18" class="mr-2"></iconify-icon>Google
      </button>
      <button matButton="outlined" class="!h-11 flex-1">
        <iconify-icon icon="logos:github-icon" width="18" height="18" class="mr-2"></iconify-icon>GitHub
      </button>
    </div>

    <p class="mt-8 text-center text-sm text-on-surface-variant">
      Already have an account?
      <a routerLink="/auth/sign-in" class="font-medium text-primary hover:underline">Sign in</a>
    </p>
  `
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPassword()]],
    terms: [false, [Validators.requiredTrue]]
  });

  /** Mirrors the password control into a signal so the meter updates as you type. */
  protected readonly password = toSignal(this.form.controls.password.valueChanges, {
    initialValue: ''
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    setTimeout(() => this.router.navigate(['/auth/create-account']), 900);
  }
}

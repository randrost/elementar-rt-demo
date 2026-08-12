import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-forgot-password',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <span class="mb-6 grid size-12 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
      <iconify-icon icon="solar:key-minimalistic-square-2-bold-duotone" width="26" height="26"></iconify-icon>
    </span>

    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-on-surface">Forgot your password?</h1>
      <p class="mt-1.5 text-sm text-on-surface-variant">
        Enter the email on your account and we'll send a link to reset it.
      </p>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-1">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" autocomplete="email" placeholder="you@example.com" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <mat-error>Enter a valid email address.</mat-error>
        }
      </mat-form-field>

      <button matButton="filled" type="submit" class="!h-11 w-full" [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="20" />
        } @else {
          Send reset link
        }
      </button>
    </form>

    <a
      routerLink="/auth/sign-in"
      class="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface">
      <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16"></iconify-icon>
      Back to sign in
    </a>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const email = this.form.controls.email.value;
    setTimeout(() => this.router.navigate(['/auth/password-reset'], { queryParams: { email } }), 900);
  }
}

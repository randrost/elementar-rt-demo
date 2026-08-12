import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-on-surface">Welcome back</h1>
      <p class="mt-1.5 text-sm text-on-surface-variant">Sign in to your account to continue.</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-1">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" autocomplete="email" placeholder="you@example.com" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <mat-error>Enter a valid email address.</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
        <button matIconButton matSuffix type="button" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
          <iconify-icon [icon]="showPassword() ? 'solar:eye-closed-linear' : 'solar:eye-linear'" width="20" height="20"></iconify-icon>
        </button>
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <mat-error>Password is required.</mat-error>
        }
      </mat-form-field>

      <div class="mb-2 flex items-center justify-between">
        <mat-checkbox formControlName="remember" class="text-sm">Remember me</mat-checkbox>
        <a routerLink="/auth/forgot-password" class="text-sm font-medium text-primary hover:underline">Forgot password?</a>
      </div>

      <button matButton="filled" type="submit" class="!h-11 w-full" [disabled]="loading()">
        @if (loading()) { <mat-spinner diameter="20" /> } @else { Sign in }
      </button>
    </form>

    <div class="my-6 flex items-center gap-3 text-xs text-on-surface-variant">
      <span class="h-px flex-1 bg-outline-variant"></span>OR<span class="h-px flex-1 bg-outline-variant"></span>
    </div>

    <div class="flex gap-3">
      <button matButton="outlined" class="!h-11 flex-1"><iconify-icon icon="logos:google-icon" width="18" height="18" class="mr-2"></iconify-icon>Google</button>
      <button matButton="outlined" class="!h-11 flex-1"><iconify-icon icon="logos:github-icon" width="18" height="18" class="mr-2"></iconify-icon>GitHub</button>
    </div>

    <p class="mt-8 text-center text-sm text-on-surface-variant">
      Don't have an account?
      <a routerLink="/auth/sign-up" class="font-medium text-primary hover:underline">Sign up</a>
    </p>
  `
})
export class SignInComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [true]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    setTimeout(() => this.router.navigate(['/dashboard/getting-started']), 900);
  }
}

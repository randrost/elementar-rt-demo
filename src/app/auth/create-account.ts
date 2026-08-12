import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AvatarService } from '../core/avatar.service';
import { StepperComponent } from '../shared/stepper/stepper';
import { slugify } from './validators';

const AVATAR_SEEDS = ['nova', 'atlas', 'juno', 'orion', 'vesta', 'lyra'];
const TEAM_SIZES = ['Just me', '2–10 people', '11–50 people', '51–200 people', '200+ people'];
const INDUSTRIES = ['Software', 'E-commerce', 'Finance', 'Healthcare', 'Education', 'Media', 'Other'];

/**
 * Post-signup setup wizard. Renders as its own full-width page (not in the split
 * auth layout) because the steps need more room than the sign-in form column.
 */
@Component({
  selector: 'app-create-account',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    StepperComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="min-h-screen bg-surface-container-low text-on-surface">
      <header class="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <span class="flex items-center gap-2.5">
          <span class="grid size-9 place-items-center rounded-xl bg-primary text-on-primary">
            <iconify-icon icon="solar:atom-bold-duotone" width="22" height="22"></iconify-icon>
          </span>
          <span class="text-lg font-semibold">Elementar<span class="text-on-surface-variant">RT</span></span>
        </span>
        <a routerLink="/auth/sign-in" class="text-sm font-medium text-on-surface-variant hover:text-on-surface">
          Sign in instead
        </a>
      </header>

      <main class="mx-auto w-full max-w-3xl px-6 pb-16">
        <div class="rounded-3xl border border-outline-variant bg-surface p-6 sm:p-10">
          <app-stepper class="mb-10 block" [steps]="steps" [current]="step()" ariaLabel="Account setup" />

          @switch (step()) {
            @case (0) {
              <section [formGroup]="profile">
                <h1 class="text-xl font-semibold">Tell us about you</h1>
                <p class="mt-1.5 text-sm text-on-surface-variant">
                  This is how you'll appear to teammates across the workspace.
                </p>

                <p class="mb-3 mt-8 text-sm font-medium">Pick an avatar</p>
                <div class="flex flex-wrap gap-3">
                  @for (seed of avatarSeeds; track seed) {
                    <button
                      type="button"
                      class="rounded-full ring-offset-2 ring-offset-surface transition-all"
                      [class]="
                        profile.controls.avatarSeed.value === seed
                          ? 'ring-2 ring-primary'
                          : 'opacity-70 hover:opacity-100'
                      "
                      (click)="profile.controls.avatarSeed.setValue(seed)"
                      [attr.aria-label]="'Use avatar ' + seed"
                      [attr.aria-pressed]="profile.controls.avatarSeed.value === seed">
                      <img [src]="avatar(seed)" alt="" class="size-14 rounded-full bg-surface-container" />
                    </button>
                  }
                </div>

                <div class="mt-8 grid gap-1 sm:grid-cols-2 sm:gap-x-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Full name</mat-label>
                    <input matInput formControlName="name" autocomplete="name" placeholder="Ada Lovelace" />
                    @if (profile.controls.name.touched && profile.controls.name.invalid) {
                      <mat-error>Enter your name.</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Job title</mat-label>
                    <input matInput formControlName="title" placeholder="Product Designer" />
                    @if (profile.controls.title.touched && profile.controls.title.invalid) {
                      <mat-error>Enter your role.</mat-error>
                    }
                  </mat-form-field>
                </div>
              </section>
            }

            @case (1) {
              <section [formGroup]="workspace">
                <h1 class="text-xl font-semibold">Set up your workspace</h1>
                <p class="mt-1.5 text-sm text-on-surface-variant">
                  You can rename it or add more workspaces later.
                </p>

                <div class="mt-8 grid gap-1 sm:grid-cols-2 sm:gap-x-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Workspace name</mat-label>
                    <input matInput formControlName="name" placeholder="Acme Inc." />
                    @if (workspace.controls.name.touched && workspace.controls.name.invalid) {
                      <mat-error>Give the workspace a name.</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Workspace URL</mat-label>
                    <input matInput formControlName="slug" (input)="slugEdited = true" placeholder="acme" />
                    <span matTextSuffix class="text-on-surface-variant">.elementar.app</span>
                    @if (workspace.controls.slug.touched && workspace.controls.slug.invalid) {
                      <mat-error>Use lowercase letters, numbers, and dashes.</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Team size</mat-label>
                    <mat-select formControlName="size">
                      @for (size of teamSizes; track size) {
                        <mat-option [value]="size">{{ size }}</mat-option>
                      }
                    </mat-select>
                    @if (workspace.controls.size.touched && workspace.controls.size.invalid) {
                      <mat-error>Pick a team size.</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Industry</mat-label>
                    <mat-select formControlName="industry">
                      @for (industry of industries; track industry) {
                        <mat-option [value]="industry">{{ industry }}</mat-option>
                      }
                    </mat-select>
                    @if (workspace.controls.industry.touched && workspace.controls.industry.invalid) {
                      <mat-error>Pick an industry.</mat-error>
                    }
                  </mat-form-field>
                </div>
              </section>
            }

            @case (2) {
              <section>
                <h1 class="text-xl font-semibold">Invite your team</h1>
                <p class="mt-1.5 text-sm text-on-surface-variant">
                  Add the people you work with most — or skip and invite them later.
                </p>

                <div class="mt-8 flex flex-col gap-1" [formGroup]="inviteForm">
                  @for (control of invites.controls; track $index; let i = $index) {
                    <div class="flex items-start gap-2">
                      <mat-form-field appearance="outline" class="flex-1">
                        <mat-label>Teammate email</mat-label>
                        <input matInput type="email" [formControl]="control" placeholder="teammate@company.com" />
                        @if (control.touched && control.invalid) {
                          <mat-error>Enter a valid email address.</mat-error>
                        }
                      </mat-form-field>
                      <button
                        matIconButton
                        type="button"
                        class="!mt-2"
                        [disabled]="invites.length === 1"
                        (click)="removeInvite(i)"
                        [attr.aria-label]="'Remove invite ' + (i + 1)">
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="18" height="18"></iconify-icon>
                      </button>
                    </div>
                  }
                </div>

                <button
                  matButton
                  type="button"
                  class="-ml-2"
                  [disabled]="invites.length >= 5"
                  (click)="addInvite()">
                  <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
                  Add another
                </button>
              </section>
            }
          }

          <footer class="mt-10 flex items-center justify-between gap-3 border-t border-outline-variant pt-6">
            <button matButton type="button" [disabled]="step() === 0" (click)="back()">Back</button>

            <div class="flex items-center gap-2">
              @if (step() === 2) {
                <button matButton type="button" (click)="finish(true)">Skip for now</button>
              }
              <button matButton="filled" type="button" class="!h-11 !px-6" [disabled]="saving()" (click)="next()">
                @if (saving()) {
                  <mat-spinner diameter="20" />
                } @else {
                  {{ step() === 2 ? 'Finish setup' : 'Continue' }}
                }
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  `
})
export class CreateAccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly avatars = inject(AvatarService);

  protected readonly steps = ['Your profile', 'Workspace', 'Invite team'];
  protected readonly avatarSeeds = AVATAR_SEEDS;
  protected readonly teamSizes = TEAM_SIZES;
  protected readonly industries = INDUSTRIES;

  protected readonly step = signal(0);
  protected readonly saving = signal(false);
  /** Once the user types their own URL we stop deriving it from the workspace name. */
  protected slugEdited = false;

  protected readonly profile = this.fb.nonNullable.group({
    avatarSeed: [AVATAR_SEEDS[0]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    title: ['', [Validators.required]]
  });

  protected readonly workspace = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9-]*$/)]],
    size: ['', [Validators.required]],
    industry: ['', [Validators.required]]
  });

  protected readonly invites = this.fb.array<FormControl<string>>([this.inviteControl()]);
  protected readonly inviteForm = this.fb.group({ invites: this.invites });

  constructor() {
    this.workspace.controls.name.valueChanges.pipe(takeUntilDestroyed()).subscribe((name) => {
      if (!this.slugEdited) {
        this.workspace.controls.slug.setValue(slugify(name), { emitEvent: false });
      }
    });
  }

  protected avatar(seed: string): string {
    return this.avatars.person(seed);
  }

  protected addInvite(): void {
    if (this.invites.length < 5) this.invites.push(this.inviteControl());
  }

  protected removeInvite(index: number): void {
    if (this.invites.length > 1) this.invites.removeAt(index);
  }

  protected back(): void {
    this.step.update((s) => Math.max(0, s - 1));
  }

  protected next(): void {
    const group = this.step() === 0 ? this.profile : this.step() === 1 ? this.workspace : this.invites;
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    if (this.step() < 2) {
      this.step.update((s) => s + 1);
      return;
    }
    this.finish(false);
  }

  protected finish(skipped: boolean): void {
    if (skipped) this.invites.reset();
    this.saving.set(true);
    setTimeout(() => this.router.navigate(['/auth/done'], { queryParams: { flow: 'account' } }), 900);
  }

  private inviteControl(): FormControl<string> {
    return this.fb.nonNullable.control('', [Validators.email]);
  }
}

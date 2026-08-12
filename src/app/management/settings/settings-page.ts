import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageComponent } from '../../shell/page/page';
import { SETTINGS_GROUPS, SettingField, SettingsArea, SiteSettingsService } from './mock-data';

/**
 * One component for all five settings areas. Each area is a list of grouped
 * field descriptors, so adding a setting is a data change rather than a new
 * template.
 */
@Component({
  selector: 'app-site-settings',
  imports: [PageComponent, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page [title]="meta().title" [description]="meta().description">
      <ng-container actions>
        <button matButton type="button" (click)="reset()">Reset</button>
        <button matButton="filled" type="button" (click)="save()">Save changes</button>
      </ng-container>

      <div class="mx-auto flex max-w-3xl flex-col gap-5">
        @for (group of meta().groups; track group.title) {
          <section class="rounded-2xl border border-outline-variant bg-surface p-6">
            <h2 class="text-base font-semibold text-on-surface">{{ group.title }}</h2>
            @if (group.description) {
              <p class="mt-1 text-sm text-on-surface-variant">{{ group.description }}</p>
            }

            <div class="mt-5 flex flex-col divide-y divide-outline-variant">
              @for (field of group.fields; track field.key) {
                <div class="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div class="min-w-0 max-w-md">
                    <label class="block text-sm font-medium text-on-surface" [attr.for]="field.key">
                      {{ field.label }}
                    </label>
                    @if (field.hint) {
                      <p class="mt-0.5 text-xs text-on-surface-variant">{{ field.hint }}</p>
                    }
                  </div>

                  <div class="w-full max-w-xs shrink-0">
                    @switch (field.type) {
                      @case ('toggle') {
                        <button
                          type="button"
                          role="switch"
                          [id]="field.key"
                          [attr.aria-checked]="bool(field.key)"
                          class="relative h-6 w-11 rounded-full transition-colors"
                          [class]="bool(field.key) ? 'bg-primary' : 'bg-surface-container-highest'"
                          (click)="set(field.key, !bool(field.key))">
                          <span
                            class="absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]"
                            [style.left.px]="bool(field.key) ? 22 : 2"></span>
                        </button>
                      }
                      @case ('select') {
                        <select
                          [id]="field.key"
                          [ngModel]="text(field.key)"
                          (ngModelChange)="set(field.key, $event)"
                          class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary">
                          @for (option of field.options ?? []; track option) {
                            <option [value]="option">{{ option }}</option>
                          }
                        </select>
                      }
                      @case ('number') {
                        <input
                          [id]="field.key"
                          type="number"
                          [ngModel]="text(field.key)"
                          (ngModelChange)="set(field.key, $event)"
                          class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-primary" />
                      }
                      @case ('textarea') {
                        <textarea
                          [id]="field.key"
                          rows="3"
                          [ngModel]="text(field.key)"
                          (ngModelChange)="set(field.key, $event)"
                          class="w-full resize-none rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"></textarea>
                      }
                      @default {
                        <input
                          [id]="field.key"
                          [ngModel]="text(field.key)"
                          (ngModelChange)="set(field.key, $event)"
                          class="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        }
      </div>
    </app-page>
  `
})
export class SiteSettingsComponent {
  private readonly store = inject(SiteSettingsService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly area = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => (data['area'] as SettingsArea) ?? 'general')),
    { initialValue: 'general' as SettingsArea }
  );

  protected readonly meta = computed(() => SETTINGS_GROUPS[this.area()]);

  /** Local edits; committed to the store on save. */
  private readonly edits = signal<Record<string, string | boolean>>({});

  protected bool(key: string): boolean {
    return Boolean(this.value(key));
  }

  protected text(key: string): string {
    const value = this.value(key);
    return typeof value === 'boolean' ? String(value) : (value ?? '');
  }

  protected set(key: string, value: string | boolean): void {
    this.edits.update((current) => ({ ...current, [key]: value }));
  }

  protected save(): void {
    this.store.merge(this.edits());
    this.edits.set({});
    this.snackBar.open('Settings saved', 'Dismiss', { duration: 3000 });
  }

  protected reset(): void {
    this.edits.set({});
    this.snackBar.open('Unsaved changes discarded', 'Dismiss', { duration: 3000 });
  }

  private value(key: string): string | boolean | undefined {
    const edits = this.edits();
    return key in edits ? edits[key] : this.store.values()[key];
  }
}

export type { SettingField };

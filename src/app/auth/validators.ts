import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { passwordScore } from './password-strength';

/**
 * Group-level validator that puts a `mismatch` error on the *confirm* control so a
 * `<mat-error>` inside that field can render it. Other errors on the control are kept.
 */
export function matchFields(source: string, confirm: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(source);
    const b = group.get(confirm);
    if (!a || !b) return null;

    const errors = { ...(b.errors ?? {}) };
    if (b.value && a.value !== b.value) {
      errors['mismatch'] = true;
    } else {
      delete errors['mismatch'];
    }
    b.setErrors(Object.keys(errors).length ? errors : null);
    return null;
  };
}

/** Requires the password to satisfy at least `min` of the strength rules. */
export function strongPassword(min = 3): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    !control.value || passwordScore(control.value) >= min ? null : { weakPassword: true };
}

/** Turns a free-text name into a url-safe slug for workspace/handle fields. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

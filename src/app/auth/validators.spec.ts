import { FormBuilder } from '@angular/forms';
import { matchFields, slugify, strongPassword } from './validators';
import { passwordScore } from './password-strength';

describe('passwordScore', () => {
  it('scores an empty password at zero', () => {
    expect(passwordScore('')).toBe(0);
  });

  it('rewards length, case, digits, and symbols', () => {
    expect(passwordScore('short')).toBe(0);
    expect(passwordScore('longenough')).toBe(1);
    expect(passwordScore('LongEnough')).toBe(2);
    expect(passwordScore('LongEnough1')).toBe(3);
    expect(passwordScore('LongEnough1!')).toBe(4);
  });

  it('never exceeds four', () => {
    expect(passwordScore('Extremely!Long1Password#With$Everything')).toBe(4);
  });
});

describe('strongPassword', () => {
  const control = (value: string) => ({ value }) as never;

  it('passes an empty value so `required` owns that message', () => {
    expect(strongPassword()(control(''))).toBeNull();
  });

  it('rejects a weak password', () => {
    expect(strongPassword()(control('password'))).toEqual({ weakPassword: true });
  });

  it('accepts a password meeting the default threshold', () => {
    expect(strongPassword()(control('LongEnough1'))).toBeNull();
  });

  it('honours a custom threshold', () => {
    expect(strongPassword(4)(control('LongEnough1'))).toEqual({ weakPassword: true });
    expect(strongPassword(4)(control('LongEnough1!'))).toBeNull();
  });
});

describe('matchFields', () => {
  const fb = new FormBuilder();

  function group(password: string, confirm: string) {
    const g = fb.nonNullable.group(
      { password: [password], confirm: [confirm] },
      { validators: matchFields('password', 'confirm') }
    );
    g.updateValueAndValidity();
    return g;
  }

  it('flags a mismatch on the confirm control', () => {
    const g = group('abc', 'xyz');
    expect(g.controls.confirm.hasError('mismatch')).toBe(true);
  });

  it('clears the error once they match', () => {
    const g = group('abc', 'xyz');
    g.controls.confirm.setValue('abc');
    g.updateValueAndValidity();
    expect(g.controls.confirm.hasError('mismatch')).toBe(false);
  });

  it('stays quiet while confirm is empty', () => {
    const g = group('abc', '');
    expect(g.controls.confirm.hasError('mismatch')).toBe(false);
  });

  it('preserves other errors on the confirm control', () => {
    const g = group('abc', 'xyz');
    g.controls.confirm.setErrors({ ...g.controls.confirm.errors, custom: true });
    g.updateValueAndValidity();
    expect(g.controls.confirm.hasError('custom')).toBe(true);
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Analytical Engine Co.')).toBe('analytical-engine-co');
  });

  it('collapses runs of punctuation', () => {
    expect(slugify('a  --  b')).toBe('a-b');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  !Hello!  ')).toBe('hello');
  });

  it('caps the length', () => {
    expect(slugify('x'.repeat(80)).length).toBeLessThanOrEqual(32);
  });

  it('returns empty for punctuation only', () => {
    expect(slugify('!!!')).toBe('');
  });
});

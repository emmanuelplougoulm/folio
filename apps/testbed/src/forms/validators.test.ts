import { describe, expect, it } from 'vitest';
import { validateEmail, validatePassword } from './validators';

describe('validateEmail', () => {
  it.each([
    ['', 'validation.email.required'],
    ['   ', 'validation.email.required'],
    ['ana', 'validation.email.format'],
    ['ana@exemple', 'validation.email.format'],
    ['ana @exemple.fr', 'validation.email.format'],
    ['ana@exemple.fr', undefined],
    [' ana@exemple.es ', undefined]
  ])('« %s » → %s', (value, expected) => {
    expect(validateEmail(value)).toBe(expected);
  });
});

describe('validatePassword', () => {
  it('exige une valeur', () => {
    expect(validatePassword('')).toBe('validation.password.required');
    expect(validatePassword('x')).toBeUndefined();
  });
});

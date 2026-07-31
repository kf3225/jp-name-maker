import { describe, it, expect } from 'vitest';
import { en } from './en';
import { ja } from './ja';
import type { DictKey } from './en';

describe('dictionary keys', () => {
  const enKeys = new Set(Object.keys(en));
  const jaKeys = new Set(Object.keys(ja));

  it('has exactly 20 keys in the English dictionary', () => {
    expect(enKeys.size).toBe(20);
  });

  it('has exactly 20 keys in the Japanese dictionary', () => {
    expect(jaKeys.size).toBe(20);
  });

  it('English and Japanese share exactly the same key set', () => {
    const missingInJa = [...enKeys].filter((k) => !jaKeys.has(k));
    const missingInEn = [...jaKeys].filter((k) => !enKeys.has(k));
    expect({ missingInJa, missingInEn }).toEqual({ missingInJa: [], missingInEn: [] });
  });

  it('all English values are strings (no plural object until a count key is added)', () => {
    for (const [k, v] of Object.entries(en)) {
      expect(typeof v).toBe('string');
      void k;
    }
  });

  it('all Japanese values are strings', () => {
    for (const [k, v] of Object.entries(ja)) {
      expect(typeof v).toBe('string');
      void k;
    }
  });

  it('every dictionary key satisfies the DictKey type', () => {
    const keys: DictKey[] = Object.keys(en) as DictKey[];
    expect(keys.length).toBe(20);
  });

  it('contains the fixed UI chrome keys', () => {
    expect(enKeys.has('app.title')).toBe(true);
    expect(enKeys.has('form.name.placeholder')).toBe(true);
    expect(enKeys.has('form.roots.placeholder')).toBe(true);
    expect(enKeys.has('form.gender.placeholder')).toBe(true);
    expect(enKeys.has('form.tone.label')).toBe(true);
    expect(enKeys.has('form.submit')).toBe(true);
  });

  it('contains the tone label keys', () => {
    expect(enKeys.has('tone.traditional')).toBe(true);
    expect(enKeys.has('tone.modern')).toBe(true);
    expect(enKeys.has('tone.cute')).toBe(true);
    expect(enKeys.has('tone.cool')).toBe(true);
    expect(enKeys.has('tone.neutral')).toBe(true);
  });

  it('contains the gender label keys', () => {
    expect(enKeys.has('gender.male')).toBe(true);
    expect(enKeys.has('gender.female')).toBe(true);
    expect(enKeys.has('gender.neutral')).toBe(true);
  });

  it('contains the axis label keys', () => {
    expect(enKeys.has('axis.sound')).toBe(true);
    expect(enKeys.has('axis.meaning')).toBe(true);
    expect(enKeys.has('axis.fallback')).toBe(true);
  });

  it('contains the error code keys (ADR-0007 structured errors)', () => {
    expect(enKeys.has('error.invalid_input')).toBe(true);
    expect(enKeys.has('error.generation_failed')).toBe(true);
    expect(enKeys.has('error.unknown')).toBe(true);
  });
});

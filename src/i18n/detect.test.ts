import { describe, it, expect } from 'vitest';
import { resolveLocale, detectLocale, persistLocale, LOCALE_STORAGE_KEY } from './index';
import type { LocaleEnv, LocaleWriter } from './index';

const nav = (language: string): { readonly language: string } => ({ language });

const memoryStorage = (): {
  store: Map<string, string>;
  storage: LocaleEnv['localStorage'];
} => {
  const store = new Map<string, string>();
  const storage: LocaleEnv['localStorage'] = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
  };
  return { store, storage };
};

describe('resolveLocale', () => {
  it('resolves "ja" for a Japanese tag', () => {
    expect(resolveLocale('ja')).toBe('ja');
  });

  it('resolves "ja" for ja-JP', () => {
    expect(resolveLocale('ja-JP')).toBe('ja');
  });

  it('resolves "en" for an English tag', () => {
    expect(resolveLocale('en')).toBe('en');
  });

  it('resolves "en" for en-US', () => {
    expect(resolveLocale('en-US')).toBe('en');
  });

  it('falls back to "en" for unsupported languages (fr/de/zh/empty)', () => {
    expect(resolveLocale('fr')).toBe('en');
    expect(resolveLocale('de')).toBe('en');
    expect(resolveLocale('zh')).toBe('en');
    expect(resolveLocale('')).toBe('en');
  });

  it('is case-insensitive on the leading two characters', () => {
    expect(resolveLocale('JA')).toBe('ja');
    expect(resolveLocale('EN-US')).toBe('en');
  });
});

describe('detectLocale', () => {
  it('prefers a stored locale over navigator.language', () => {
    const { storage } = memoryStorage();
    storage.setItem(LOCALE_STORAGE_KEY, 'ja');
    expect(detectLocale({ navigator: nav('en-US'), localStorage: storage })).toBe('ja');
  });

  it('falls back to navigator.language when nothing is stored', () => {
    const { storage } = memoryStorage();
    expect(detectLocale({ navigator: nav('ja-JP'), localStorage: storage })).toBe('ja');
  });

  it('ignores a corrupted stored value and falls back to navigator.language', () => {
    const { storage } = memoryStorage();
    storage.setItem(LOCALE_STORAGE_KEY, 'fr');
    expect(detectLocale({ navigator: nav('en-US'), localStorage: storage })).toBe('en');
  });

  it('defaults to "en" when neither storage nor navigator match', () => {
    const { storage } = memoryStorage();
    expect(detectLocale({ navigator: nav('zh-CN'), localStorage: storage })).toBe('en');
  });

  it('persists across a round-trip via the injected storage', () => {
    const { storage } = memoryStorage();
    storage.setItem(LOCALE_STORAGE_KEY, 'en');
    expect(detectLocale({ navigator: nav('ja-JP'), localStorage: storage })).toBe('en');
    storage.setItem(LOCALE_STORAGE_KEY, 'ja');
    expect(detectLocale({ navigator: nav('en-US'), localStorage: storage })).toBe('ja');
  });
});

describe('persistLocale', () => {
  it('writes the locale to localStorage under jp-nm:locale', () => {
    const { storage, store } = memoryStorage();
    const doc: LocaleWriter['document'] = { documentElement: { lang: '' } };
    persistLocale('ja', { localStorage: storage, document: doc });
    expect(store.get(LOCALE_STORAGE_KEY)).toBe('ja');
  });

  it('syncs <html lang> with the locale', () => {
    const { storage } = memoryStorage();
    const doc: LocaleWriter['document'] = { documentElement: { lang: 'en' } };
    persistLocale('ja', { localStorage: storage, document: doc });
    expect(doc.documentElement.lang).toBe('ja');
  });

  it('keeps localStorage and <html lang> in lockstep for both locales', () => {
    const { storage, store } = memoryStorage();
    const doc: LocaleWriter['document'] = { documentElement: { lang: '' } };
    persistLocale('en', { localStorage: storage, document: doc });
    expect(store.get(LOCALE_STORAGE_KEY)).toBe('en');
    expect(doc.documentElement.lang).toBe('en');
    persistLocale('ja', { localStorage: storage, document: doc });
    expect(store.get(LOCALE_STORAGE_KEY)).toBe('ja');
    expect(doc.documentElement.lang).toBe('ja');
  });
});

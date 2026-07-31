import type { Locale } from '../core/schema';
import { en } from './en';
import { ja } from './ja';
import type { DictKey } from './en';

export type { Locale } from '../core/schema';
export type { DictKey } from './en';

/**
 * localStorage にユーザー選択ロケールを永続化するキー（ADR-0007）。
 */
export const LOCALE_STORAGE_KEY = 'jp-nm:locale';

const DICTIONARIES: Readonly<Record<Locale, Readonly<Record<DictKey, string>>>> = {
  en,
  ja,
};

/**
 * `detectLocale` / `persistLocale` に渡す副作用環境。
 * グローバル（`window.navigator`/`localStorage`）を直接触らず引数で注入することで、
 * テスト時は純粋関数として振る舞い、DOM/jsdom 依存を排除する。
 */
export interface LocaleEnv {
  readonly navigator: { readonly language: string };
  readonly localStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
  };
}

export interface LocaleWriter {
  readonly localStorage: { setItem(key: string, value: string): void };
  readonly document: { readonly documentElement: { lang: string } };
}

/**
 * ロケール文字列（`navigator.language` 単数を想定）を `Locale` に正規化する純粋関数。
 * 先頭2文字を小文字化し、`en`/`ja` のいずれかと前置一致するならそれを採用。
 * いずれでもなければデフォルト `en`（ADR-0007）。
 */
export const resolveLocale = (raw: string): Locale => {
  const head = raw.slice(0, 2).toLowerCase();
  if (head === 'ja') return 'ja';
  if (head === 'en') return 'en';
  return 'en';
};

/**
 * ユーザー選択ロケールを検出する（注入された副作用環境経由・実体は純粋）。
 * 優先順位: `localStorage['jp-nm:locale']` → `navigator.language` → `en`。
 * 格納値が `en`/`ja` 以外（破損・古い形式）なら無視して navigator へフォールバックする。
 */
export const detectLocale = ({ navigator, localStorage }: LocaleEnv): Locale => {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'en' || stored === 'ja') return stored;
  return resolveLocale(navigator.language);
};

/**
 * ユーザー選択ロケールを `localStorage` と `<html lang>` に反映する（副作用・引数注入でテスト可能）。
 * ADR-0007: トグルと `<html lang>` を lockstep させる（a11y + SEO）。
 */
export const persistLocale = (locale: Locale, { localStorage, document }: LocaleWriter): void => {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.documentElement.lang = locale;
};

/**
 * 辞書引き。純粋関数。
 * `params` の各キーで `{key}` プレースホルダーを置換する。
 *
 * 将来 `count` を含む複数形キーを追加する場合は、値を plural オブジェクト
 * （例: `{ one: '...', other: '...' }`）に拡張し、`new Intl.PluralRules(locale).select(count)`
 * でカテゴリを選ぶ（ADR-0007）。現状20キーは全てプレーン文字列のため本パスは未使用。
 */
export const t = (
  locale: Locale,
  key: DictKey,
  params?: Readonly<Record<string, string | number>>,
): string => {
  const dict = DICTIONARIES[locale];
  let value: string = dict[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.split(`{${k}}`).join(String(v));
    }
  }
  return value;
};

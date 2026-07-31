import { createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';
import type { ComponentChildren, VNode } from 'preact';
import type { Locale } from '../core/schema';
import { persistLocale, type LocaleWriter } from './index';

/**
 * ADR-0007: Preact Context でロケール状態を配線。
 * `@preact/signals` は使わず、標準の `useState` + Context のみ（依存追加なし・~50行の自前モジュール）。
 * `setLocale(l)` が `persistLocale()`（`localStorage.setItem('jp-nm:locale', l)` + `<html lang>` 同期）を担う。
 */
export interface LocaleContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export interface LocaleProviderProps {
  /** 検出済みの初期ロケール（`detectLocale` の結果を親で渡す）。 */
  readonly initial: Locale;
  /** 子要素。 */
  readonly children: ComponentChildren;
  /**
   * 副作用環境の上書き（テスト用）。省略時は `globalThis.localStorage` / `globalThis.document` を使う。
   */
  readonly env?: LocaleWriter;
}

export function LocaleProvider({ initial, children, env }: LocaleProviderProps): VNode {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const setLocale = (next: Locale): void => {
    setLocaleState(next);
    persistLocale(
      next,
      env ?? { localStorage: globalThis.localStorage, document: globalThis.document },
    );
  };

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

/**
 * 現在のロケールと更新関数を取得する。
 * `LocaleProvider` 配下でなければエラー（ fail-fast）。
 */
export const useLocale = (): LocaleContextValue => {
  const ctx = useContext(LocaleContext);
  if (ctx === null) {
    throw new Error('useLocale must be used within a <LocaleProvider>');
  }
  return ctx;
};

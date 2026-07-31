/**
 * 英語辞書（ADR-0007）。
 * `as const` により、キー不足はコンパイルエラーになる。
 * このキー集合が `DictKey` の真実の源（source of truth）。`ja.ts` は同じキーを全て埋める。
 *
 * 値は全てプレーン文字列。`{name}` のようなプレースホルダーは `t()` が置換する。
 * 将来 `count` を含む複数形キーを足す場合は値を `{ one, other }` の plural オブジェクトに拡張し、
 * `t()` は `Intl.PluralRules`（標準）でカテゴリを選ぶ（現状は count キーが無いので未使用）。
 */
export const en = {
  // 固定 UI クローム（6）
  'app.title': 'jp-name-maker',
  'form.name.placeholder': 'Name (e.g. John Smith)',
  'form.roots.placeholder': 'Roots / meaning (optional)',
  'form.gender.placeholder': 'Gender (optional)',
  'form.tone.label': 'Tone (optional, multi-select)',
  'form.submit': 'Generate',

  // tone ラベル（5）
  'tone.traditional': 'Traditional',
  'tone.modern': 'Modern',
  'tone.cute': 'Cute',
  'tone.cool': 'Cool',
  'tone.neutral': 'Neutral',

  // gender ラベル（3）
  'gender.male': 'Masculine',
  'gender.female': 'Feminine',
  'gender.neutral': 'Neutral',

  // axis ラベル（3）— 構造化enumのUI表示名（CONTEXT.md: 響き名/意味名/フォールバック）
  'axis.sound': 'Sound',
  'axis.meaning': 'Meaning',
  'axis.fallback': 'Fallback',

  // エラーコード（3）— ADR-0007: サーバーは code のみ、クライアントが翻訳
  'error.invalid_input': 'Please check your input and try again.',
  'error.generation_failed': 'Generation failed. Please try again.',
  'error.unknown': 'Something went wrong. Please try again.',
} as const;

export type DictKey = keyof typeof en;

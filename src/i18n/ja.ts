import type { DictKey } from './en';

/**
 * 日本語辞書（ADR-0007）。
 * `en.ts` の `DictKey` で型付けし、キー過不足をコンパイル時に防ぐ。
 * 実行時のキー集合一致は `keys.test.ts` で二重に検証する。
 */
export const ja: Readonly<Record<DictKey, string>> = {
  // 固定 UI クローム（6）
  'app.title': 'jp-name-maker',
  'form.name.placeholder': '名前 (例: John Smith)',
  'form.roots.placeholder': 'ルーツ（任意）',
  'form.gender.placeholder': '性別（任意）',
  'form.tone.label': '雰囲気（任意・複数可）',
  'form.submit': '生成',

  // tone ラベル（5）
  'tone.traditional': '伝統的',
  'tone.modern': '現代的',
  'tone.cute': 'かわいい',
  'tone.cool': 'かっこいい',
  'tone.neutral': '中性的',

  // gender ラベル（3）
  'gender.male': '男性寄り',
  'gender.female': '女性寄り',
  'gender.neutral': '中性的',

  // axis ラベル（3）
  'axis.sound': '響き名',
  'axis.meaning': '意味名',
  'axis.fallback': 'フォールバック',

  // エラーコード（3）
  'error.invalid_input': '入力内容を見直してください。',
  'error.generation_failed': '生成に失敗しました。もう一度お試しください。',
  'error.unknown': '予期しないエラーが発生しました。もう一度お試しください。',
};

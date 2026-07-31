import { Schema } from 'effect';

/**
 * 性別（CONTEXT.md「候補」生成の入力軸の1つ）。未選択を許容するため呼び出し側で optional 扱い。
 */
export const Gender = Schema.Literal('male', 'female', 'neutral');
export type Gender = Schema.Schema.Type<typeof Gender>;

/**
 * 雰囲気タグ (CONTEXT.md)。生成する名の雰囲気を指定する任意タグ5種。
 */
export const ToneTag = Schema.Literal('traditional', 'modern', 'cute', 'cool', 'neutral');
export type ToneTag = Schema.Schema.Type<typeof ToneTag>;

/**
 * 日本風の「名」(given name)。漢字表記とそのひらがな読み。
 * ドメイン不変量: kana はひらがなのみ（カタカナ/漢字/英字を拒否）、kanji は空でない。
 */
export const GivenName = Schema.Struct({
  kanji: Schema.NonEmptyString,
  kana: Schema.String.pipe(Schema.pattern(/^[\u3040-\u309f]+$/)),
});
export type GivenName = Schema.Schema.Type<typeof GivenName>;

/**
 * /generate の成功応答契約。1件の候補（名）を返す。
 */
export const GenerateResult = Schema.Struct({
  candidate: GivenName,
});
export type GenerateResult = Schema.Schema.Type<typeof GenerateResult>;

/**
 * /generate への入力スキーマ。
 * サーバー(Worker)では Effect.Schema として実行時検証に使い、
 * クライアント(Preact)では型のみを参照する（Effect ランタイムはクライアントに載せない）。
 *
 * セキュリティ: name/roots は LLM プロンプトに直接補間されるため、
 * プロンプト肥大化によるコスト/DoS を防ぐ長さ上限を設ける（tracer-bullet の最低限の硬化）。
 * より高度なサニタイズ/インジェクション対策は後続 issue で検討する。
 */
export const NAME_MAX = 100;
export const ROOTS_MAX = 500;

export const GenerateInput = Schema.Struct({
  name: Schema.String.pipe(Schema.maxLength(NAME_MAX)),
  roots: Schema.optional(Schema.String.pipe(Schema.maxLength(ROOTS_MAX))),
  gender: Schema.optional(Gender),
  tone: Schema.optional(Schema.Array(ToneTag)),
});
export type GenerateInput = Schema.Schema.Type<typeof GenerateInput>;

import { Schema } from 'effect';

/**
 * /generate への入力スキーマ。
 * サーバー(Worker)では Effect.Schema として実行時検証に使い、
 * クライアント(Preact)では型のみを参照する（Effect ランタイムはクライアントに載せない）。
 */
export const GenerateInput = Schema.Struct({
  name: Schema.String,
  roots: Schema.optional(Schema.String),
  gender: Schema.optional(
    Schema.Union(Schema.Literal('male'), Schema.Literal('female'), Schema.Literal('neutral')),
  ),
});

export type GenerateInput = Schema.Schema.Type<typeof GenerateInput>;

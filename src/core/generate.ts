import { Effect, Data, Schema } from 'effect';
import { AiClient, AiClientError } from './ai-client';
import { GivenName } from './schema';
import type { GenerateInput, Gender, ToneTag } from './schema';
import type { AiMessage } from '../worker-env';

/**
 * 名生成コアのエラー。LLM 出力が JSON でない／スキーマ違反のいずれもこれに一本化する。
 * `reason='invalid_llm_output'`。検証→再生成ループは後続 issue（ADR-0001）。
 */
export class NameGeneratorError extends Data.TaggedError('NameGeneratorError')<{
  readonly reason: 'invalid_llm_output';
  readonly cause?: unknown;
}> {}

const TONE_LABELS: Record<ToneTag, string> = {
  traditional: '伝統的',
  modern: '現代的',
  cute: 'かわいい',
  cool: 'かっこいい',
  neutral: '中性的',
};

const GENDER_LABELS: Record<Gender, string> = {
  male: '男性寄り',
  female: '女性寄り',
  neutral: '中性的',
};

const SYSTEM_PROMPT = [
  'あなたは日本の「名（given name）」の専門家。',
  '入力名の「音（発音の響き）」を手がかりに、日本風の名を1件考える。',
  '・出力は厳密な JSON `{"kanji":"結弦","kana":"ゆづる"}` のみ。説明文・マークダウン・コードブロックは一切出さない。',
  '・kanji は一般的な漢字の組み合わせ（1文字以上）。',
  '・kana はひらがなのみ（カタカナ・英字・漢字は不可）。',
  '・音の響きを第一に重視する。意味や由来は使わない。',
].join('\n');

export interface GivenNamePrompt {
  readonly messages: readonly AiMessage[];
}

/**
 * 名生成のプロンプトを組み立てる（純粋関数）。
 * 響き名軸なので「音」を強調し、ルーツ/意味は使わない（意味名軸は後続 issue）。
 */
export const buildGivenNamePrompt = (input: GenerateInput): GivenNamePrompt => {
  const lines: string[] = [SYSTEM_PROMPT];

  const toneLine =
    input.tone && input.tone.length > 0
      ? `雰囲気は ${input.tone.map((t) => TONE_LABELS[t]).join('・')} に寄せる。`
      : '雰囲気は自由（多様にばらけて）。';
  lines.push(toneLine);

  if (input.gender) {
    lines.push(`性別の響きは ${GENDER_LABELS[input.gender]}。`);
  }

  return {
    messages: [
      { role: 'system', content: lines.join('\n') },
      { role: 'user', content: `入力名: ${input.name}` },
    ],
  };
};

/**
 * 名を1件生成する（Effect コア）。
 * AiClient Tag に依存し、プロバイダは呼び出し側の Layer が提供する。
 * JSON.parse 失敗・Schema 違反を `invalid_llm_output` に一本化する。retry はしない。
 */
export const generateGivenName = (
  input: GenerateInput,
): Effect.Effect<GivenName, NameGeneratorError | AiClientError, AiClient> =>
  Effect.gen(function* () {
    const { messages } = buildGivenNamePrompt(input);
    const raw = yield* AiClient.complete(messages);
    const parsed = yield* Effect.try({
      try: () => JSON.parse(raw) as unknown,
      catch: (cause) => new NameGeneratorError({ reason: 'invalid_llm_output', cause }),
    });
    return yield* Schema.decodeUnknown(GivenName)(parsed).pipe(
      Effect.mapError(() => new NameGeneratorError({ reason: 'invalid_llm_output' })),
    );
  });

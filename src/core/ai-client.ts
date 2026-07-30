import { Effect, Data, Layer } from 'effect';
import type { Ai, AiMessage } from '../worker-env';

/**
 * AI プロバイダ境界のエラー。通信/ランタイム失敗を包む。
 */
export class AiClientError extends Data.TaggedError('AiClientError')<{
  readonly cause: unknown;
}> {}

/**
 * 名（given name）生成に使う Workers AI モデル（text-generation）。
 * 指示追従と構造化出力の安定性から instruct 系を既定とする。
 */
export const GIVEN_NAME_MODEL = '@cf/meta/llama-3.1-8b-instruct';

/**
 * LLM 呼び出しの抽象境界（Service Tag）。
 * 具体的なプロバイダ（Workers AI など）は Live Layer で差し替え可能。
 * 生成コアはこの Tag にのみ依存し、プロバイダを知らない（OCP）。
 */
export class AiClient extends Effect.Tag('AiClient')<
  AiClient,
  {
    readonly complete: (messages: readonly AiMessage[]) => Effect.Effect<string, AiClientError>;
  }
>() {}

/**
 * Workers AI binding を包む Live Layer。副作用はここに隔離する。
 */
export const AiClientLive = (ai: Ai): Layer.Layer<AiClient> =>
  Layer.succeed(
    AiClient,
    AiClient.of({
      complete: (messages) =>
        Effect.tryPromise({
          try: () => ai.run(GIVEN_NAME_MODEL, { messages }),
          catch: (cause) => new AiClientError({ cause }),
        }).pipe(Effect.map((r) => r.response)),
    }),
  );

/**
 * テスト用モック Layer。常に固定文字列を返す。
 * 生成コアの結果検証テストが AI を呼ばずに済むように。
 */
export const makeTestLayer = (response: string): Layer.Layer<AiClient> =>
  Layer.succeed(
    AiClient,
    AiClient.of({
      complete: () => Effect.succeed(response),
    }),
  );

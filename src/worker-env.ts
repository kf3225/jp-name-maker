/**
 * Workers AI バインディング（`@cf/...` text-generation 系）の最小構造型。
 * wrangler の型生成に頼らず、本アプリが必要とする表面だけを手宣言する。
 * これが `src/worker.ts` の `Env` になり、`AiClient` Layer がこれを包んで隠す（ADR-0006）。
 */
export interface AiMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export interface AiRunInput {
  readonly messages: readonly AiMessage[];
}

export interface AiRunResult {
  readonly response: string;
}

export interface Ai {
  run(model: string, input: AiRunInput): Promise<AiRunResult>;
}

export interface Env {
  readonly AI: Ai;
}

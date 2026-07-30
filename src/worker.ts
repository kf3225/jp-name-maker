import { Hono } from 'hono';
import { Effect, Exit, Schema } from 'effect';
import { GenerateInput } from './core/schema';
import { AiClientLive } from './core/ai-client';
import { generateGivenName } from './core/generate';
import type { Env } from './worker-env';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true }));

app.post('/generate', async (c) => {
  const body = await c.req.json().catch(() => ({}));

  // 入力検証（Effect.Schema）。失敗は 400 invalid_input。
  const decoded = await Effect.runPromiseExit(Schema.decodeUnknown(GenerateInput)(body));
  if (Exit.isFailure(decoded)) {
    return c.json({ error: 'invalid_input' }, 400);
  }

  // 生成コア（ADR-0001/0006）。AiClient Layer に Workers AI binding を provide する。
  const generate = generateGivenName(decoded.value).pipe(Effect.provide(AiClientLive(c.env.AI)));
  const exit = await Effect.runPromiseExit(generate);
  return Exit.isSuccess(exit)
    ? c.json({ candidate: exit.value })
    : c.json({ error: 'generation_failed' }, 500);
});

export default app;

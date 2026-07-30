import { Hono } from 'hono';
import { Effect, Schema } from 'effect';
import { GenerateInput } from './core/schema';

const app = new Hono();

app.get('/health', (c) => c.json({ ok: true }));

app.post('/generate', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  // 生成コア(ADR-0001/0006)は Effect で構成する。ここでは骨組みのみ。
  const program = Effect.gen(function* () {
    const input = yield* Schema.decode(GenerateInput)(body);
    return { candidates: [] as const, input };
  });
  const exit = await Effect.runPromiseExit(program);
  return exit._tag === 'Success' ? c.json(exit.value) : c.json({ error: 'invalid_input' }, 400);
});

export default app;

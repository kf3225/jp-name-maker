import { describe, it, expect } from 'vitest';
import { Effect, Exit, Cause } from 'effect';
import { generateGivenName, NameGeneratorError } from './generate';
import { makeTestLayer } from './ai-client';

const run = (response: string) =>
  Effect.runPromiseExit(
    generateGivenName({ name: 'John' }).pipe(Effect.provide(makeTestLayer(response))),
  );

describe('generateGivenName', () => {
  it('returns a GivenName for valid JSON', async () => {
    const exit = await run('{"kanji":"結弦","kana":"ゆづる"}');
    expect(exit._tag).toBe('Success');
    if (exit._tag === 'Success') {
      expect(exit.value).toEqual({ kanji: '結弦', kana: 'ゆづる' });
    }
  });

  it('fails with invalid_llm_output for non-JSON', async () => {
    const exit = await run('not json');
    expect(exit._tag).toBe('Failure');
    assertNameGeneratorError(exit, 'invalid_llm_output');
  });

  it('fails with invalid_llm_output for katakana kana', async () => {
    const exit = await run('{"kanji":"結弦","kana":"ユヅル"}');
    expect(exit._tag).toBe('Failure');
    assertNameGeneratorError(exit, 'invalid_llm_output');
  });

  it('fails with invalid_llm_output for empty kanji', async () => {
    const exit = await run('{"kanji":"","kana":"ゆづる"}');
    expect(exit._tag).toBe('Failure');
    assertNameGeneratorError(exit, 'invalid_llm_output');
  });
});

function assertNameGeneratorError(exit: Exit.Exit<unknown, unknown>, reason: string) {
  if (exit._tag !== 'Failure') throw new Error('expected Failure');
  const opt = Cause.failureOption(exit.cause);
  expect(opt._tag).toBe('Some');
  if (opt._tag === 'Some') {
    const e = opt.value as NameGeneratorError;
    expect(e._tag).toBe('NameGeneratorError');
    expect(e.reason).toBe(reason);
  }
}

import { describe, it, expect } from 'vitest';
import { Effect, Schema } from 'effect';
import { GenerateInput } from './schema';

describe('GenerateInput', () => {
  it('accepts an object with a name', async () => {
    const exit = await Effect.runPromiseExit(Schema.decodeUnknown(GenerateInput)({ name: 'John' }));
    expect(exit._tag).toBe('Success');
  });

  it('rejects an object missing the name', async () => {
    const exit = await Effect.runPromiseExit(Schema.decodeUnknown(GenerateInput)({}));
    expect(exit._tag).toBe('Failure');
  });
});

import { describe, it, expect } from 'vitest';
import { Effect, Schema } from 'effect';
import { Axis, GenerateInput, GivenName, Locale, NAME_MAX, ROOTS_MAX } from './schema';

describe('GenerateInput', () => {
  it('accepts an object with a name', async () => {
    const exit = await Effect.runPromiseExit(Schema.decodeUnknown(GenerateInput)({ name: 'John' }));
    expect(exit._tag).toBe('Success');
  });

  it('rejects an object missing the name', async () => {
    const exit = await Effect.runPromiseExit(Schema.decodeUnknown(GenerateInput)({}));
    expect(exit._tag).toBe('Failure');
  });

  it('accepts a tone array', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'A', tone: ['cute', 'cool'] }),
    );
    expect(exit._tag).toBe('Success');
  });

  it('rejects an invalid tone literal', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'A', tone: ['sexy'] }),
    );
    expect(exit._tag).toBe('Failure');
  });

  it('accepts name at the length limit', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'a'.repeat(NAME_MAX) }),
    );
    expect(exit._tag).toBe('Success');
  });

  it('rejects name over the length limit', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'a'.repeat(NAME_MAX + 1) }),
    );
    expect(exit._tag).toBe('Failure');
  });

  it('accepts roots at the length limit', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'A', roots: 'b'.repeat(ROOTS_MAX) }),
    );
    expect(exit._tag).toBe('Success');
  });

  it('rejects roots over the length limit', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'A', roots: 'b'.repeat(ROOTS_MAX + 1) }),
    );
    expect(exit._tag).toBe('Failure');
  });

  it('accepts a locale field when provided', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'A', locale: 'ja' }),
    );
    expect(exit._tag).toBe('Success');
  });

  it('accepts GenerateInput without a locale (backward compatible)', async () => {
    const exit = await Effect.runPromiseExit(Schema.decodeUnknown(GenerateInput)({ name: 'A' }));
    expect(exit._tag).toBe('Success');
  });

  it('rejects an invalid locale literal', async () => {
    const exit = await Effect.runPromiseExit(
      Schema.decodeUnknown(GenerateInput)({ name: 'A', locale: 'fr' }),
    );
    expect(exit._tag).toBe('Failure');
  });
});

describe('Locale', () => {
  const decode = (x: unknown) => Effect.runPromiseExit(Schema.decodeUnknown(Locale)(x));

  it('accepts "en"', async () => {
    expect((await decode('en'))._tag).toBe('Success');
  });

  it('accepts "ja"', async () => {
    expect((await decode('ja'))._tag).toBe('Success');
  });

  it('rejects "fr"', async () => {
    expect((await decode('fr'))._tag).toBe('Failure');
  });

  it('rejects an empty string', async () => {
    expect((await decode(''))._tag).toBe('Failure');
  });
});

describe('Axis', () => {
  const decode = (x: unknown) => Effect.runPromiseExit(Schema.decodeUnknown(Axis)(x));

  it('accepts "sound"', async () => {
    expect((await decode('sound'))._tag).toBe('Success');
  });

  it('accepts "meaning"', async () => {
    expect((await decode('meaning'))._tag).toBe('Success');
  });

  it('accepts "fallback"', async () => {
    expect((await decode('fallback'))._tag).toBe('Success');
  });

  it('rejects an unknown axis', async () => {
    expect((await decode('etymology'))._tag).toBe('Failure');
  });
});

describe('GivenName', () => {
  const decode = (x: unknown) => Effect.runPromiseExit(Schema.decodeUnknown(GivenName)(x));

  it('accepts valid kanji + hiragana', async () => {
    const exit = await decode({ kanji: '結弦', kana: 'ゆづる' });
    expect(exit._tag).toBe('Success');
  });

  it('rejects empty kanji', async () => {
    const exit = await decode({ kanji: '', kana: 'ゆづる' });
    expect(exit._tag).toBe('Failure');
  });

  it('rejects katakana kana', async () => {
    const exit = await decode({ kanji: '結弦', kana: 'ユヅル' });
    expect(exit._tag).toBe('Failure');
  });

  it('rejects kanji kana', async () => {
    const exit = await decode({ kanji: '結弦', kana: '結弦' });
    expect(exit._tag).toBe('Failure');
  });

  it('rejects latin kana', async () => {
    const exit = await decode({ kanji: '結弦', kana: 'yuduru' });
    expect(exit._tag).toBe('Failure');
  });
});
